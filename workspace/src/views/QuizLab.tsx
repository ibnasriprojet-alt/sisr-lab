import { useCallback, useEffect, useMemo, useState } from "react";
import { modulesForYear } from "../data/courses";
import { quizForYear, quizListForYear, totalQuestionsForYear } from "../data/quizzes";
import { Year } from "../lib/backend";
import { Progress } from "../lib/store";
import { CountUp, Reveal, Ring, Scramble } from "../components/fx";
import { IconArrow, IconCheck, IconCross, IconFlask, IconRefresh, IconTarget } from "../components/icons";
import { Nav } from "./Dashboard";

type Phase = "select" | "run" | "done";

export default function QuizLab({
  progress,
  nav,
  year,
  onResult,
}: {
  progress: Progress;
  nav: Nav;
  year: Year;
  onResult: (moduleId: string, score: number, total: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>("select");
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [recorded, setRecorded] = useState(false);

  const quiz = useMemo(() => (moduleId ? quizForYear(moduleId, year) : null), [moduleId, year]);
  const mod = moduleId ? modulesForYear(year).find((m) => m.id === moduleId) : null;

  const start = (id: string) => {
    setModuleId(id);
    setQIdx(0);
    setChosen(null);
    setScore(0);
    setRecorded(false);
    setPhase("run");
  };

  const total = quiz?.questions.length ?? 0;
  const question = quiz?.questions[qIdx];

  const pick = (i: number) => {
    if (chosen !== null || !question) return;
    setChosen(i);
    if (i === question.answer) setScore((s) => s + 1);
  };

  const next = useCallback(() => {
    if (!quiz) return;
    if (qIdx + 1 < quiz.questions.length) {
      setQIdx((i) => i + 1);
      setChosen(null);
    } else {
      setPhase("done");
      if (!recorded) {
        setRecorded(true);
        onResult(moduleId!, score, quiz.questions.length);
      }
    }
  }, [quiz, qIdx, moduleId, score, recorded, onResult]);

  useEffect(() => {
    if (phase !== "run" || chosen === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, chosen, next]);

  useEffect(() => {
    if (phase !== "run" || chosen !== null) return;
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) pick(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, chosen, qIdx]);

  /* ------------------------------ sélection ------------------------------ */
  if (phase === "select" || !quiz || !mod) {
    const list = quizListForYear(year);
    return (
      <div>
        <header className="mb-7">
          <p className="font-mono text-[12px] text-cy uppercase tracking-[0.2em] mb-2">
            labo quiz // {totalQuestionsForYear(year)} questions · profil {year === 1 ? "1re année" : "2e année"}
          </p>
          <h1 className="font-display text-3xl sm:text-[40px] font-bold tracking-tight">
            <Scramble text="Teste tes réflexes d'admin" />
          </h1>
          <p className="text-mist mt-3 max-w-xl">
            Correction immédiate avec explication — exactement le format des QCM d'E1. Clavier : touches 1 à 4 pour
            répondre, Entrée pour continuer. Chaque bonne réponse vaut <span className="text-amber font-medium">10 XP</span>.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map(({ module: m, quiz: q }, i) => {
            const mine = progress.quizzes.filter((r) => r.moduleId === m.id);
            const best = mine.length ? Math.max(...mine.map((r) => Math.round((r.score / r.total) * 100))) : null;
            return (
              <Reveal key={m.id} delay={i * 80}>
                <button
                  onClick={() => start(m.id)}
                  className="w-full h-full text-left panel panel-hover rounded-lg p-6 flex flex-col relative overflow-hidden group"
                >
                  <div
                    className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-[0.09] transition-transform duration-500 group-hover:scale-125"
                    style={{ background: m.color }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-dim">{m.code}</span>
                    {best !== null && (
                      <span
                        className="font-mono text-[11px] px-2 py-0.5 rounded border"
                        style={{
                          color: best >= 80 ? "#3ECF8E" : best >= 50 ? "#F2B84B" : "#F2706B",
                          borderColor: best >= 80 ? "#3ECF8E55" : best >= 50 ? "#F2B84B55" : "#F2706B55",
                        }}
                      >
                        record {best}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold mt-4">{m.title}</h3>
                  <p className="text-mist text-sm mt-1.5 flex-1">{m.tagline}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-mono text-[12px] text-dim">
                      {q.questions.length} question{q.questions.length > 1 ? "s" : ""} · {mine.length} session
                      {mine.length > 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-2 font-mono text-[12px] text-cy">
                      lancer
                      <IconArrow className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    );
  }

  /* ------------------------------ en cours ------------------------------ */
  if (phase === "run" && question) {
    const revealed = chosen !== null;
    return (
      <div className="max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setPhase("select")}
            className="font-mono text-[12px] text-dim hover:text-cy transition-colors flex items-center gap-2"
          >
            <IconArrow className="w-4 h-4 rotate-180" /> labo
          </button>
          <div className="flex-1" />
          <span className="font-mono text-[12px] px-2.5 py-1 rounded border" style={{ color: mod.color, borderColor: `${mod.color}55` }}>
            {mod.code}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="font-display font-bold text-lg">
            Q{qIdx + 1}
            <span className="text-dim text-sm font-body font-normal">/{total}</span>
          </span>
          <div className="flex-1 h-[6px] rounded-full bg-line/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${((qIdx + (revealed ? 1 : 0)) / total) * 100}%`, background: mod.color }}
            />
          </div>
          <span className="font-mono text-[12px] text-mint">{score} ✓</span>
        </div>

        <div key={qIdx} className="pop-in">
          <div className="flex items-center gap-2.5 mt-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug">{question.q}</h2>
          </div>
          <span
            className={`inline-block mt-2 font-mono text-[10.5px] px-2 py-0.5 rounded border ${
              question.year === 1 ? "text-cy border-cy/40" : "text-amber border-amber/40"
            }`}
          >
            {question.year === 1 ? "socle 1A" : "spé 2A"}
          </span>

          <div className="mt-5 space-y-3">
            {question.options.map((opt, i) => {
              const isAnswer = i === question.answer;
              const isChosen = i === chosen;
              let cls = "border-line hover:border-line2 hover:bg-panel2/60";
              if (revealed) {
                if (isAnswer) cls = "border-mint/60 bg-mint/[0.08]";
                else if (isChosen) cls = "border-coral/60 bg-coral/[0.07]";
                else cls = "border-line opacity-45";
              }
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={revealed}
                  className={`w-full text-left rounded-lg border px-4 py-3.5 flex items-center gap-4 transition-all duration-200 ${cls} ${
                    !revealed ? "hover:-translate-y-0.5" : ""
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-md border flex items-center justify-center font-mono text-[12px] shrink-0 ${
                      revealed && isAnswer
                        ? "border-mint text-mint"
                        : revealed && isChosen
                        ? "border-coral text-coral"
                        : "border-line text-dim"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-[14.5px] leading-relaxed flex-1">{opt}</span>
                  {revealed && isAnswer && <IconCheck className="w-5 h-5 text-mint shrink-0" />}
                  {revealed && isChosen && !isAnswer && <IconCross className="w-5 h-5 text-coral shrink-0" />}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div
              className={`mt-5 rounded-lg border-l-[3px] px-4 py-3.5 pop-in ${
                chosen === question.answer ? "border-mint bg-mint/[0.05]" : "border-coral bg-coral/[0.05]"
              }`}
            >
              <div className={`font-mono text-[11px] uppercase tracking-widest mb-1.5 ${chosen === question.answer ? "text-mint" : "text-coral"}`}>
                {chosen === question.answer ? "correct · +10 XP" : "raté — lis l'explication"}
              </div>
              <p className="text-[14px] leading-relaxed text-fog/90">{question.explain}</p>
            </div>
          )}

          {revealed && (
            <button
              onClick={next}
              className="mt-6 group rounded-lg px-5 py-3 font-display font-bold text-sm flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: mod.color, color: "#081020" }}
            >
              {qIdx + 1 < total ? "Question suivante" : "Voir le résultat"}
              <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------ terminé ------------------------------ */
  const pct = Math.round((score / total) * 100);
  const verdict =
    pct === 100
      ? "Sans faute. Le jury n'a qu'à bien se tenir."
      : pct >= 80
      ? "Solide. Encore un tour et c'est plié."
      : pct >= 50
      ? "Ça tient, mais relis les chapitres liés aux erreurs."
      : "Retour au cours conseillé — puis on relance le labo.";

  return (
    <div className="max-w-2xl">
      <div className="panel rounded-lg p-8 text-center relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: mod.color }} />
        <p className="font-mono text-[11px] text-dim uppercase tracking-[0.2em] mb-5">
          session terminée · {mod.code}
        </p>
        <Ring value={pct / 100} size={148} stroke={10} color={pct >= 80 ? "#3ECF8E" : pct >= 50 ? "#F2B84B" : "#F2706B"}>
          <div>
            <div className="font-display text-4xl font-bold">
              <CountUp value={pct} />
              <span className="text-xl text-dim">%</span>
            </div>
            <div className="font-mono text-[11px] text-dim mt-1">
              {score}/{total}
            </div>
          </div>
        </Ring>
        <h2 className="font-display text-2xl font-bold mt-6">{verdict}</h2>
        <p className="text-mist text-sm mt-2">+{score * 10} XP engrangés. Chaque erreur est une question de moins à l'examen.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => start(mod.id)}
            className="rounded-lg border border-line2 px-5 py-3 text-sm font-display font-bold text-cy hover:bg-cy/10 transition-colors flex items-center gap-2"
          >
            <IconRefresh className="w-4 h-4" /> relancer ce quiz
          </button>
          <button
            onClick={() => setPhase("select")}
            className="rounded-lg border border-line px-5 py-3 text-sm text-mist hover:text-fog hover:border-line2 transition-colors flex items-center gap-2"
          >
            <IconFlask className="w-4 h-4" /> autre module
          </button>
          <button
            onClick={() => nav("courses", { module: mod.id })}
            className="rounded-lg border border-line px-5 py-3 text-sm text-mist hover:text-fog hover:border-line2 transition-colors flex items-center gap-2"
          >
            <IconTarget className="w-4 h-4" /> revoir le cours
          </button>
        </div>
      </div>
    </div>
  );
}
