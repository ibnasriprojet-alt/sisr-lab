/* ------------------------------------------------------------------ */
/*  IA réelle : client compatible OpenAI (Groq, OpenAI, autre).        */
/*  La clé API reste dans le navigateur (localStorage) et n'est        */
/*  envoyée qu'au fournisseur choisi.                                   */
/* ------------------------------------------------------------------ */

export type AIProvider = "groq" | "openai";

export type AIConfig = {
  provider: AIProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const KEY = "sisrlab:ai:config";

export const PROVIDERS: Record<
  AIProvider,
  { label: string; baseUrl: string; models: string[]; keyUrl: string; note: string }
> = {
  groq: {
    label: "Groq (recommandé, gratuit)",
    baseUrl: "https://api.groq.com/openai/v1",
    // Noms en vigueur chez Groq depuis août 2026 (les anciens llama-* sont retirés).
    models: ["openai/gpt-oss-120b", "qwen/qwen3.6-27b", "openai/gpt-oss-20b"],
    keyUrl: "https://console.groq.com/keys",
    note: "Crée une clé gratuite sur console.groq.com/keys — rapide et sans carte bancaire. Les modèles sont saisissables librement si Groq renomme les siens.",
  },
  openai: {
    label: "OpenAI / compatible",
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o-mini", "gpt-4o"],
    keyUrl: "https://platform.openai.com/api-keys",
    note: "Fonctionne avec tout fournisseur compatible OpenAI (Mistral, OpenRouter…) en changeant l'URL de base.",
  },
};

const DEPRECATED_GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-70b-8192",
  "llama3-8b-8192",
];

export function getAIConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as AIConfig;
    if (!c.apiKey || !c.baseUrl || !c.model) return null;
    // migration auto : anciens noms de modèles Groq retirés en août 2026
    if (c.provider === "groq" && DEPRECATED_GROQ_MODELS.includes(c.model)) {
      const migrated: AIConfig = { ...c, model: PROVIDERS.groq.models[0] };
      saveAIConfig(migrated);
      return migrated;
    }
    return c;
  } catch {
    return null;
  }
}

export function saveAIConfig(c: AIConfig | null): void {
  if (c) localStorage.setItem(KEY, JSON.stringify(c));
  else localStorage.removeItem(KEY);
}

export function hasAI(): boolean {
  return getAIConfig() !== null;
}

/* ----------------------------- erreurs ----------------------------- */

function friendly(status: number, body: string): string {
  if (status === 401 || status === 403)
    return "Clé API refusée (401). Vérifie ta clé dans les réglages IA.";
  if (status === 429)
    return "Quota dépassé ou trop de requêtes (429). Attends une minute ou change de modèle.";
  if (status === 404)
    return `Modèle introuvable (404) — vérifie le nom du modèle. Détail : ${body.slice(0, 120)}`;
  if (status >= 500) return "Le fournisseur IA est momentanément indisponible. Réessaie.";
  return `Erreur ${status} : ${body.slice(0, 160)}`;
}

/* --------------------------- streaming chat --------------------------- */

export async function streamChat(
  cfg: AIConfig,
  messages: ChatMsg[],
  onDelta: (chunk: string, full: string) => void,
  signal?: AbortSignal,
  opts?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        stream: true,
        temperature: opts?.temperature ?? 0.6,
        max_tokens: opts?.maxTokens ?? 2048,
      }),
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new Error("Impossible de contacter le fournisseur IA (réseau ou CORS).");
  }

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    throw new Error(friendly(res.status, body));
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta: string = json.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          full += delta;
          onDelta(delta, full);
        }
      } catch {
        /* ligne incomplète : ignorée */
      }
    }
  }
  return full;
}

/* ------------------------- prompts « professeur » ------------------------- */

const TEACHER_SYSTEM = (year: number) =>
  `Tu es NEXO, un professeur expert du BTS SIO (option SISR) et de ses matières générales ` +
  `(réseaux, systèmes Windows/Linux, virtualisation, cybersécurité, mathématiques, économie-droit, ` +
  `anglais, communication). L'élève est en ${year === 1 ? "1re année" : "2e année"}. ` +
  `Réponds toujours en français, de façon claire, structurée et concrète : ` +
  `explications simples, exemples techniques réels (commandes, configurations), ` +
  `analogies quand c'est utile, et termine par un point « à retenir ».`;

