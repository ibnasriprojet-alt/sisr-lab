import { useEffect, useMemo, useRef, useState } from "react";
import { findChapter, modulesForYear } from "../data/courses";
import { quizListForYear } from "../data/quizzes";
import { cardsForYear } from "../data/knowledge";
import { Profile, Year } from "../lib/backend";
import { Progress, rankFor, usePrefersReducedMotion } from "../lib/store";
import { CountUp, Reveal, Ring, Scramble } from "../components/fx";
import {
  IconArrow,
  IconBolt,
  IconBook,
  IconCards,
  IconCheck,
  IconFlame,
  IconTarget,
  IconTerminal,
  IconWand,
} from "../components/icons";

export type Nav = (view: string, payload?: Record<string, string>) => void;

const CONSOLE_LINES = [
  { prompt: true, text: "ping -c 1 cours.sisr.lab" },
  { prompt: false, text: "64 bytes from 10.0.10.2: icmp_seq=1 ttl=64 time=0.42 ms" },
  { prompt: true, text: "systemctl status motivation" },
  { prompt: false, text: "● motivation.service — actif (running) depuis 42 jours" },
  { prompt: true, text: "sudo apt install competences" },
  { prompt: false, text: "Lecture des paquets… 100 % — installation terminée" },
];

function ConsoleCard() {
  const reduced = usePrefersReducedMotion();
  const [lineIdx, setLineIdx] = useState(reduced ? CONSOLE_LINES.length : 0);
  const [chars, setChars] = useState(0);
  const timer = useRef<number>(0);

  useEffect(() => {
    if (reduced) return;
    if (lineIdx >= CONSOLE_LINES.length) {
      timer.current = window.setTimeout(() => {
        setLineIdx(0);
        setChars(0);
      }, 4200);
      return () => clearTimeout(timer.current);
    }
    const line = CONSOLE_LINES[lineIdx];
    if (chars < line.text.length) {
      timer.current = window.setTimeout(
        () => setChars((c) => c + (line.prompt ? 2 : 3)),
        line.prompt ? 34 : 12
      );
    } else {
      timer.current = window.setTimeout(() => {
        setLineIdx((i) => i + 1);
        setChars(0);
      }, line.prompt ? 420 : 650);
    }
    return () => clearTimeout(timer.current);
  }, [lineIdx, chars, reduced]);

  const visible = CONSOLE_LINES.slice(0, Math.min(lineIdx + 1, CONSOLE_LINES.length));

  return (
    <div className="panel rounded-lg overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-deep/70">
        <span className="w-2.5 h-2.5 rounded-full bg-coral/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-mint/70" />
        <span className="ml-2 font-mono text-[11px] text-dim">tuteur@sisrlab: ~/revision</span>
        <IconTerminal className="w-4 h-4 ml-auto text-dim" />
      </div>
      <div className="p-4 font-mono text-[12.5px] leading-relaxed min-h-[168px] text-mist">
        {visible.map((l, i) => {
          const isTyping = !reduced && i === lineIdx && lineIdx < CONSOLE_LINES.length;
          const text = isTyping ? l.text.slice(0, chars) : l.text;
          return (
            <div key={i} className={l.prompt ? "text-fog" : "opacity-80"}>
              {l.prompt && <span className="text-mint">➜&nbsp;</span>}
              <span className={isTyping ? "caret" : ""}>{text}</span>
            </div>
          );
        })}
        {reduced && <div className="text-mint mt-2">→ session prête : pose ta première question au tuteur IA.</div>}
      </div>
    </div>
  );
}

