import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { MODULES } from "../data/courses";
import {
  AIConfig,
  buildCoursePrompt,
  buildSystemPrompt,
  GenQuizQ,
  generateQuiz,
  getAIConfig,
  streamChat,
} from "../lib/ai";
import { Profile, Year } from "../lib/backend";
import { Reveal, Scramble } from "../components/fx";
import {
  IconArrow,
  IconBolt,
  IconCards,
  IconCheck,
  IconCross,
  IconSpark,
  IconWand,
} from "../components/icons";
import { Nav } from "./Dashboard";

/* ----------------------- mini-parseur markdown ----------------------- */

type MBlock =
  | { t: "h1"; text: string }
  | { t: "h2"; text: string }
  | { t: "h3"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "code"; lang: string; code: string };

function parseMarkdown(md: string): MBlock[] {
  const lines = md.split("\n");
  const out: MBlock[] = [];
  let ul: string[] | null = null;
  let code: string[] | null = null;
  let codeLang = "";

  const flushUl = () => {
    if (ul && ul.length) out.push({ t: "ul", items: ul });
    ul = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (code !== null) {
      if (line.trim().startsWith("```")) {
        out.push({ t: "code", lang: codeLang, code: code.join("\n") });
        code = null;
      } else code.push(line);
      continue;
    }
    if (line.trim().startsWith("```")) {
      flushUl();
      code = [];
      codeLang = line.trim().slice(3).trim();
      continue;
    }
    if (/^\s*[-*•]\s+/.test(line)) {
      if (!ul) ul = [];
      ul.push(line.replace(/^\s*[-*•]\s+/, ""));
      continue;
    }
    flushUl();
    const h1 = line.match(/^#\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    if (h1) out.push({ t: "h1", text: h1[1] });
    else if (h2) out.push({ t: "h2", text: h2[1] });
    else if (h3) out.push({ t: "h3", text: h3[1] });
    else if (line.trim()) out.push({ t: "p", text: line.trim() });
  }
  flushUl();
  return out;
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return (
        <strong key={i} className="text-fog font-semibold">
          {p.slice(2, -2)}
        </strong>
      );
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code key={i} className="font-mono text-[0.85em] text-cy bg-cy/10 border border-cy/20 rounded px-1 py-0.5">
          {p.slice(1, -1)}
        </code>
      );
    return p;
  });
}

function CourseDoc({ md, streaming, accent }: { md: string; streaming?: boolean; accent: string }) {
  const blocks = useMemo(() => parseMarkdown(md), [md]);
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        const last = streaming && i === blocks.length - 1;
        if (b.t === "h1")
          return (
            <h1 key={i} className="font-display text-2xl sm:text-3xl font-bold tracking-tight pt-1">
              <span className={last ? "caret" : ""}>{renderInline(b.text)}</span>
            </h1>
          );
        if (b.t === "h2")
          return (
            <h2 key={i} className="font-display text-lg sm:text-xl font-bold flex items-center gap-3 pt-3">
              <span className="w-[3px] h-5 rounded-full shrink-0" style={{ background: accent }} />
              <span className={last ? "caret" : ""}>{renderInline(b.text)}</span>
            </h2>
          );
        if (b.t === "h3")
          return (
            <h3 key={i} className="font-display text-[15.5px] font-semibold text-fog pt-1">
              <span className={last ? "caret" : ""}>{renderInline(b.text)}</span>
            </h3>
          );
        if (b.t === "ul")
          return (
            <ul key={i} className="space-y-2 pl-1">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-3 text-mist leading-relaxed text-[14.5px]">
                  <span className="mt-[9px] w-1.5 h-1.5 rotate-45 shrink-0" style={{ background: accent }} />
                  <span className={last && j === b.items.length - 1 ? "caret" : ""}>{renderInline(it)}</span>
                </li>
              ))}
            </ul>
          );
        if (b.t === "code")
          return (
            <div key={i} className="rounded-lg border border-line bg-deep/80 overflow-hidden">
              {b.lang && (
                <div className="px-4 py-1.5 border-b border-line font-mono text-[10.5px] text-dim uppercase tracking-widest">
                  {b.lang}
                </div>
              )}
              <pre className="p-4 font-mono text-[12.5px] leading-relaxed text-fog/90 overflow-x-auto whitespace-pre">
                {b.code}
                {last && <span className="caret" />}
              </pre>
            </div>
          );
        return (
          <p key={i} className="text-mist leading-[1.75] text-[14.5px]">
            <span className={last ? "caret" : ""}>{renderInline(b.text)}</span>
          </p>
        );
      })}
      {streaming && blocks.length === 0 && (
        <p className="font-mono text-[12.5px] text-dim caret">rédaction en cours</p>
      )}
    </div>
  );
}

