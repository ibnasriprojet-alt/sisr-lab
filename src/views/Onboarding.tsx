import { useState } from "react";
import { chaptersForYear, modulesForYear } from "../data/courses";
import { totalQuestionsForYear } from "../data/quizzes";
import { cardsForYear } from "../data/knowledge";
import { getBackend, Profile, Year } from "../lib/backend";
import { Reveal, Scramble } from "../components/fx";
import { IconArrow, IconBook, IconBolt, IconCheck } from "../components/icons";

export default function Onboarding({ user, onDone }: { user: Profile; onDone: (p: Profile) => void }) {
  const [year, setYear] = useState<Year | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (!year || loading) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await getBackend().setYear(year);
      onDone(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'enregistrer l'année.");
      setLoading(false);
    }
  };

  const cards: {
    value: Year;
    color: string;
    title: string;
    subtitle: string;
    points: string[];
  }[] = [
    {
      value: 1,
      color: "#56C8E8",
      title: "1re année",
      subtitle: "Le socle fondamental",
      points: [
        "Réseaux : modèle OSI, adressage IP, commutation",
        "Windows Server : Active Directory, DNS & DHCP",
        "Linux : commandes essentielles, utilisateurs",
        "Virtualisation : hyperviseurs et VM",
        "Cybersécurité : modèle DIC et menaces",
      ],
    },
    {
      value: 2,
      color: "#F2B84B",
      title: "2e année",
      subtitle: "Expertise + spécialisation",
      points: [
        "Tout le programme de 1re année en accès révision",
        "VLAN avancés, routage, NAT",
        "GPO, WSUS et supervision",
        "systemd, scripts Bash, Docker",
        "Pare-feu, sauvegardes 3-2-1 et PRA",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative z-10">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-9">
          <p className="font-mono text-[12px] text-cy uppercase tracking-[0.22em] mb-3">
            bienvenue, {user.name} // configuration du profil
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            <Scramble text="Tu es en quelle année ?" />
          </h1>
          <p className="text-mist mt-3 max-w-xl mx-auto">
            Le contenu (cours, quiz, flashcards) s'adapte à ton niveau. Tu pourras changer à tout moment depuis ton
            profil.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {cards.map((c, i) => {
            const active = year === c.value;
            const nChap = chaptersForYear(c.value).length;
            const nMod = modulesForYear(c.value).length;
            return (
              <Reveal key={c.value} delay={i * 120}>
                <button
                  onClick={() => setYear(c.value)}
                  className={`w-full h-full text-left rounded-lg p-6 sm:p-7 border-2 transition-all duration-300 relative overflow-hidden group ${
                    active ? "-translate-y-1" : "border-line hover:border-line2 hover:-translate-y-0.5"
                  }`}
                  style={{
                    borderColor: active ? c.color : undefined,
                    background: active ? `${c.color}0d` : undefined,
                    boxShadow: active ? `0 18px 44px -18px ${c.color}66` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="font-mono text-[11px] px-2.5 py-1 rounded border"
                      style={{ color: c.color, borderColor: `${c.color}55`, background: `${c.color}12` }}
                    >
                      {c.value === 1 ? "NIVEAU 1" : "NIVEAU 2"}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        active ? "" : "border-line"
                      }`}
                      style={active ? { borderColor: c.color, background: c.color } : undefined}
                    >
                      {active && <IconCheck className="w-3.5 h-3.5 text-abyss" />}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{c.title}</h2>
                  <p className="text-sm mt-1" style={{ color: c.color }}>
                    {c.subtitle}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {c.points.map((p) => (
                      <li key={p} className="flex gap-2.5 text-[13.5px] text-mist leading-relaxed">
                        <span className="mt-[8px] w-1.5 h-1.5 rotate-45 shrink-0" style={{ background: c.color }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-4 border-t border-line flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11.5px] text-dim">
                    <span className="flex items-center gap-1.5">
                      <IconBook className="w-3.5 h-3.5" /> {nChap} chapitres · {nMod} modules
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IconBolt className="w-3.5 h-3.5" /> {totalQuestionsForYear(c.value)} questions labo
                    </span>
                    <span>{cardsForYear(c.value).length} flashcards</span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-coral/50 bg-coral/[0.07] px-4 py-3 text-[13.5px] text-coral pop-in">
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={confirm}
            disabled={!year || loading}
            className="group rounded-lg px-8 py-4 bg-mint text-abyss font-display font-bold text-[15px] flex items-center gap-2.5 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_14px_36px_-12px_rgba(62,207,142,0.65)]"
          >
            {loading ? "Enregistrement…" : "Démarrer la session"}
            {!loading && <IconArrow className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