export default function Dashboard({
  progress,
  nav,
  user,
  year,
  visibleDone,
  visibleTotal,
}: {
  progress: Progress;
  nav: Nav;
  user: Profile;
  year: Year;
  visibleDone: number;
  visibleTotal: number;
}) {
  const rank = rankFor(progress.xp);
  const yearColor = year === 1 ? "#56C8E8" : "#F2B84B";
  const modules = useMemo(() => modulesForYear(year), [year]);
  const nCards = cardsForYear(year).length;
  const visibleCardIds = useMemo(() => new Set(cardsForYear(year).map((c) => c.id)), [year]);
  const nKnown = progress.known.filter((id) => visibleCardIds.has(id)).length;

  const quizAvg = useMemo(() => {
    const ids = new Set(modules.map((m) => m.id));
    const mine = progress.quizzes.filter((q) => ids.has(q.moduleId));
    if (!mine.length) return null;
    const r = mine.reduce((a, q) => a + q.score / q.total, 0);
    return Math.round((r / mine.length) * 100);
  }, [progress.quizzes, modules]);

  const last = progress.lastChapter ? findChapter(progress.lastChapter) : null;
  const lastVisible = last ? modules.some((m) => m.id === last.module.id) : false;
  const lastDone = last ? progress.done.includes(last.id) : false;

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const totalQ = quizListForYear(year).reduce((n, q) => n + q.quiz.questions.length, 0);

  return (
    <div className="space-y-8">
      {/* ---------- entête ---------- */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[12px] text-cy uppercase tracking-[0.2em] mb-2 capitalize flex items-center gap-3">
            {dateStr}
            <span
              className="font-mono text-[11px] px-2.5 py-0.5 rounded border normal-case"
              style={{ color: yearColor, borderColor: `${yearColor}55`, background: `${yearColor}12` }}
            >
              {year === 1 ? "profil 1re année" : "profil 2e année"}
            </span>
          </p>
          <h1 className="font-display text-3xl sm:text-[42px] font-bold leading-[1.05] tracking-tight">
            <Scramble text={`${greet}, ${user.name}.`} />
          </h1>
          <p className="text-mist mt-3 max-w-xl">
            Ton infrastructure de révision est en ligne.{" "}
            <span className="text-fog font-medium">{Math.max(0, visibleTotal - visibleDone)} chapitres</span>{" "}
            restent à déployer pour ton programme de {year === 1 ? "1re" : "2e"} année.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="panel rounded-lg px-4 py-2.5 flex items-center gap-2.5">
            <IconFlame className="w-5 h-5 text-amber" />
            <div>
              <div className="font-display font-bold text-lg leading-none">
                <CountUp value={progress.streak.count} />
              </div>
              <div className="text-[11px] text-dim font-mono">jours d'affilée</div>
            </div>
          </div>
          <button
            onClick={() => nav("ai")}
            className="rounded-lg border border-cy/50 text-cy px-4 py-3 font-display font-bold text-sm items-center gap-2 hover:bg-cy/10 transition-colors hidden md:flex"
          >
            <IconWand className="w-4 h-4" />
            Cours IA
          </button>
          <button
            onClick={() => nav("tutor")}
            className="group rounded-lg px-5 py-3 bg-mint text-abyss font-display font-bold text-sm flex items-center gap-2 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(62,207,142,0.55)]"
          >
            <IconBolt className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
            Interroger le tuteur IA
          </button>
        </div>
      </header>

      {/* ---------- reprendre + console ---------- */}
      <div className="grid lg:grid-cols-12 gap-5">
        <Reveal className="lg:col-span-7">
          <div className="panel panel-hover rounded-lg p-6 h-full flex flex-col relative overflow-hidden">
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: last && lastVisible ? last.module.color : "#56C8E8" }}
            />
            <div className="flex items-center gap-2 font-mono text-[11px] text-dim uppercase tracking-[0.18em]">
              <IconBook className="w-4 h-4" />
              {last && lastVisible ? "Reprendre la session" : "Démarrer le programme"}
            </div>
            {last && lastVisible ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className="font-mono text-[11px] px-2 py-1 rounded border"
                    style={{ color: last.module.color, borderColor: `${last.module.color}55` }}
                  >
                    {last.module.code}
                  </span>
                  <span className="font-mono text-[11px] text-dim">{last.minutes} min</span>
                  {lastDone && (
                    <span className="flex items-center gap-1 text-mint text-[12px] font-mono">
                      <IconCheck className="w-3.5 h-3.5" /> terminé
                    </span>
                  )}
                </div>
                <h2 className="font-display text-2xl font-bold mt-3">{last.title}</h2>
                <p className="text-mist text-sm mt-2 flex-1">{last.module.tagline}</p>
                <button
                  onClick={() => nav("courses", { chapter: last.id })}
                  className="mt-5 self-start group flex items-center gap-2 font-display font-bold text-sm text-cy hover:text-fog transition-colors"
                >
                  {lastDone ? "Relire le chapitre" : "Continuer la lecture"}
                  <IconArrow className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold mt-4">
                  {year === 1 ? "Commence par les fondamentaux réseau" : "Reprends là où tu t'étais arrêté"}
                </h2>
                <p className="text-mist text-sm mt-2 flex-1">
                  {year === 1 ? (
                    <>
                      Le module <span className="text-cy font-medium">Réseaux & TCP/IP</span> est le socle de tout le
                      programme SISR : modèles OSI, adressage, commutation.
                    </>
                  ) : (
                    <>
                      En 2e année, tout le programme est ouvert : la 1re année reste accessible en révision, les
                      chapitres de spécialisation sont marqués <span className="text-amber font-medium">2A</span>.
                    </>
                  )}
                </p>
                <button
                  onClick={() => nav("courses", { chapter: "net-osi" })}
                  className="mt-5 self-start group flex items-center gap-2 font-display font-bold text-sm text-cy hover:text-fog transition-colors"
                >
                  Ouvrir le premier chapitre
                  <IconArrow className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
              </>
            )}
          </div>
        </Reveal>
        <Reveal className="lg:col-span-5" delay={120}>
          <ConsoleCard />
        </Reveal>
      </div>

      {/* ---------- bandeau stats ---------- */}
      <Reveal>
        <div className="panel rounded-lg stat-band">
          <div className="stat-cell p-5">
            <div className="flex items-center gap-2 text-dim font-mono text-[11px] uppercase tracking-widest">
              <IconBolt className="w-4 h-4 text-amber" /> XP cumulés
            </div>
            <div className="font-display text-3xl font-bold mt-2">
              <CountUp value={progress.xp} />
            </div>
            <div className="text-[12px] text-mist mt-1">{rank.current.name}</div>
          </div>
          <div className="stat-cell p-5">
            <div className="flex items-center gap-2 text-dim font-mono text-[11px] uppercase tracking-widest">
              <IconBook className="w-4 h-4 text-cy" /> Chapitres
            </div>
            <div className="font-display text-3xl font-bold mt-2">
              <CountUp value={visibleDone} />
              <span className="text-lg text-dim font-body font-normal">/{visibleTotal}</span>
            </div>
            <div className="w-full h-1.5 bg-line/60 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-cy bar-grow rounded-full"
                style={{ width: `${visibleTotal ? (visibleDone / visibleTotal) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="stat-cell p-5">
            <div className="flex items-center gap-2 text-dim font-mono text-[11px] uppercase tracking-widest">
              <IconTarget className="w-4 h-4 text-mint" /> Moyenne quiz
            </div>
            <div className="font-display text-3xl font-bold mt-2">
              {quizAvg === null ? "—" : <CountUp value={quizAvg} className="inline" />}
              {quizAvg !== null && <span className="text-lg text-dim font-body font-normal">%</span>}
            </div>
            <div className="text-[12px] text-mist mt-1">{totalQ} questions au labo ({year === 1 ? "1A" : "tout"})</div>
          </div>
          <div className="stat-cell p-5">
            <div className="flex items-center gap-2 text-dim font-mono text-[11px] uppercase tracking-widest">
              <IconCards className="w-4 h-4 text-vio" /> Cartes maîtrisées
            </div>
            <div className="font-display text-3xl font-bold mt-2">
              <CountUp value={nKnown} />
              <span className="text-lg text-dim font-body font-normal">/{nCards}</span>
            </div>
            <div className="text-[12px] text-mist mt-1">
              {progress.tutorQuestions} question{progress.tutorQuestions > 1 ? "s" : ""} au tuteur
            </div>
          </div>
        </div>
      </Reveal>

      {/* ---------- progression modules + rang ---------- */}
      <div className="grid lg:grid-cols-12 gap-5">
        <Reveal className="lg:col-span-7">
          <div className="panel rounded-lg p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold">Progression par module</h3>
              <button onClick={() => nav("courses")} className="link-underline text-[13px] text-cy font-mono">
                voir tous les cours
              </button>
            </div>
            <div className="space-y-4">
              {modules.map((m) => {
                const done = m.chapters.filter((c) => progress.done.includes(c.id)).length;
                const pct = Math.round((done / m.chapters.length) * 100);
                return (
                  <button key={m.id} onClick={() => nav("courses", { module: m.id })} className="w-full text-left group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-sm group-hover:text-fog transition-colors flex items-center gap-2">
                        <span className="w-2 h-2 rotate-45" style={{ background: m.color }} />
                        {m.title}
                      </span>
                      <span className="font-mono text-[12px] text-dim group-hover:text-mist transition-colors">
                        {done}/{m.chapters.length} · {pct}%
                      </span>
                    </div>
                    <div className="w-full h-[7px] rounded-full bg-line/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 ease-out"
                        style={{ width: `${pct}%`, background: m.color }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-5 space-y-5">
          <Reveal delay={100}>
            <div className="panel rounded-lg p-6 flex items-center gap-5">
              <Ring value={rank.progress} size={96} stroke={8} color="#F2B84B">
                <div className="text-center">
                  <div className="font-display font-bold text-xl leading-none">{rank.index + 1}</div>
                  <div className="font-mono text-[10px] text-dim mt-1">niv.</div>
                </div>
              </Ring>
              <div className="flex-1">
                <div className="font-mono text-[11px] text-dim uppercase tracking-widest">Grade actuel</div>
                <div className="font-display font-bold text-lg text-amber mt-1">{rank.current.name}</div>
                {rank.next ? (
                  <div className="text-[12px] text-mist mt-1.5">
                    Encore <span className="text-fog font-medium">{rank.next.min - progress.xp} XP</span> pour devenir{" "}
                    <span className="text-fog font-medium">{rank.next.name}</span>
                  </div>
                ) : (
                  <div className="text-[12px] text-mint mt-1.5">Grade maximal atteint. Respect.</div>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="panel rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold">Dernières sessions labo</h3>
                <button onClick={() => nav("quiz")} className="link-underline text-[13px] text-cy font-mono">
                  lancer un quiz
                </button>
              </div>
              {progress.quizzes.length === 0 ? (
                <p className="text-mist text-sm">
                  Aucune session pour l'instant. Le labo quiz t'attend : {totalQ} questions adaptées à ton année,
                  avec correction expliquée.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {[...progress.quizzes]
                    .slice(-4)
                    .reverse()
                    .map((q, i) => {
                      const m = modules.find((mm) => mm.id === q.moduleId);
                      const pct = Math.round((q.score / q.total) * 100);
                      return (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <span className="w-2 h-2 rotate-45 shrink-0" style={{ background: m?.color ?? "#5F7395" }} />
                          <span className="flex-1 truncate text-mist">{m?.title ?? q.moduleId}</span>
                          <span className={`font-mono text-[12px] ${pct >= 80 ? "text-mint" : pct >= 50 ? "text-amber" : "text-coral"}`}>
                            {q.score}/{q.total}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