export function chatMessages(history: ChatMsg[], question: string, year: number): ChatMsg[] {
  return [...history, { role: "user" as const, content: question }].map((m, i, arr) =>
    i === 0 ? { role: "system" as const, content: TEACHER_SYSTEM(year) } : m
  ) as ChatMsg[];
}

export function buildSystemPrompt(year: number): string {
  return TEACHER_SYSTEM(year);
}

const DEPTHS: Record<string, string> = {
  express: "Rédige une fiche de révision concise (3-4 sections courtes, l'essentiel uniquement, ~250 mots).",
  standard: "Rédige un cours complet mais dense (~600 mots) avec des exemples concrets.",
  deep: "Rédige un cours approfondi (~1000 mots) : intuitions, démonstrations/exemples détaillés, pièges d'examen.",
};

export function buildCoursePrompt(
  topic: string,
  subject: string,
  year: number,
  depth: "express" | "standard" | "deep"
): string {
  return (
    `Rédige un cours sur le sujet suivant, que l'élève n'a pas compris : « ${topic} ».\n` +
    `Matière : ${subject}. Niveau : ${year === 1 ? "1re année de BTS SIO" : "2e année de BTS SIO"}.\n` +
    `${DEPTHS[depth]}\n\n` +
    `Structure impérative en markdown :\n` +
    `- un titre principal : # <titre accrocheur>\n` +
    `- une phrase d'accroche qui relie le sujet au quotidien d'un technicien\n` +
    `- des sections ## (3 à 5), avec des sous-parties ### si besoin\n` +
    `- des listes à puces -, du gras **pour les termes clés**\n` +
    `- au moins un exemple concret (commande, configuration, calcul ou mise en situation)\n` +
    `- une section ## À retenir : 3 à 5 points clés en puces\n` +
    `- une section ## Mini-quiz : 3 questions avec la réponse juste après chaque question (format « Q : … — Réponse : … »).\n` +
    `Ton pédagogique et encourageant, tutoiement, zéro jargon non expliqué.`
  );
}

/* ---------------------------- quiz généré ---------------------------- */

export type GenQuizQ = { q: string; options: string[]; answer: number; explain: string };

export async function generateQuiz(
  cfg: AIConfig,
  topic: string,
  subject: string,
  n: number,
  year: number,
  signal?: AbortSignal
): Promise<GenQuizQ[]> {
  let full = "";
  await streamChat(
    cfg,
    [
      { role: "system", content: buildSystemPrompt(year) },
      {
        role: "user",
        content:
          `Génère ${n} questions de QCM sur « ${topic} » (matière : ${subject}). ` +
          `Réponds UNIQUEMENT avec un JSON valide, sans texte autour, au format exact :\n` +
          `{"questions":[{"q":"énoncé","options":["a","b","c","d"],"answer":0,"explain":"explication courte"}]}\n` +
          `answer est l'index (0-3) de la bonne réponse dans options.`,
      },
    ],
    (_d, f) => {
      full = f;
    },
    signal,
    { temperature: 0.3, maxTokens: 1200 }
  );

  const start = full.indexOf("{");
  const end = full.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Réponse illisible — réessaie la génération du quiz.");
  const json = JSON.parse(full.slice(start, end + 1));
  const qs = json.questions;
  if (!Array.isArray(qs) || qs.length === 0) throw new Error("Le modèle n'a renvoyé aucune question.");
  return qs
    .filter((q: Partial<GenQuizQ>) => q.q && Array.isArray(q.options))
    .map((q: Partial<GenQuizQ>) => ({
      q: String(q.q),
      options: (q.options as string[]).slice(0, 4),
      answer: Math.min(Math.max(0, Number(q.answer) || 0), Math.min(3, (q.options as string[]).length - 1)),
      explain: String(q.explain ?? ""),
    }));
}
