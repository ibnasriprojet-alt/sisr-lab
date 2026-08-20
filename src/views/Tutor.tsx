import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { askTutor, SUGGESTIONS, TutorReply } from "../data/knowledge";
import { findChapter } from "../data/courses";
import { AIConfig, buildSystemPrompt, ChatMsg, getAIConfig, streamChat } from "../lib/ai";
import { Year } from "../lib/backend";
import { usePrefersReducedMotion } from "../lib/store";
import { Reveal, Scramble } from "../components/fx";
import { IconArrow, IconBook, IconSend, IconSpark, IconWand } from "../components/icons";
import { Nav } from "./Dashboard";

type Msg = {
  role: "user" | "ai";
  text: string;
  full?: string;
  related?: TutorReply["related"];
};

function Avatar() {
  return (
    <span className="relative w-9 h-9 shrink-0 rounded-lg border border-mint/45 bg-mint/10 text-mint flex items-center justify-center">
      <IconSpark className="w-5 h-5" />
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-mint border-2 border-panel pulse-dot" />
    </span>
  );
}

export default function Tutor({
  nav,
  onAsk,
  year,
  aiVersion,
  onOpenSettings,
}: {
  nav: Nav;
  onAsk: () => void;
  year: Year;
  aiVersion: number;
  onOpenSettings: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const cfg: AIConfig | null = useMemo(() => getAIConfig(), [aiVersion]);
  const aiMode = cfg !== null;

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: `NEXO en ligne. ⚡ Profil ${year === 1 ? "1re année" : "2e année"} détecté. ${
        aiMode
          ? `Mode IA réelle actif (${cfg!.model}) : je peux répondre à TOUT et rédiger des explications complètes.`
          : "Mode connaissances embarquées : pose une question sur les 30+ sujets du référentiel."
      } Choisis un sujet ci-dessous ou écris ta question.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typeTimer = useRef<number>(0);
  const historyRef = useRef<ChatMsg[]>([{ role: "system", content: buildSystemPrompt(year) }]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, thinking, reduced]);

  useEffect(() => () => clearTimeout(typeTimer.current), []);

  const finishEmbedded = (reply: TutorReply) => {
    setThinking(false);
    if (reduced) {
      setMessages((m) => [...m, { role: "ai", text: reply.answer, related: reply.related }]);
      return;
    }
    setMessages((m) => [...m, { role: "ai", text: "", full: reply.answer, related: reply.related }]);
    let i = 0;
    const step = () => {
      i += 3;
      const done = i >= reply.answer.length;
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        copy[copy.length - 1] = { ...last, text: reply.answer.slice(0, i) };
        return copy;
      });
      if (!done) typeTimer.current = window.setTimeout(step, 14);
    };
    typeTimer.current = window.setTimeout(step, 60);
  };

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;
    setInput("");
    onAsk();
    clearTimeout(typeTimer.current);
    setMessages((m) =>
      m.map((msg) =>
        msg.role === "ai" && msg.full && msg.text.length < msg.full.length ? { ...msg, text: msg.full } : msg
      )
    );
    setMessages((m) => [...m, { role: "user", text: q }]);
    setThinking(true);

    /* ---- mode IA réelle : streaming depuis le fournisseur ---- */
    if (cfg) {
      historyRef.current = [...historyRef.current.slice(-8), { role: "user", content: q }];
      setMessages((m) => [...m, { role: "ai", text: "" }]);
      setThinking(false);
      let full = "";
      try {
        full = await streamChat(
          cfg,
          historyRef.current,
          (_d, f) => {
            full = f;
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { ...copy[copy.length - 1], text: f, full: f };
              return copy;
            });
          },
          undefined,
          { maxTokens: 900 }
        );
        historyRef.current.push({ role: "assistant", content: full });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "L'IA n'a pas répondu.";
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { ...copy[copy.length - 1], text: `⚠️ ${msg}`, full: msg };
          return copy;
        });
      }
      return;
    }

    /* ---- mode embarqué : base de connaissances locale ---- */
    const reply = askTutor(q, year);
    window.setTimeout(() => finishEmbedded(reply), 550 + Math.random() * 500);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const showChips = messages.length <= 2;

  return (
    <div className="flex flex-col h-[calc(100dvh-190px)] min-h-[480px] lg:h-[calc(100dvh-160px)]">
      {/* entête du tuteur */}
      <Reveal>
        <div className="flex items-center gap-4 pb-5 border-b border-line mb-5">
          <Avatar />
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold tracking-tight leading-none">
              <Scramble text="NEXO — tuteur IA" />
            </h1>
            <p className="font-mono text-[11.5px] text-dim mt-1.5">
              <span className="text-mint">●</span> en ligne ·{" "}
              {aiMode ? (
                <>
                  IA réelle · <span className="text-mint">{cfg!.model}</span>
                </>
              ) : (
                <>connaissances embarquées · programme BTS SIO SISR</>
              )}{" "}
              · profil <span style={{ color: year === 1 ? "#56C8E8" : "#F2B84B" }}>{year === 1 ? "1re année" : "2e année"}</span>
            </p>
          </div>
          {!aiMode && (
            <button
              onClick={onOpenSettings}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-mint/40 text-mint px-3.5 py-2 font-mono text-[11.5px] hover:bg-mint/[0.07] transition-colors"
            >
              <IconWand className="w-3.5 h-3.5" /> passer en IA réelle
            </button>
          )}
        </div>
      </Reveal>

      {/* fil de discussion */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 space-y-5">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end slide-msg">
              <div className="max-w-[85%] rounded-lg rounded-br-sm bg-cy/12 border border-cy/30 px-4 py-3 text-[14.5px] leading-relaxed text-fog">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3 slide-msg items-start">
              <Avatar />
              <div className="max-w-[88%]">
                <div className="panel rounded-lg rounded-tl-sm px-4 py-3.5">
                  <p className="text-[14.5px] leading-[1.75] whitespace-pre-line text-fog/95">
                    {m.text}
                    {m.full && m.text.length < m.full.length && <span className="caret" />}
                    {aiMode && !m.full && !thinking && m.text === "" && <span className="caret" />}
                  </p>
                </div>
                {m.related && (!m.full || m.text.length >= m.full.length) && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {m.related.map((r, j) => {
                      const ch = findChapter(r.chapterId);
                      return (
                        <button
                          key={j}
                          onClick={() => nav("courses", { chapter: r.chapterId })}
                          className="group flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[12.5px] font-mono text-mist hover:text-fog hover:border-line2 transition-colors"
                          style={{ borderLeftColor: ch?.module.color, borderLeftWidth: 3 }}
                        >
                          <IconBook className="w-3.5 h-3.5" />
                          {r.label}
                          <IconArrow className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {thinking && (
          <div className="flex gap-3 items-center slide-msg">
            <Avatar />
            <div className="panel rounded-lg px-4 py-3.5 flex items-center gap-1.5">
              <span className="type-dot w-1.5 h-1.5 rounded-full bg-mint inline-block" />
              <span className="type-dot w-1.5 h-1.5 rounded-full bg-mint inline-block" />
              <span className="type-dot w-1.5 h-1.5 rounded-full bg-mint inline-block" />
            </div>
          </div>
        )}

        {showChips && !thinking && (
          <div className="pt-2">
            <div className="font-mono text-[11px] text-dim uppercase tracking-[0.18em] mb-3">
              sujets qui tombent à l'examen
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-lg border border-line px-3.5 py-2 text-[13px] text-mist hover:text-mint hover:border-mint/40 hover:bg-mint/[0.05] transition-all duration-200 hover:-translate-y-0.5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* saisie */}
      <form onSubmit={submit} className="mt-4 pt-4 border-t border-line">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              aiMode
                ? "Pose n'importe quelle question — même hors programme…"
                : "Ex. : explique le découpage en sous-réseaux, l'ordre des GPO…"
            }
            className="flex-1 rounded-lg border border-line bg-panel/70 px-4 py-3.5 text-sm placeholder:text-dim focus:border-mint/50 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="rounded-lg px-5 bg-mint text-abyss font-display font-bold text-sm flex items-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_10px_28px_-10px_rgba(62,207,142,0.6)]"
          >
            <IconSend className="w-4 h-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </div>
        <p className="font-mono text-[11px] text-dim mt-2.5">
          {aiMode
            ? "Réponses générées par le modèle configuré — relis les commandes avant de les exécuter en TP."
            : "Mode éco : base experte locale couvrant le référentiel, fonctionne hors connexion. Active l'IA réelle pour des réponses illimitées."}
        </p>
      </form>
    </div>
  );
}
