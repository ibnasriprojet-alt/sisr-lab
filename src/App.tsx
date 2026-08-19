import { useCallback, useEffect, useRef, useState } from "react";
import BackgroundFX from "./components/BackgroundFX";
import { getBackend, Profile, Year } from "./lib/backend";
import { defaultProgress, Progress, rankFor, RANKS, touchToday } from "./lib/store";
import { chaptersForYear } from "./data/courses";
import Auth from "./views/Auth";
import Onboarding from "./views/Onboarding";
import Dashboard from "./views/Dashboard";
import Courses from "./views/Courses";
import Tutor from "./views/Tutor";
import QuizLab from "./views/QuizLab";
import Flashcards from "./views/Flashcards";
import {
  IconBolt,
  IconCards,
  IconCheck,
  IconFlask,
  IconGrid,
  IconSpark,
  IconStack,
} from "./components/icons";

type View = "dash" | "courses" | "tutor" | "quiz" | "cards";
type Payload = Record<string, string>;

const NAV: { id: View; label: string; icon: typeof IconGrid; terminal: string }[] = [
  { id: "dash", label: "Tableau de bord", icon: IconGrid, terminal: "~/accueil" },
  { id: "courses", label: "Cours", icon: IconStack, terminal: "~/cours" },
  { id: "tutor", label: "Tuteur IA", icon: IconSpark, terminal: "~/tuteur" },
  { id: "quiz", label: "Labo quiz", icon: IconFlask, terminal: "~/labo" },
  { id: "cards", label: "Flashcards", icon: IconCards, terminal: "~/cartes" },
];

function BootScreen({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative z-10">
      <div className="text-center pop-in">
        <div className="font-mono text-[13px] text-mist caret">{label}</div>
        <div className="mt-4 flex justify-center gap-1.5">
          <span className="type-dot w-2 h-2 rounded-full bg-mint inline-block" />
          <span className="type-dot w-2 h-2 rounded-full bg-mint inline-block" />
          <span className="type-dot w-2 h-2 rounded-full bg-mint inline-block" />
        </div>
      </div>
    </div>
  );
}

function YearChip({ year, color }: { year: Year; color: string }) {
  return (
    <span
      className="font-mono text-[11px] px-2.5 py-1 rounded border whitespace-nowrap"
      style={{ color, borderColor: `${color}55`, background: `${color}12` }}
    >
      {year === 1 ? "1re année" : "2e année"}
    </span>
  );
}

