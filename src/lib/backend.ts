/* ------------------------------------------------------------------ */
/*  Couche backend de SISR://LAB.                                      */
/*                                                                     */
/*  Deux implémentations partagent exactement la même interface :      */
/*   • SupabaseBackend — le vrai backend : authentification Supabase   */
/*     Auth, profil (année) et progression stockés en base PostgreSQL  */
/*     avec Row Level Security. Activé automatiquement dès que les     */
/*     variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont      */
/*     présentes (Vercel → Settings → Environment Variables).          */
/*   • LocalBackend — repli hors-ligne (aperçu sans clés) : mêmes      */
/*     comptes, même année, même progression, persistés sur l'appareil.*/
/*                                                                     */
/*  Le schéma SQL à exécuter dans Supabase est fourni :                */
/*  supabase/schema.sql (+ guide dans SETUP.md).                       */
/* ------------------------------------------------------------------ */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Progress, defaultProgress } from "./store";

export type Year = 1 | 2;

export interface Profile {
  id: string;
  email: string;
  name: string;
  year: Year | null;
}

export interface Backend {
  readonly mode: "cloud" | "local";
  init(): Promise<Profile | null>;
  signUp(name: string, email: string, password: string): Promise<Profile>;
  signIn(email: string, password: string): Promise<Profile>;
  signOut(): Promise<void>;
  setYear(year: Year): Promise<Profile>;
  loadProgress(userId: string): Promise<Progress>;
  saveProgress(userId: string, data: Progress): Promise<void>;
}

const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};
const SUPA_URL = env.VITE_SUPABASE_URL ?? "";
const SUPA_KEY = env.VITE_SUPABASE_ANON_KEY ?? "";

/* ============================== SUPABASE ============================== */

class SupabaseBackend implements Backend {
  readonly mode = "cloud" as const;
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(SUPA_URL, SUPA_KEY);
  }

  private async toProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.client.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error || !data) return null;
    return { id: data.id, email: data.email, name: data.display_name ?? data.email, year: data.year };
  }

  async init(): Promise<Profile | null> {
    const { data } = await this.client.auth.getSession();
    const uid = data.session?.user?.id;
    if (!uid) return null;
    const profile = await this.toProfile(uid);
    if (profile) return profile;
    // profil manquant (compte créé avant le schema) → on le recrée
    const email = data.session?.user?.email ?? "";
    await this.client.from("profiles").upsert({ id: uid, email, display_name: email.split("@")[0] });
    return { id: uid, email, name: email.split("@")[0], year: null };
  }

  async signUp(name: string, email: string, password: string): Promise<Profile> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { data: { name } }, // lu par le trigger handle_new_user (schema.sql)
    });
    if (error) throw new Error(friendlyAuthError(error.message));
    if (!data.session || !data.user) {
      throw new Error("Compte créé ! Supabase exige une confirmation e-mail : ouvre le lien reçu puis connecte-toi.");
    }
    const uid = data.user.id;
    await this.client.from("profiles").upsert({ id: uid, email, display_name: name });
    return { id: uid, email, name, year: null };
  }

  async signIn(email: string, password: string): Promise<Profile> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(friendlyAuthError(error?.message ?? "Connexion impossible."));
    const profile = await this.toProfile(data.user.id);
    if (profile) return profile;
    await this.client.from("profiles").upsert({ id: data.user.id, email, display_name: email.split("@")[0] });
    return { id: data.user.id, email, name: email.split("@")[0], year: null };
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }

  async setYear(year: Year): Promise<Profile> {
    const { data } = await this.client.auth.getSession();
    const uid = data.session?.user?.id;
    if (!uid) throw new Error("Session expirée, reconnecte-toi.");
    const { error } = await this.client.from("profiles").update({ year }).eq("id", uid);
    if (error) throw new Error("Impossible d'enregistrer l'année.");
    const profile = await this.toProfile(uid);
    if (!profile) throw new Error("Profil introuvable.");
    return profile;
  }

  async loadProgress(userId: string): Promise<Progress> {
    const { data } = await this.client.from("progress").select("data").eq("user_id", userId).maybeSingle();
    const raw = (data?.data ?? null) as Partial<Progress> | null;
    return { ...defaultProgress(), ...(raw ?? {}) };
  }

  async saveProgress(userId: string, progress: Progress): Promise<void> {
    await this.client
      .from("progress")
      .upsert({ user_id: userId, data: progress, updated_at: new Date().toISOString() });
  }
}

