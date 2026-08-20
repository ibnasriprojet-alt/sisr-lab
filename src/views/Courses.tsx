import { Fragment, useMemo, useState } from "react";
import {
  chaptersForYear,
  findChapter,
  modulesForYear,
  yearOf,
  Chapter,
  CourseModule,
} from "../data/courses";
import { Year } from "../lib/backend";
import { Progress } from "../lib/store";
import { Reveal, Scramble } from "../components/fx";
import {
  IconArrow,
  IconBook,
  IconCalc,
  IconCheck,
  IconClock,
  IconCube,
  IconGlobe,
  IconNet,
  IconPen,
  IconScale,
  IconServer,
  IconShield,
  IconTerminal,
  IconWand,
} from "../components/icons";
import { Nav } from "./Dashboard";

const MODULE_ICONS = {
  net: IconNet,
  server: IconServer,
  terminal: IconTerminal,
  cube: IconCube,
  shield: IconShield,
  calc: IconCalc,
  scale: IconScale,
  globe: IconGlobe,
  pen: IconPen,
};

const TECH_IDS = new Set(["net", "win", "lnx", "vir", "sec"]);

function YearBadge({ id }: { id: string }) {
  const y = yearOf(id);
  return (
    <span
      className={`font-mono text-[10.5px] px-1.5 py-0.5 rounded border ${
        y === 1 ? "text-cy border-cy/40 bg-cy/[0.07]" : "text-amber border-amber/40 bg-amber/[0.07]"
      }`}
      title={y === 1 ? "Programme de 1re année" : "Programme de 2e année"}
    >
      {y === 1 ? "1A" : "2A"}
    </span>
  );
}

