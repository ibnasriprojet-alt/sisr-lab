import { FormEvent, useState } from "react";
import { getBackend, Profile } from "../lib/backend";
import { Scramble } from "../components/fx";
import { IconBolt, IconCheck, IconServer } from "../components/icons";

type Mode = "signin" | "signup";

function NetworkGlyph() {
  return (
    <svg viewBox="0 0 320 180" className="w-full max-w-sm" fill="none" aria-hidden="true">
      <g stroke="#28406B" strokeWidth="1.2">
        <path d="M40 130L120 50M120 50l90 20M210 70l70 60M120 50l-30 90M90 140l120-70M210 70l-60 80M150 150l60-80" className="dash-flow" strokeDasharray="5 8" />
      </g>
      <g>
        <circle cx="40" cy="130" r="6" fill="#0E1A30" stroke="#56C8E8" strokeWidth="1.5" />
        <circle cx="120" cy="50" r="8" fill="#0E1A30" stroke="#3ECF8E" strokeWidth="1.5" />
        <circle cx="210" cy="70" r="6" fill="#0E1A30" stroke="#F2B84B" strokeWidth="1.5" />
        <circle cx="280" cy="130" r="7" fill="#0E1A30" stroke="#56C8E8" strokeWidth="1.5" />
        <circle cx="90" cy="140" r="5" fill="#0E1A30" stroke="#B78CFF" strokeWidth="1.5" />
        <circle cx="150" cy="150" r="6" fill="#0E1A30" stroke="#3ECF8E" strokeWidth="1.5" />
        <circle cx="120" cy="50" r="2.5" fill="#3ECF8E" className="pulse-dot" />
      </g>
      <text x="132" y="42" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5F7395">SRV-AD01</text>
      <text x="222" y="62" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5F7395">FW-EDGE</text>
      <text x="30" y="152" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#5F7395">SW-CORE</text>
    </svg>
  );
}

export default function Auth({ onAuthed }: { onAuthed: (p: Profile) => void }) {
  const backend = getBackend();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const profile =
        mode === "signup" ? await backend.signUp(name, email, password) : await backend.signIn(email, password);
      onAuthed(profile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue.";
      if (msg.includes("confirmation e-mail")) setInfo(msg);
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative z-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* -------- panneau identité -------- */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2.5 mb-8">
            <span className="w-9 h-9 rounded-lg bg-mint text-abyss flex items-center justify-center">
              <IconBolt className="w-5 h-5" />
            </span>
            <span className="font-display font-bold text-xl tracking-tight">
              SISR<span className="text-mint">://</span>LAB
            </span>
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight">
            <Scramble text="Ta révision SISR," />
            <br />
            <span className="text-cy">
              <Scramble text="côté serveur." delay={350} />
            </span>
          </h1>
          <p className="text-mist mt-5 max-w-md leading-relaxed">
            Cours alignés sur le référentiel BTS SIO option SISR, tuteur IA, labo de quiz et flashcards — avec un
            compte et une progression sauvegardée dans le backend.
          </p>
          <div className="mt-8 floaty">
            <NetworkGlyph />
          </div>
          <ul className="mt-8 space-y-2.5">
            {[
              "18 chapitres répartis sur la 1re et la 2e année",
              "Contenu adapté à ton année d'étude",
              "Progression, XP et série synchronisées sur ton compte",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-sm text-mist">
                <IconCheck className="w-4 h-4 text-mint shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* -------- formulaire -------- */}
        <div className="panel rounded-lg p-6 sm:p-8 relative overflow-hidden pop-in">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-mint" />
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <span className="w-8 h-8 rounded-lg bg-mint text-abyss flex items-center justify-center">
              <IconBolt className="w-4 h-4" />
            </span>
            <span className="font-display font-bold text-lg tracking-tight">
              SISR<span className="text-mint">://</span>LAB
            </span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {mode === "signin" ? "Connexion" : "Créer un compte"}
            </h2>
            <span
              className={`font-mono text-[10.5px] px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                backend.mode === "cloud" ? "text-mint border-mint/40 bg-mint/10" : "text-amber border-amber/40 bg-amber/10"
              }`}
              title={
                backend.mode === "cloud"
                  ? "Backend Supabase actif : comptes et progression dans le cloud."
                  : "Mode local : ajoutez VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY pour activer le cloud (voir SETUP.md)."
              }
            >
              <span className={`w-1.5 h-1.5 rounded-full ${backend.mode === "cloud" ? "bg-mint pulse-dot" : "bg-amber"}`} />
              {backend.mode === "cloud" ? "cloud · supabase" : "mode local"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg border border-line bg-deep/60 mb-6">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`rounded-md py-2 text-sm font-display font-bold transition-all duration-200 ${
                  mode === m ? "bg-panel2 text-fog border border-line2" : "text-dim hover:text-mist border border-transparent"
                }`}
              >
                {m === "signin" ? "Se connecter" : "S'inscrire"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="pop-in">
                <label className="font-mono text-[11px] uppercase tracking-widest text-dim block mb-1.5">
                  Prénom / pseudo
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex. Nadia"
                  className="w-full rounded-lg border border-line bg-deep/50 px-4 py-3 text-sm placeholder:text-dim focus:border-mint/50 focus:outline-none transition-colors"
                />
              </div>
            )}
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-dim block mb-1.5">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@etudiant.fr"
                autoComplete="email"
                className="w-full rounded-lg border border-line bg-deep/50 px-4 py-3 text-sm placeholder:text-dim focus:border-mint/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-dim block mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="w-full rounded-lg border border-line bg-deep/50 px-4 py-3 text-sm placeholder:text-dim focus:border-mint/50 focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-coral/50 bg-coral/[0.07] px-4 py-3 text-[13.5px] text-coral pop-in">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-lg border border-cy/50 bg-cy/[0.07] px-4 py-3 text-[13.5px] text-cy pop-in">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3.5 bg-mint text-abyss font-display font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_12px_32px_-12px_rgba(62,207,142,0.65)]"
            >
              {loading ? (
                <>
                  <span className="type-dot w-1.5 h-1.5 rounded-full bg-abyss inline-block" />
                  <span className="type-dot w-1.5 h-1.5 rounded-full bg-abyss inline-block" />
                  <span className="type-dot w-1.5 h-1.5 rounded-full bg-abyss inline-block" />
                </>
              ) : (
                <>
                  <IconServer className="w-4 h-4" />
                  {mode === "signin" ? "Ouvrir la session" : "Provisionner mon compte"}
                </>
              )}
            </button>
          </form>

          <p className="font-mono text-[11px] text-dim mt-5 leading-relaxed">
            {backend.mode === "cloud"
              ? "// authentification sécurisée via Supabase Auth — tes données ne sont visibles que par toi (RLS)."
              : "// aperçu sans clés Supabase : le compte est stocké sur cet appareil. Le cloud s'active avec les variables d'environnement (SETUP.md)."}
          </p>
        </div>
      </div>
    </div>
  );
}