function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "E-mail ou mot de passe incorrect.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Un compte existe déjà avec cet e-mail — connecte-toi.";
  if (m.includes("password should be")) return "Mot de passe trop court : 6 caractères minimum.";
  if (m.includes("email") && m.includes("invalid")) return "Adresse e-mail invalide.";
  if (m.includes("rate limit")) return "Trop de tentatives, attends une minute.";
  return msg;
}

/* =============================== LOCAL =============================== */

type LocalAccount = { id: string; email: string; name: string; hash: string; year: Year | null };

const ACCOUNTS_KEY = "sisrlab:accounts";
const SESSION_KEY = "sisrlab:session";

async function sha256(text: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`sisrlab::${text}`));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return `plain::${text}`;
  }
}

class LocalBackend implements Backend {
  readonly mode = "local" as const;

  private accounts(): LocalAccount[] {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]");
    } catch {
      return [];
    }
  }
  private writeAccounts(list: LocalAccount[]) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
  }
  private publicOf(a: LocalAccount): Profile {
    return { id: a.id, email: a.email, name: a.name, year: a.year };
  }

  async init(): Promise<Profile | null> {
    const sid = localStorage.getItem(SESSION_KEY);
    if (!sid) return null;
    const acc = this.accounts().find((a) => a.id === sid);
    return acc ? this.publicOf(acc) : null;
  }

  async signUp(name: string, email: string, password: string): Promise<Profile> {
    const mail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) throw new Error("Adresse e-mail invalide.");
    if (password.length < 6) throw new Error("Mot de passe trop court : 6 caractères minimum.");
    const list = this.accounts();
    if (list.some((a) => a.email === mail)) throw new Error("Un compte existe déjà avec cet e-mail — connecte-toi.");
    const acc: LocalAccount = {
      id: `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      email: mail,
      name: name.trim() || mail.split("@")[0],
      hash: await sha256(password),
      year: null,
    };
    list.push(acc);
    this.writeAccounts(list);
    localStorage.setItem(SESSION_KEY, acc.id);
    return this.publicOf(acc);
  }

  async signIn(email: string, password: string): Promise<Profile> {
    const mail = email.trim().toLowerCase();
    const acc = this.accounts().find((a) => a.email === mail);
    if (!acc || acc.hash !== (await sha256(password))) throw new Error("E-mail ou mot de passe incorrect.");
    localStorage.setItem(SESSION_KEY, acc.id);
    return this.publicOf(acc);
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
  }

  async setYear(year: Year): Promise<Profile> {
    const sid = localStorage.getItem(SESSION_KEY);
    const list = this.accounts();
    const acc = list.find((a) => a.id === sid);
    if (!acc) throw new Error("Session expirée, reconnecte-toi.");
    acc.year = year;
    this.writeAccounts(list);
    return this.publicOf(acc);
  }

  async loadProgress(userId: string): Promise<Progress> {
    try {
      const raw = JSON.parse(localStorage.getItem(`sisrlab:progress:${userId}`) ?? "null");
      return { ...defaultProgress(), ...(raw ?? {}) };
    } catch {
      return defaultProgress();
    }
  }

  async saveProgress(userId: string, progress: Progress): Promise<void> {
    localStorage.setItem(`sisrlab:progress:${userId}`, JSON.stringify(progress));
  }
}

/* ============================== FACTORY ============================== */

let instance: Backend | null = null;

export function getBackend(): Backend {
  if (!instance) {
    instance = SUPA_URL && SUPA_KEY ? new SupabaseBackend() : new LocalBackend();
  }
  return instance;
}
