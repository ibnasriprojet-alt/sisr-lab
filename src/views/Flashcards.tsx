import { useMemo, useState } from "react";
import { cardsForYear, Flashcard } from "../data/knowledge";
import { modulesForYear } from "../data/courses";
import { Year } from "../lib/backend";
import { Reveal, Scramble } from "../components/fx";
import { IconArrow, IconCards, IconCheck, IconRefresh } from "../components/icons";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Filter = "all" | "todo" | "known";

export default function Flashcards({
  known,
  onToggle,
  year,
}: {
  known: string[];
  onToggle: (id: string) => void;
  year: Year;
}) {
  const all = useMemo(() => cardsForYear(year), [year]);
  const [filter, setFilter] = useState<Filter>("all");
  const [deck, setDeck] = useState<Flashcard[] | null>(null);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const pool = useMemo(() => {
    if (filter === "todo") return all.filter((c) => !known.includes(c.id));
    if (filter === "known") return all.filter((c) => known.includes(c.id));
    return all;
  }, [all, filter, known]);

  const cards = deck ?? pool;
  const card = cards[pos % Math.max(1, cards.length)];
  const isKnown = card ? known.includes(card.id) : false;
  const module = card ? modulesForYear(year).find((m) => m.id === card.moduleId) ?? null : null;

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => setPos((p) => p + 1), 180);
  };

  const markKnown = () => {
    if (!card) return;
    onToggle(card.id);
    // la carte maîtrisée part en fin de paquet
    if (deck) setDeck((d) => (d ? [...d.slice(1), d[0]] : d));
    else setDeck([...pool.slice(1), pool[0]]);
    setFlipped(false);
    setTimeout(() => setPos((p) => p + 1), 180);
  };

  const reshuffle = () => {
    setDeck(shuffle(pool));
    setPos(0);
    setFlipped(false);
  };

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setDeck(null);
    setPos(0);
    setFlipped(false);
  };

  const knownCount = all.filter((c) => known.includes(c.id)).length;
  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "toutes", count: all.length },
    { id: "todo", label: "à revoir", count: all.length - knownCount },
    { id: "known", label: "maîtrisées", count: knownCount },
  ];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="font-mono text-[12px] text-cy uppercase tracking-[0.2em] mb-2">
            mémoire flash // profil {year === 1 ? "1re année" : "2e année"}
          </p>
          <h1 className="font-display text-3xl sm:text-[40px] font-bold tracking-tight">
            <Scramble text="Flashcards de révision" />
          </h1>
          <p className="text-mist mt-3 max-w-xl">
            Clique sur la carte pour révéler la définition. « Maîtrisée » l'envoie en fin de paquet — le classique
            de la répétition espacée, version admin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => changeFilter(f.id)}
              className={`rounded-lg border px-3.5 py-2 font-mono text-[12px] transition-all duration-200 ${
                filter === f.id
                  ? "border-mint/50 text-mint bg-mint/[0.07]"
                  : "border-line text-dim hover:text-mist hover:border-line2"
              }`}
            >
              {f.label} <span className="opacity-70">({f.count})</span>
            </button>
          ))}
        </div>
      </header>

      {cards.length === 0 ? (
        <Reveal>
          <div className="panel rounded-lg p-10 text-center max-w-xl mx-auto">
            <IconCards className="w-10 h-10 mx-auto text-dim" />
            <h2 className="font-display text-xl font-bold mt-4">
              {filter === "known" ? "Aucune carte maîtrisée pour l'instant" : "Paquet vide"}
            </h2>
            <p className="text-mist text-sm mt-2">
              {filter === "known"
                ? "Retourne dans « à revoir » et marque les cartes que tu connais."
                : "Toutes les cartes du paquet sont maîtrisées. Bien joué."}
            </p>
            <button
              onClick={() => changeFilter("all")}
              className="mt-5 rounded-lg border border-line2 px-5 py-2.5 text-sm text-cy hover:bg-cy/10 transition-colors inline-flex items-center gap-2"
            >
              <IconRefresh className="w-4 h-4" /> voir toutes les cartes
            </button>
          </div>
        </Reveal>
      ) : (
        <div className="max-w-2xl mx-auto">
          {/* progression du paquet */}
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[12px] text-dim">
              carte {(pos % cards.length) + 1}/{cards.length}
            </span>
            <div className="flex-1 h-[6px] rounded-full bg-line/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-vio transition-[width] duration-500 ease-out"
                style={{ width: `${((pos % cards.length) + 1) / cards.length * 100}%` }}
              />
            </div>
            <span className="font-mono text-[12px] text-mint">
              {knownCount}/{all.length} maîtrisées
            </span>
          </div>

          {/* carte 3D */}
          <div className="flip-scene" style={{ height: 340 }}>
            <div
              key={card.id}
              className={`flip-card relative w-full h-full cursor-pointer select-none ${flipped ? "flipped" : ""}`}
              onClick={() => setFlipped((f) => !f)}
              role="button"
              aria-label="Retourner la carte"
            >
              {/* recto */}
              <div className="flip-face absolute inset-0 panel rounded-lg p-8 flex flex-col items-center justify-center text-center"
                style={{ borderColor: `${module?.color ?? "#28406B"}44` }}>
                <span
                  className="font-mono text-[11px] px-2.5 py-1 rounded border mb-6"
                  style={{ color: module?.color, borderColor: `${module?.color}55`, background: `${module?.color}10` }}
                >
                  {module?.code ?? card.moduleId} · {card.id}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight leading-snug">{card.term}</h2>
                <p className="font-mono text-[11px] text-dim mt-8 flex items-center gap-2">
                  cliquer pour révéler <IconRefresh className="w-3.5 h-3.5" />
                </p>
              </div>
              {/* verso */}
              <div
                className="flip-face flip-back absolute inset-0 rounded-lg p-8 flex flex-col items-center justify-center text-center border"
                style={{ background: "linear-gradient(180deg, rgba(19,33,57,0.95), rgba(14,26,48,0.98))", borderColor: `${module?.color ?? "#28406B"}66` }}
              >
                <span
                  className="font-mono text-[11px] px-2.5 py-1 rounded border mb-5"
                  style={{ color: module?.color, borderColor: `${module?.color}55` }}
                >
                  définition
                </span>
                <p className="text-[15px] leading-[1.8] text-fog/95 max-w-md">{card.def}</p>
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={markKnown}
              className={`rounded-lg px-5 py-3 font-display font-bold text-sm flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 ${
                isKnown
                  ? "bg-mint/15 text-mint border border-mint/40"
                  : "bg-mint text-abyss hover:shadow-[0_10px_28px_-10px_rgba(62,207,142,0.6)]"
              }`}
            >
              <IconCheck className="w-4 h-4" />
              {isKnown ? "Déjà maîtrisée" : "Maîtrisée — suivante"}
            </button>
            <button
              onClick={nextCard}
              className="group rounded-lg border border-line px-5 py-3 text-sm text-mist hover:text-fog hover:border-line2 transition-colors flex items-center gap-2"
            >
              à revoir — suivante
              <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={reshuffle}
              className="rounded-lg border border-line px-5 py-3 text-sm text-mist hover:text-fog hover:border-line2 transition-colors flex items-center gap-2"
            >
              <IconRefresh className="w-4 h-4" /> mélanger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