function BlockView({ block, accent }: { block: Chapter["blocks"][number]; accent: string }) {
  const [copied, setCopied] = useState(false);
  if (block.t === "p") return <p className="text-mist leading-[1.75] text-[15px]">{block.text}</p>;
  if (block.t === "list")
    return (
      <ul className="space-y-2.5">
        {block.items.map((it, i) => (
          <li key={i} className="flex gap-3 text-mist leading-relaxed text-[15px]">
            <span className="mt-[9px] w-1.5 h-1.5 rotate-45 shrink-0" style={{ background: accent }} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    );
  if (block.t === "code")
    return (
      <div className="rounded-lg border border-line bg-deep/80 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-panel/60">
          <span className="font-mono text-[11px] text-dim uppercase tracking-widest">{block.lang}</span>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(block.code).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="font-mono text-[11px] text-mist hover:text-mint transition-colors"
          >
            {copied ? "✓ copié" : "copier"}
          </button>
        </div>
        <pre className="p-4 font-mono text-[12.5px] leading-relaxed text-fog/90 overflow-x-auto whitespace-pre">
          {block.code}
        </pre>
      </div>
    );
  return (
    <div className="rounded-lg border-l-[3px] px-4 py-3.5 bg-panel/50" style={{ borderColor: accent }}>
      <div className="font-mono text-[11px] uppercase tracking-widest mb-1.5" style={{ color: accent }}>
        ⚡ conseil d'admin
      </div>
      <p className="text-fog/90 text-[14px] leading-relaxed">{block.text}</p>
    </div>
  );
}

function Lesson({
  chapter,
  progress,
  onComplete,
  nav,
  year,
}: {
  chapter: Chapter & { module: CourseModule };
  progress: Progress;
  onComplete: (id: string) => void;
  nav: Nav;
  year: Year;
}) {
  const m = chapter.module;
  const Icon = MODULE_ICONS[m.icon];
  const isDone = progress.done.includes(chapter.id);
  const visible = chaptersForYear(year).filter((c) => c.module.id === m.id);
  const idx = visible.findIndex((c) => c.id === chapter.id);
  const prev = visible[idx - 1] ?? null;
  const next = visible[idx + 1] ?? null;
  const mods = modulesForYear(year);
  const nextModule = mods[mods.findIndex((mm) => mm.id === m.id) + 1] ?? null;

  return (
    <article className="max-w-3xl">
      <nav className="flex flex-wrap items-center gap-2 font-mono text-[12px] text-dim mb-6">
        <button onClick={() => nav("courses")} className="hover:text-cy transition-colors">
          cours
        </button>
        <span>/</span>
        <button
          onClick={() => nav("courses", { module: m.id })}
          className="hover:text-cy transition-colors"
          style={{ color: m.color }}
        >
          {m.code}
        </button>
        <span>/</span>
        <span className="text-mist">{chapter.id}</span>
      </nav>

      <div className="flex items-center gap-3 mb-4">
        <span
          className="w-11 h-11 rounded-lg border flex items-center justify-center shrink-0"
          style={{ borderColor: `${m.color}55`, color: m.color, background: `${m.color}12` }}
        >
          <Icon className="w-5 h-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl sm:text-[34px] font-bold leading-tight tracking-tight">
            <Scramble text={chapter.title} />
          </h1>
          <div className="flex items-center gap-3 mt-1 font-mono text-[12px] text-dim">
            <span className="flex items-center gap-1.5">
              <IconClock className="w-3.5 h-3.5" /> {chapter.minutes} min
            </span>
            <span>chapitre {idx + 1}/{visible.length}</span>
            <YearBadge id={chapter.id} />
            {isDone && (
              <span className="flex items-center gap-1 text-mint">
                <IconCheck className="w-3.5 h-3.5" /> validé (+25 XP)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-8">
        {chapter.blocks.map((b, i) => (
          <Reveal key={i} delay={Math.min(i * 60, 240)}>
            <BlockView block={b} accent={m.color} />
          </Reveal>
        ))}
      </div>

      <div className="mt-10 panel rounded-lg p-5 flex flex-wrap items-center gap-4">
        <button
          onClick={() => !isDone && onComplete(chapter.id)}
          disabled={isDone}
          className={`rounded-lg px-5 py-3 font-display font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
            isDone
              ? "bg-mint/15 text-mint border border-mint/40"
              : "bg-mint text-abyss hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-10px_rgba(62,207,142,0.6)]"
          }`}
        >
          <IconCheck className="w-4 h-4" />
          {isDone ? "Chapitre terminé" : "Marquer comme terminé · +25 XP"}
        </button>
        <div className="flex-1" />
        <div className="flex gap-3">
          {prev && (
            <button
              onClick={() => nav("courses", { chapter: prev.id })}
              className="rounded-lg border border-line px-4 py-3 text-sm text-mist hover:text-fog hover:border-line2 transition-colors"
            >
              ← {prev.title.length > 22 ? prev.title.slice(0, 22) + "…" : prev.title}
            </button>
          )}
          {next ? (
            <button
              onClick={() => nav("courses", { chapter: next.id })}
              className="group rounded-lg border border-line2 px-4 py-3 text-sm text-cy hover:bg-cy/10 transition-colors flex items-center gap-2"
            >
              suivant
              <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          ) : nextModule ? (
            <button
              onClick={() => nav("courses", { module: nextModule.id })}
              className="group rounded-lg border border-line2 px-4 py-3 text-sm text-cy hover:bg-cy/10 transition-colors flex items-center gap-2"
            >
              module suivant : {nextModule.title}
              <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function Courses({
  progress,
  nav,
  year,
  initialModule,
  initialChapter,
  onComplete,
}: {
  progress: Progress;
  nav: Nav;
  year: Year;
  initialModule?: string | null;
  initialChapter?: string | null;
  onComplete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [moduleId, setModuleId] = useState<string | null>(initialModule ?? null);
  const [chapterId, setChapterId] = useState<string | null>(initialChapter ?? null);

  const modules = useMemo(() => modulesForYear(year), [year]);
  const visibleChapters = useMemo(() => chaptersForYear(year), [year]);

  const chapter = chapterId ? findChapter(chapterId) : null;
  const activeModule = moduleId ? modules.find((m) => m.id === moduleId) ?? null : null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return visibleChapters.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.module.title.toLowerCase().includes(q) ||
        c.blocks.some(
          (b) =>
            ("text" in b && b.text.toLowerCase().includes(q)) ||
            ("items" in b && b.items.some((it) => it.toLowerCase().includes(q))) ||
            ("code" in b && b.code.toLowerCase().includes(q))
        )
    ).slice(0, 7);
  }, [query, visibleChapters]);

  /* ---------- lecteur de leçon ---------- */
  if (chapter) {
    return (
      <div key={chapter.id}>
        <Lesson chapter={chapter} progress={progress} onComplete={onComplete} nav={nav} year={year} />
      </div>
    );
  }

  /* ---------- détail d'un module ---------- */
  if (activeModule) {
    const Icon = MODULE_ICONS[activeModule.icon];
    const done = activeModule.chapters.filter((c) => progress.done.includes(c.id)).length;
    return (
      <div>
        <button
          onClick={() => {
            setModuleId(null);
            setChapterId(null);
          }}
          className="font-mono text-[12px] text-dim hover:text-cy transition-colors mb-6 flex items-center gap-2"
        >
          <IconArrow className="w-4 h-4 rotate-180" /> tous les modules
        </button>
        <Reveal>
          <div className="panel rounded-lg p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[4px]" style={{ background: activeModule.color }} />
            <div className="flex flex-wrap items-start gap-6">
              <span
                className="w-14 h-14 rounded-lg border flex items-center justify-center shrink-0 floaty"
                style={{
                  borderColor: `${activeModule.color}55`,
                  color: activeModule.color,
                  background: `${activeModule.color}12`,
                }}
              >
                <Icon className="w-7 h-7" />
              </span>
              <div className="flex-1 min-w-[240px]">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: activeModule.color }}>
                  {activeModule.code} · {done}/{activeModule.chapters.length} chapitres validés
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                  <Scramble text={activeModule.title} />
                </h1>
                <p className="text-mist mt-2.5 max-w-xl">{activeModule.tagline}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 space-y-3">
          {activeModule.chapters.map((c, i) => {
            const isDone = progress.done.includes(c.id);
            return (
              <Reveal key={c.id} delay={i * 70}>
                <button
                  onClick={() => {
                    setChapterId(c.id);
                    nav("courses", { chapter: c.id });
                  }}
                  className="w-full text-left panel panel-hover rounded-lg px-5 py-4 flex items-center gap-4 group"
                >
                  <span
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center font-mono text-[13px] font-bold shrink-0 transition-colors ${
                      isDone ? "border-mint/50 text-mint bg-mint/10" : "border-line text-dim group-hover:text-fog"
                    }`}
                  >
                    {isDone ? <IconCheck className="w-4 h-4" /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="font-display font-semibold text-[15.5px] flex items-center gap-2.5 group-hover:text-fog transition-colors">
                      {c.title}
                      <YearBadge id={c.id} />
                    </span>
                    <span className="font-mono text-[11.5px] text-dim flex items-center gap-1.5 mt-0.5">
                      <IconClock className="w-3 h-3" /> {c.minutes} min · {c.blocks.length} sections
                    </span>
                  </span>
                  <IconArrow className="w-4 h-4 text-dim transition-all duration-300 group-hover:text-cy group-hover:translate-x-1.5" />
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---------- grille des modules ---------- */
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="font-mono text-[12px] text-cy uppercase tracking-[0.2em] mb-2">
            bibliothèque // {modules.length} modules · {visibleChapters.length} chapitres ·{" "}
            {year === 1 ? "programme 1re année" : "programme complet (1A + 2A)"}
          </p>
          <h1 className="font-display text-3xl sm:text-[40px] font-bold tracking-tight leading-tight">
            <Scramble text="Cours & modules SISR" />
          </h1>
        </div>
        <div className="relative w-full sm:w-80">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un chapitre, une commande…"
            className="w-full rounded-lg border border-line bg-panel/70 px-4 py-3 text-sm placeholder:text-dim focus:border-line2 focus:outline-none transition-colors"
          />
          {results.length > 0 && (
            <div className="absolute z-30 mt-2 w-full panel rounded-lg overflow-hidden shadow-2xl pop-in">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setModuleId(r.module.id);
                    setChapterId(r.id);
                    nav("courses", { chapter: r.id });
                    setQuery("");
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-panel2 transition-colors flex items-center gap-3 border-b border-line last:border-0"
                >
                  <span className="w-1.5 h-1.5 rotate-45 shrink-0" style={{ background: r.module.color }} />
                  <span className="flex-1">
                    <span className="text-sm font-medium flex items-center gap-2">
                      {r.title} <YearBadge id={r.id} />
                    </span>
                    <span className="font-mono text-[11px] text-dim">{r.module.code}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <div className="sm:col-span-2 xl:col-span-3 flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-cy">
            modules techniques — spécialité SISR
          </span>
          <span className="flex-1 h-px bg-line" />
        </div>
        {modules.map((m, i) => {
          const Icon = MODULE_ICONS[m.icon];
          const done = m.chapters.filter((c) => progress.done.includes(c.id)).length;
          const pct = Math.round((done / m.chapters.length) * 100);
          const isGen = !TECH_IDS.has(m.id);
          const prevGen = i > 0 && !TECH_IDS.has(modules[i - 1].id);
          return (
            <Fragment key={m.id}>
              {isGen && !prevGen && (
                <div className="sm:col-span-2 xl:col-span-3 flex items-center gap-3 pt-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-vio">
                    matières générales — tronc commun
                  </span>
                  <span className="flex-1 h-px bg-line" />
                </div>
              )}
              <Reveal delay={i * 80}>
              <button
                onClick={() => {
                  setModuleId(m.id);
                  nav("courses", { module: m.id });
                }}
                className="w-full h-full text-left panel panel-hover rounded-lg p-6 flex flex-col relative overflow-hidden group"
              >
                <div
                  className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-[0.09] transition-transform duration-500 group-hover:scale-125"
                  style={{ background: m.color }}
                />
                <div className="flex items-center justify-between">
                  <span
                    className="w-11 h-11 rounded-lg border flex items-center justify-center"
                    style={{ borderColor: `${m.color}55`, color: m.color, background: `${m.color}12` }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="font-mono text-[11px] text-dim">{m.code}</span>
                </div>
                <h3 className="font-display text-xl font-bold mt-4">{m.title}</h3>
                <p className="text-mist text-sm mt-1.5 flex-1 leading-relaxed">{m.tagline}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.chapters.map((c) => (
                    <YearBadge key={c.id} id={c.id} />
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between font-mono text-[11px] text-dim mb-1.5">
                    <span>
                      {done}/{m.chapters.length} chapitres
                    </span>
                    <span style={{ color: pct === 100 ? m.color : undefined }}>{pct}%</span>
                  </div>
                  <div className="h-[6px] rounded-full bg-line/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{ width: `${pct}%`, background: m.color }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 font-mono text-[12px] text-cy">
                  {pct === 100 ? "relire le module" : done > 0 ? "continuer" : "commencer"}
                  <IconArrow className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </div>
              </button>
              </Reveal>
            </Fragment>
          );
        })}

        <Reveal delay={modules.length * 80}>
          <button
            onClick={() => nav("ai")}
            className="w-full h-full text-left rounded-lg p-6 flex flex-col border border-dashed border-line2 hover:border-cy/60 hover:bg-cy/[0.04] transition-colors group"
          >
            <span className="w-11 h-11 rounded-lg border border-cy/40 text-cy bg-cy/10 flex items-center justify-center">
              <IconWand className="w-5 h-5" />
            </span>
            <h3 className="font-display text-xl font-bold mt-4">Sujet pas compris ?</h3>
            <p className="text-mist text-sm mt-1.5 flex-1 leading-relaxed">
              Le studio IA rédige un cours sur mesure sur n'importe quel point du programme — VLAN, probabilités,
              RGPD…
            </p>
            <div className="mt-4 flex items-center gap-2 font-mono text-[12px] text-cy">
              générer un cours
              <IconArrow className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </div>
          </button>
        </Reveal>

        <Reveal delay={modules.length * 80 + 80}>
          <button
            onClick={() => nav("tutor")}
            className="w-full h-full text-left rounded-lg p-6 flex flex-col border border-dashed border-line2 hover:border-mint/60 hover:bg-mint/[0.04] transition-colors group"
          >
            <span className="w-11 h-11 rounded-lg border border-mint/40 text-mint bg-mint/10 flex items-center justify-center">
              <IconBook className="w-5 h-5" />
            </span>
            <h3 className="font-display text-xl font-bold mt-4">Un point flou ?</h3>
            <p className="text-mist text-sm mt-1.5 flex-1 leading-relaxed">
              Pose la question au tuteur IA : il répond dans le langage du référentiel et te renvoie vers le bon
              chapitre.
            </p>
            <div className="mt-4 flex items-center gap-2 font-mono text-[12px] text-mint">
              ouvrir le tuteur
              <IconArrow className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </div>
          </button>
        </Reveal>
      </div>
    </div>
  );
}