/* --------------------------- cours sauvegardés --------------------------- */

type SavedCourse = {
  id: string;
  topic: string;
  subjectId: string;
  depth: string;
  markdown: string;
  createdAt: string;
};

const DEPTHS = [
  { id: "express", label: "Fiche express", desc: "l'essentiel en 2 min" },
  { id: "standard", label: "Cours complet", desc: "le bon équilibre" },
  { id: "deep", label: "Approfondi", desc: "démonstrations & pièges" },
] as const;

export default function AICourses({
  user,
  year,
  nav,
  onOpenSettings,
  aiVersion,
}: {
  user: Profile;
  year: Year;
  nav: Nav;
  onOpenSettings: () => void;
  aiVersion: number;
}) {
  const cfg: AIConfig | null = useMemo(() => getAIConfig(), [aiVersion]);

  const [topic, setTopic] = useState("");
  const [subjectId, setSubjectId] = useState("net");
  const [depth, setDepth] = useState<"express" | "standard" | "deep">("standard");
  const [streaming, setStreaming] = useState(false);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedCourse[]>([]);
  const [savedCurrent, setSavedCurrent] = useState(false);
  const [viewing, setViewing] = useState<SavedCourse | null>(null);
  const [quiz, setQuiz] = useState<GenQuizQ[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const abortRef = useRef<AbortController | null>(null);

  const storeKey = `sisrlab:aicourses:${user.id}`;

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem(storeKey) ?? "[]"));
    } catch {
      setSaved([]);
    }
  }, [storeKey]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const subject = subjectId === "other" ? null : MODULES.find((m) => m.id === subjectId);
  const accent = subject?.color ?? "#8FB0DC";
  const subjectLabel = subject ? subject.title : "Transversal / autre";

  const generate = async () => {
    if (!cfg || !topic.trim() || streaming) return;
    setError(null);
    setQuiz(null);
    setQuizError(null);
    setPicked({});
    setViewing(null);
    setText("");
    setDone(false);
    setSavedCurrent(false);
    setStreaming(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      await streamChat(
        cfg,
        [
          { role: "system", content: buildSystemPrompt(year) },
          { role: "user", content: buildCoursePrompt(topic.trim(), subjectLabel, year, depth) },
        ],
        (_d, full) => setText(full),
        ac.signal,
        { maxTokens: depth === "deep" ? 2600 : 1800 }
      );
      setDone(true);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(e instanceof Error ? e.message : "Génération impossible.");
      else if (text) setDone(true);
    } finally {
      setStreaming(false);
    }
  };

  const stop = () => abortRef.current?.abort();

  const persist = (list: SavedCourse[]) => {
    setSaved(list);
    localStorage.setItem(storeKey, JSON.stringify(list));
  };

  const saveCourse = () => {
    if (!text || savedCurrent) return;
    const c: SavedCourse = {
      id: `c_${Date.now().toString(36)}`,
      topic: topic.trim(),
      subjectId,
      depth,
      markdown: text,
      createdAt: new Date().toISOString(),
    };
    persist([c, ...saved]);
    setSavedCurrent(true);
  };

  const deleteSaved = (id: string) => {
    persist(saved.filter((c) => c.id !== id));
    if (viewing?.id === id) setViewing(null);
  };

  const makeQuiz = async () => {
    if (!cfg || quizLoading) return;
    setQuizLoading(true);
    setQuizError(null);
    setQuiz(null);
    setPicked({});
    try {
      const qs = await generateQuiz(cfg, topic.trim() || viewing?.topic || "ce cours", subjectLabel, 4, year);
      setQuiz(qs);
    } catch (e) {
      setQuizError(e instanceof Error ? e.message : "Génération du quiz impossible.");
    } finally {
      setQuizLoading(false);
    }
  };

  const copyMd = () => {
    const md = viewing ? viewing.markdown : text;
    navigator.clipboard?.writeText(md).catch(() => {});
  };

  const shownText = viewing ? viewing.markdown : text;
  const shownDone = viewing ? true : done;

  return (
    <div>
      {/* ---------------- entête ---------------- */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="font-mono text-[12px] text-cy uppercase tracking-[0.2em] mb-2">
            studio de cours // {cfg ? cfg.model : "IA non configurée"}
          </p>
          <h1 className="font-display text-3xl sm:text-[40px] font-bold tracking-tight">
            <Scramble text="Un sujet pas compris ?" />
          </h1>
          <p className="text-mist mt-3 max-w-xl">
            Décris ce qui bloque — l'IA rédige <span className="text-fog">un cours sur mesure</span>, adapté à ton
            année ({year === 1 ? "1re" : "2e"}), avec exemples concrets et mini-quiz.
          </p>
        </div>
        {cfg ? (
          <span className="flex items-center gap-2 font-mono text-[11.5px] px-3 py-2 rounded-lg border border-mint/40 text-mint bg-mint/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-mint pulse-dot" />
            IA réelle active · {cfg.provider}
          </span>
        ) : (
          <button
            onClick={onOpenSettings}
            className="rounded-lg px-5 py-3 bg-mint text-abyss font-display font-bold text-sm flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-10px_rgba(62,207,142,0.6)] transition-all duration-300"
          >
            <IconWand className="w-4 h-4" /> Configurer l'IA (gratuit)
          </button>
        )}
      </header>

      {/* ---------------- sans clé : guide ---------------- */}
      {!cfg && (
        <Reveal>
          <div className="panel rounded-lg p-6 sm:p-8 mb-8 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-mint" />
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  n: "01",
                  t: "Obtiens une clé gratuite",
                  d: "Sur console.groq.com/keys (compte gratuit, sans carte bancaire). Groq fait tourner les modèles Llama à très haute vitesse.",
                },
                {
                  n: "02",
                  t: "Colle-la ici",
                  d: "Bouton « Configurer l'IA » → colle la clé → « Tester » puis « Enregistrer ». Elle ne quitte jamais ton navigateur.",
                },
                {
                  n: "03",
                  t: "Génère tes cours",
                  d: "Décris le sujet qui bloque, choisis la matière et la profondeur : le cours s'écrit sous tes yeux, puis tu le gardes dans ta bibliothèque.",
                },
              ].map((s, i) => (
                <div key={s.n} className={i < 2 ? "md:border-r md:border-line md:pr-6" : ""}>
                  <div className="font-mono text-[12px] text-mint">{s.n}</div>
                  <div className="font-display font-bold text-[17px] mt-2">{s.t}</div>
                  <p className="text-mist text-[13.5px] leading-relaxed mt-1.5">{s.d}</p>
                </div>
              ))}
            </div>
            <p className="font-mono text-[11px] text-dim mt-6">
              En attendant, le tuteur NEXO (connaissances embarquées) répond déjà à ~30 sujets du référentiel — et les{" "}
              <button onClick={() => nav("courses")} className="text-cy link-underline">36 chapitres du programme</button>{" "}
              restent 100 % consultables.
            </p>
          </div>
        </Reveal>
      )}

      {/* ---------------- générateur ---------------- */}
      {cfg && !viewing && (
        <Reveal>
          <div className="panel rounded-lg p-5 sm:p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-3">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                placeholder="Ex. : le calcul des masques de sous-réseau, les probabilités conditionnelles, l'accord du participe passé…"
                className="flex-1 rounded-lg border border-line bg-deep/70 px-4 py-3.5 text-[14.5px] placeholder:text-dim focus:border-mint/50 focus:outline-none transition-colors"
              />
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="rounded-lg border border-line bg-deep/70 px-4 py-3.5 font-mono text-[12.5px] focus:border-mint/50 focus:outline-none transition-colors lg:w-56"
              >
                {MODULES.map((m) => (
                  <option key={m.id} value={m.id} className="bg-deep">
                    {m.title}
                  </option>
                ))}
                <option value="other" className="bg-deep">
                  Transversal / autre
                </option>
              </select>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {DEPTHS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDepth(d.id)}
                  className={`rounded-lg border px-4 py-2 text-left transition-all duration-200 ${
                    depth === d.id ? "border-mint/60 bg-mint/[0.07]" : "border-line hover:border-line2"
                  }`}
                >
                  <span className={`block text-[13px] font-medium ${depth === d.id ? "text-mint" : "text-fog"}`}>
                    {d.label}
                  </span>
                  <span className="block font-mono text-[10.5px] text-dim">{d.desc}</span>
                </button>
              ))}
              <div className="flex-1" />
              {streaming ? (
                <button
                  onClick={stop}
                  className="rounded-lg border border-coral/50 text-coral px-5 py-3 font-display font-bold text-sm flex items-center gap-2 hover:bg-coral/10 transition-colors"
                >
                  <IconCross className="w-4 h-4" /> Arrêter
                </button>
              ) : (
                <button
                  onClick={generate}
                  disabled={!topic.trim()}
                  className="group rounded-lg bg-mint text-abyss px-6 py-3 font-display font-bold text-sm flex items-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_10px_28px_-10px_rgba(62,207,142,0.6)]"
                >
                  <IconWand className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                  Générer le cours
                </button>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* viewing : retour */}
      {viewing && (
        <button
          onClick={() => setViewing(null)}
          className="font-mono text-[12px] text-dim hover:text-cy transition-colors mb-5 flex items-center gap-2"
        >
          <IconArrow className="w-4 h-4 rotate-180" /> retour au générateur
        </button>
      )}

      {error && (
        <div className="rounded-lg border border-coral/50 bg-coral/[0.07] px-4 py-3 text-[13.5px] text-coral mb-6 pop-in flex items-start gap-2.5">
          <IconCross className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* ---------------- document ---------------- */}
      {shownText && (
        <div className="panel rounded-lg p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            <span className="font-mono text-[11px] px-2.5 py-1 rounded border" style={{ color: accent, borderColor: `${accent}55`, background: `${accent}10` }}>
              {viewing ? MODULES.find((m) => m.id === viewing.subjectId)?.title ?? "Transversal" : subjectLabel}
            </span>
            <span className="font-mono text-[11px] text-dim">
              profil {year === 1 ? "1re année" : "2e année"}
            </span>
            {streaming && (
              <span className="font-mono text-[11px] text-mint flex items-center gap-1.5">
                <span className="type-dot w-1 h-1 rounded-full bg-mint inline-block" />
                <span className="type-dot w-1 h-1 rounded-full bg-mint inline-block" />
                <span className="type-dot w-1 h-1 rounded-full bg-mint inline-block" />
                rédaction…
              </span>
            )}
          </div>

          <CourseDoc md={shownText} streaming={streaming} accent={accent} />

          {shownDone && (
            <div className="mt-8 pt-5 border-t border-line flex flex-wrap gap-2.5 pop-in">
              {!viewing && (
                <button
                  onClick={saveCourse}
                  disabled={savedCurrent}
                  className={`rounded-lg px-4 py-2.5 text-sm font-display font-bold flex items-center gap-2 transition-all duration-300 ${
                    savedCurrent
                      ? "bg-mint/15 text-mint border border-mint/40"
                      : "bg-mint text-abyss hover:-translate-y-0.5"
                  }`}
                >
                  <IconCheck className="w-4 h-4" />
                  {savedCurrent ? "Dans ta bibliothèque" : "Enregistrer dans ma bibliothèque"}
                </button>
              )}
              <button
                onClick={makeQuiz}
                disabled={quizLoading}
                className="rounded-lg border border-amber/50 text-amber px-4 py-2.5 text-sm font-display font-bold hover:bg-amber/10 transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                <IconBolt className="w-4 h-4" />
                {quizLoading ? "Génération…" : "Générer un quiz sur ce cours"}
              </button>
              <button
                onClick={copyMd}
                className="rounded-lg border border-line px-4 py-2.5 text-sm text-mist hover:text-fog hover:border-line2 transition-colors"
              >
                Copier le markdown
              </button>
              <button
                onClick={() => nav("tutor")}
                className="group rounded-lg border border-line px-4 py-2.5 text-sm text-mist hover:text-fog hover:border-line2 transition-colors flex items-center gap-2"
              >
                Continuer avec le tuteur
                <IconArrow className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}

          {/* quiz généré */}
          {quiz && (
            <div className="mt-8 pt-5 border-t border-line pop-in">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2.5">
                <IconBolt className="w-4 h-4 text-amber" /> Quiz généré par l'IA — clique sur ta réponse
              </h3>
              <div className="space-y-5">
                {quiz.map((q, qi) => {
                  const pick = picked[qi];
                  return (
                    <div key={qi}>
                      <div className="font-medium text-[14.5px] mb-2.5">
                        <span className="font-mono text-dim text-[12px] mr-2">Q{qi + 1}</span>
                        {q.q}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => {
                          const isAnswer = oi === q.answer;
                          const isPicked = pick === oi;
                          let cls = "border-line hover:border-line2 hover:bg-panel2/60";
                          if (pick !== undefined) {
                            if (isAnswer) cls = "border-mint/60 bg-mint/[0.08]";
                            else if (isPicked) cls = "border-coral/60 bg-coral/[0.07]";
                            else cls = "border-line opacity-45";
                          }
                          return (
                            <button
                              key={oi}
                              onClick={() => pick === undefined && setPicked((p) => ({ ...p, [qi]: oi }))}
                              disabled={pick !== undefined}
                              className={`text-left rounded-lg border px-3.5 py-2.5 text-[13.5px] transition-all duration-200 flex items-center gap-2.5 ${cls}`}
                            >
                              <span className="font-mono text-[11px] text-dim shrink-0">{String.fromCharCode(65 + oi)}</span>
                              {opt}
                              {pick !== undefined && isAnswer && <IconCheck className="w-4 h-4 text-mint ml-auto shrink-0" />}
                              {pick !== undefined && isPicked && !isAnswer && <IconCross className="w-4 h-4 text-coral ml-auto shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                      {pick !== undefined && q.explain && (
                        <p className="mt-2 text-[13px] text-mist border-l-2 pl-3" style={{ borderColor: accent }}>
                          {q.explain}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {quizError && (
            <p className="mt-6 text-[13px] text-coral pop-in">{quizError}</p>
          )}
        </div>
      )}

      {/* ---------------- bibliothèque ---------------- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2.5">
            <IconCards className="w-5 h-5 text-vio" /> Ma bibliothèque IA
            <span className="font-mono text-[12px] text-dim font-normal">({saved.length})</span>
          </h2>
        </div>
        {saved.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line2 px-6 py-8 text-center">
            <p className="text-mist text-sm">
              Aucun cours sauvegardé pour l'instant. Génère un cours puis clique sur « Enregistrer dans ma
              bibliothèque » — il sera disponible ici, même hors connexion.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {saved.map((c) => {
              const m = MODULES.find((mm) => mm.id === c.subjectId);
              const color = m?.color ?? "#8FB0DC";
              return (
                <div key={c.id} className="panel panel-hover rounded-lg p-5 flex flex-col relative overflow-hidden group">
                  <div className="absolute -right-7 -top-7 w-20 h-20 rounded-full opacity-[0.09]" style={{ background: color }} />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10.5px] text-dim">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                    <span className="font-mono text-[10.5px] px-2 py-0.5 rounded border" style={{ color, borderColor: `${color}55` }}>
                      {m?.code ?? "TRANS"}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-[15.5px] mt-3 leading-snug line-clamp-2">{c.topic}</h3>
                  <p className="font-mono text-[11px] text-dim mt-1.5">
                    {DEPTHS.find((d) => d.id === c.depth)?.label ?? c.depth} · {Math.round(c.markdown.length / 100) / 10}k caractères
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setViewing(c);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="rounded-lg border border-line2 px-3.5 py-2 text-[12.5px] text-cy hover:bg-cy/10 transition-colors flex items-center gap-1.5"
                    >
                      Relire <IconArrow className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteSaved(c.id)}
                      className="rounded-lg border border-line px-3 py-2 text-[12.5px] text-dim hover:text-coral hover:border-coral/40 transition-colors"
                      aria-label="Supprimer"
                    >
                      <IconCross className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
