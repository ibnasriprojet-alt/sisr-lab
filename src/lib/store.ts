/* Progression, rangs et hooks partagés.
   La persistance est gérée par la couche backend (Supabase ou local),
   par utilisateur — voir src/lib/backend.ts. */

import { useEffect, useState } from "react";

export interface Progress {
  xp: number;
  done: string[];
  quizzes: { moduleId: string; score: number; total: number; at: string }[];
  known: string[];
  streak: { count: number; lastDay: string };
  lastChapter: string | null;
  tutorQuestions: number;
}

export const defaultProgress = (): Progress => ({
  xp: 0,
  done: [],
  quizzes: [],
  known: [],
  streak: { count: 0, lastDay: "" },
  lastChapter: null,
  tutorQuestions: 0,
});

export const RANKS = [
  { min: 0, name: "Stagiaire helpdesk" },
  { min: 100, name: "Technicien N1" },
  { min: 250, name: "Admin junior" },
  { min: 450, name: "Admin systèmes & réseaux" },
  { min: 700, name: "Ingénieur infra" },
  { min: 1000, name: "Architecte SISR" },
  { min: 1400, name: "root@sisr" },
];

export function rankFor(xp: number) {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].min) index = i;
  const current = RANKS[index];
  const next = RANKS[index + 1] ?? null;
  const progress = next ? (xp - current.min) / (next.min - current.min) : 1;
  return { current, next, index, progress };
}

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function touchToday(p: Progress): Progress {
  const today = todayKey();
  if (p.streak.lastDay === today) return p;
  const count = p.streak.lastDay === yesterdayKey() ? p.streak.count + 1 : 1;
  return { ...p, streak: { count, lastDay: today } };
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