export default function App() {
  const backend = getBackend();
  const [booting, setBooting] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  const [view, setView] = useState<View>("dash");
  const [payload, setPayload] = useState<Payload>({});
  const [profileMenu, setProfileMenu] = useState(false);
  const saveTimer = useRef<number>(0);
  const loadedFor = useRef<string | null>(null);

  /* ---------- session + chargement de la progression ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      const p = await backend.init();
      if (!alive) return;
      setProfile(p);
      setBooting(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!profile) return;
    if (loadedFor.current === profile.id) return;
    loadedFor.current = profile.id;
    backend.loadProgress(profile.id).then(setProgress);
  }, [profile, backend]);

  /* ---------- sauvegarde débouncée dans le backend ---------- */
  useEffect(() => {
    if (!profile || loadedFor.current !== profile.id) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      backend.saveProgress(profile.id, progress).catch(() => {});
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [progress, profile, backend]);

  /* ---------- actions ---------- */
  const nav = useCallback((v: string, p: Payload = {}) => {
    setView(v as View);
    setPayload(p);
    setProfileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAuthed = (p: Profile) => {
    loadedFor.current = null;
    setProfile(p);
    setView("dash");
    setPayload({});
  };

  const logout = async () => {
    await backend.signOut();
    loadedFor.current = null;
    setProfile(null);
    setProgress(defaultProgress());
    setView("dash");
    setProfileMenu(false);
  };

  const changeYear = async (y: Year) => {
    if (!profile) return;
    try {
      const updated = await backend.setYear(y);
      setProfile(updated);
    } catch {
      /* l'erreur est visible sur l'écran d'onboarding le cas échéant */
    }
    setProfileMenu(false);
  };

  const completeChapter = useCallback((id: string) => {
    setProgress((p) =>
      touchToday({
        ...p,
        xp: p.done.includes(id) ? p.xp : p.xp + 25,
        done: p.done.includes(id) ? p.done : [...p.done, id],
        lastChapter: id,
      })
    );
  }, []);

  const recordQuiz = useCallback((moduleId: string, score: number, total: number) => {
    setProgress((p) =>
      touchToday({
        ...p,
        xp: p.xp + score * 10,
        quizzes: [...p.quizzes, { moduleId, score, total, at: new Date().toISOString() }],
      })
    );
  }, []);

  const toggleKnown = useCallback((id: string) => {
    setProgress((p) =>
      touchToday({
        ...p,
        known: p.known.includes(id) ? p.known.filter((k) => k !== id) : [...p.known, id],
      })
    );
  }, []);

  const tutorAsk = useCallback(() => {
    setProgress((p) => touchToday({ ...p, tutorQuestions: p.tutorQuestions + 1 }));
  }, []);

  /* ---------- écrans hors shell ---------- */
  if (booting) return (<><BackgroundFX /><BootScreen label="établissement de la session…" /></>);
  if (!profile) return (<><BackgroundFX /><Auth onAuthed={handleAuthed} /></>);
  if (profile.year === null)
    return (<><BackgroundFX /><Onboarding user={profile} onDone={handleAuthed} /></>);

  const year = profile.year;
  const yearColor = year === 1 ? "#56C8E8" : "#F2B84B";
  const active = NAV.find((n) => n.id === view) ?? NAV[0];
  const rank = rankFor(progress.xp);
  const nextRank = rank.next ?? RANKS[RANKS.length - 1];
  const xpPct = rank.next ? Math.round(rank.progress * 100) : 100;
  const visibleTotal = chaptersForYear(year).length;
  const visibleDone = progress.done.filter((id) => chaptersForYear(year).some((c) => c.id === id)).length;

  return (
    <div className="min-h-screen relative">
      <BackgroundFX />

      {/* ---------------- sidebar (desktop) ---------------- */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-line bg-deep/80 backdrop-blur-sm z-40">
        <button onClick={() => nav("dash")} className="flex items-center gap-2.5 px-6 h-16 border-b border-line shrink-0 group">
          <span className="w-8 h-8 rounded-lg bg-mint text-abyss flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
            <IconBolt className="w-4.5 h-4.5" />
          </span>
          <span className="font-display font-bold tracking-tight">
            SISR<span className="text-mint">://</span>LAB
          </span>
        </button>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const isActive = view === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => nav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 border ${
                  isActive
                    ? "bg-panel2 text-fog border-line2"
                    : "text-mist hover:text-fog hover:bg-panel/70 border-transparent"
                }`}
              >
                <span className={`transition-colors ${isActive ? "text-mint" : ""}`}>
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <span className="font-medium">{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-mint pulse-dot" />}
              </button>
            );
          })}
        </nav>

        {/* profil */}
        <div className="p-3 border-t border-line">
          <div className="panel rounded-lg p-3.5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0" style={{ background: `${yearColor}22`, color: yearColor, border: `1px solid ${yearColor}55` }}>
                {profile.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{profile.name}</div>
                <div className="font-mono text-[10.5px] text-dim truncate">{profile.email}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <YearChip year={year} color={yearColor} />
              <button
                onClick={logout}
                className="font-mono text-[11px] text-dim hover:text-coral transition-colors"
              >
                déconnexion
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {([1, 2] as Year[]).map((y) => (
                <button
                  key={y}
                  onClick={() => y !== year && changeYear(y)}
                  disabled={y === year}
                  className={`rounded-md py-1.5 font-mono text-[11px] border transition-all duration-200 ${
                    y === year
                      ? "border-line2 text-fog bg-panel2"
                      : "border-line text-dim hover:text-mist hover:border-line2"
                  }`}
                >
                  {y === 1 ? "1re année" : "2e année"}
                  {y === year && <IconCheck className="w-3 h-3 inline ml-1 text-mint" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------- zone principale ---------------- */}
      <div className="lg:pl-64 relative z-10">
        {/* topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-line bg-abyss/85 backdrop-blur-md flex items-center gap-3 px-4 sm:px-8">
          <button onClick={() => nav("dash")} className="lg:hidden flex items-center gap-2 group">
            <span className="w-7 h-7 rounded-md bg-mint text-abyss flex items-center justify-center">
              <IconBolt className="w-4 h-4" />
            </span>
            <span className="font-display font-bold text-sm tracking-tight">
              SISR<span className="text-mint">://</span>LAB
            </span>
          </button>
          <div className="hidden lg:flex items-center gap-2 font-mono text-[12.5px] text-dim">
            <span className="text-mint">➜</span>
            <span>{active.terminal}</span>
          </div>

          <div className="flex-1" />

          {/* XP */}
          <div className="hidden sm:flex items-center gap-2.5 panel rounded-lg px-3 py-1.5">
            <IconBolt className="w-3.5 h-3.5 text-amber" />
            <div className="w-24">
              <div className="flex justify-between font-mono text-[10px] text-dim leading-none mb-1">
                <span className="text-fog font-bold">{progress.xp} XP</span>
                <span>{nextRank.min} XP</span>
              </div>
              <div className="h-[4px] rounded-full bg-line/60 overflow-hidden">
                <div className="h-full bg-amber rounded-full transition-[width] duration-700" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>

          <button onClick={() => nav("dash")} className="hidden md:block">
            <YearChip year={year} color={yearColor} />
          </button>

          {/* menu profil (mobile + accès rapide) */}
          <div className="relative">
            <button
              onClick={() => setProfileMenu((v) => !v)}
              className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-sm transition-transform hover:scale-105"
              style={{ background: `${yearColor}22`, color: yearColor, border: `1px solid ${yearColor}55` }}
              aria-label="Menu profil"
            >
              {profile.name.slice(0, 2).toUpperCase()}
            </button>
            {profileMenu && (
              <div className="absolute right-0 mt-2 w-64 panel rounded-lg p-3.5 shadow-2xl pop-in z-50">
                <div className="text-sm font-semibold truncate">{profile.name}</div>
                <div className="font-mono text-[10.5px] text-dim truncate mb-3">{profile.email}</div>
                <div className="font-mono text-[10.5px] text-dim uppercase tracking-widest mb-1.5">mon année</div>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {([1, 2] as Year[]).map((y) => (
                    <button
                      key={y}
                      onClick={() => changeYear(y)}
                      className={`rounded-md py-2 font-mono text-[11px] border transition-all ${
                        y === year
                          ? "border-line2 text-fog bg-panel2"
                          : "border-line text-dim hover:text-mist hover:border-line2"
                      }`}
                    >
                      {y === 1 ? "1re année" : "2e année"}
                    </button>
                  ))}
                </div>
                <button
                  onClick={logout}
                  className="w-full rounded-md border border-coral/40 text-coral py-2 text-[12.5px] font-medium hover:bg-coral/10 transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </header>

        {profileMenu && <button className="fixed inset-0 z-20 cursor-default lg:hidden" onClick={() => setProfileMenu(false)} aria-label="Fermer" />}

        {/* contenu */}
        <main className="px-4 sm:px-8 py-8 pb-28 lg:pb-16 max-w-[1200px] mx-auto" onClick={() => profileMenu && setProfileMenu(false)}>
          <div key={view + JSON.stringify(payload)}>
            {view === "dash" && (
              <Dashboard progress={progress} nav={nav} user={profile} year={year} visibleDone={visibleDone} visibleTotal={visibleTotal} />
            )}
            {view === "courses" && (
              <Courses
                progress={progress}
                nav={nav}
                year={year}
                initialModule={payload.module ?? null}
                initialChapter={payload.chapter ?? null}
                onComplete={completeChapter}
              />
            )}
            {view === "tutor" && <Tutor nav={nav} onAsk={tutorAsk} year={year} />}
            {view === "quiz" && <QuizLab progress={progress} nav={nav} year={year} onResult={recordQuiz} />}
            {view === "cards" && (
              <Flashcards known={progress.known} onToggle={toggleKnown} year={year} />
            )}
          </div>
        </main>

        {/* pied de page */}
        <footer className="hidden lg:block border-t border-line px-8 py-4">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between font-mono text-[11px] text-dim">
            <span>BTS SIO · option SISR — cours, tuteur IA, labo quiz & flashcards</span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${backend.mode === "cloud" ? "bg-mint pulse-dot" : "bg-amber"}`} />
              backend : {backend.mode === "cloud" ? "supabase (cloud)" : "local — voir SETUP.md"}
            </span>
          </div>
        </footer>
      </div>

      {/* ---------------- tabbar mobile ---------------- */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-deep/95 backdrop-blur-md">
        <div className="grid grid-cols-5">
          {NAV.map((item) => {
            const isActive = view === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => nav(item.id)}
                className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${isActive ? "text-mint" : "text-dim"}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9.5px] font-mono">{item.label.split(" ")[0].toLowerCase()}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
