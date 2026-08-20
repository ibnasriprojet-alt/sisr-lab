import { useEffect, useState } from "react";
import { AIConfig, AIProvider, getAIConfig, PROVIDERS, saveAIConfig, streamChat } from "../lib/ai";
import { IconCheck, IconCross, IconSpark, IconWand } from "./icons";

export default function AISettingsModal({
  open,
  onClose,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [provider, setProvider] = useState<AIProvider>("groq");
  const [baseUrl, setBaseUrl] = useState(PROVIDERS.groq.baseUrl);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(PROVIDERS.groq.models[0]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    const cfg = getAIConfig();
    if (cfg) {
      setProvider(cfg.provider);
      setBaseUrl(cfg.baseUrl);
      setApiKey(cfg.apiKey);
      setModel(cfg.model);
    } else {
      setProvider("groq");
      setBaseUrl(PROVIDERS.groq.baseUrl);
      setApiKey("");
      setModel(PROVIDERS.groq.models[0]);
    }
    setTestResult(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pickProvider = (p: AIProvider) => {
    setProvider(p);
    setBaseUrl(PROVIDERS[p].baseUrl);
    setModel(PROVIDERS[p].models[0]);
    setTestResult(null);
  };

  const test = async () => {
    if (!apiKey.trim()) {
      setTestResult({ ok: false, msg: "Entre d'abord une clé API." });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      await streamChat(
        { provider, baseUrl: baseUrl.trim(), apiKey: apiKey.trim(), model },
        [{ role: "user", content: "Réponds uniquement : pong" }],
        () => {},
        undefined,
        { maxTokens: 8 }
      );
      setTestResult({ ok: true, msg: "Clé valide — l'IA répond." });
    } catch (e) {
      setTestResult({ ok: false, msg: e instanceof Error ? e.message : "Test échoué." });
    } finally {
      setTesting(false);
    }
  };

  const save = () => {
    if (!apiKey.trim()) {
      setTestResult({ ok: false, msg: "Entre une clé API (ou supprime la configuration)." });
      return;
    }
    saveAIConfig({ provider, baseUrl: baseUrl.trim(), apiKey: apiKey.trim(), model });
    onChanged();
    onClose();
  };

  const remove = () => {
    saveAIConfig(null);
    setApiKey("");
    setTestResult(null);
    onChanged();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-abyss/80 backdrop-blur-sm cursor-default" onClick={onClose} aria-label="Fermer" />
      <div className="relative panel rounded-lg w-full max-w-lg p-6 sm:p-7 shadow-2xl pop-in">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-lg bg-mint/12 border border-mint/40 text-mint flex items-center justify-center">
            <IconWand className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold leading-tight">IA réelle — configuration</h2>
            <p className="font-mono text-[11px] text-dim">génération de cours & tuteur illimité</p>
          </div>
          <button onClick={onClose} className="ml-auto text-dim hover:text-fog transition-colors" aria-label="Fermer">
            <IconCross className="w-5 h-5" />
          </button>
        </div>

        <p className="text-mist text-[13px] leading-relaxed mt-3">
          Ta clé reste <span className="text-fog">dans ton navigateur</span> et n'est envoyée qu'au fournisseur
          choisi — jamais à un autre serveur.
        </p>

        {/* fournisseur */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          {(Object.keys(PROVIDERS) as AIProvider[]).map((p) => (
            <button
              key={p}
              onClick={() => pickProvider(p)}
              className={`rounded-lg border px-3.5 py-2.5 text-left transition-all duration-200 ${
                provider === p ? "border-mint/60 bg-mint/[0.07]" : "border-line hover:border-line2"
              }`}
            >
              <div className={`text-[13.5px] font-medium ${provider === p ? "text-mint" : "text-fog"}`}>
                {PROVIDERS[p].label}
              </div>
              <div className="font-mono text-[10.5px] text-dim mt-0.5 truncate">{PROVIDERS[p].baseUrl}</div>
            </button>
          ))}
        </div>

        <p className="font-mono text-[11px] text-dim mt-3 leading-relaxed">
          💡 {PROVIDERS[provider].note}{" "}
          <a
            href={PROVIDERS[provider].keyUrl}
            target="_blank"
            rel="noreferrer"
            className="text-cy link-underline"
          >
            Obtenir une clé →
          </a>
        </p>

        {/* champs */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="font-mono text-[11px] text-dim uppercase tracking-widest">Clé API</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === "groq" ? "gsk_…" : "sk-…"}
              className="w-full mt-1.5 rounded-lg border border-line bg-deep/70 px-3.5 py-2.5 font-mono text-[13px] placeholder:text-dim focus:border-mint/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[11px] text-dim uppercase tracking-widest">URL de base</label>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full mt-1.5 rounded-lg border border-line bg-deep/70 px-3.5 py-2.5 font-mono text-[12px] focus:border-mint/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] text-dim uppercase tracking-widest">
                Modèle <span className="normal-case tracking-normal">(éditable — tape un autre nom si besoin)</span>
              </label>
              <input
                list="ai-model-suggestions"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full mt-1.5 rounded-lg border border-line bg-deep/70 px-3.5 py-2.5 font-mono text-[12px] focus:border-mint/50 focus:outline-none transition-colors"
              />
              <datalist id="ai-model-suggestions">
                {PROVIDERS[provider].models.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {testResult && (
          <div
            className={`mt-4 rounded-lg border px-3.5 py-2.5 text-[13px] flex items-center gap-2 pop-in ${
              testResult.ok ? "border-mint/50 text-mint bg-mint/[0.06]" : "border-coral/50 text-coral bg-coral/[0.06]"
            }`}
          >
            {testResult.ok ? <IconCheck className="w-4 h-4 shrink-0" /> : <IconCross className="w-4 h-4 shrink-0" />}
            {testResult.msg}
          </div>
        )}

        {/* actions */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          <button
            onClick={test}
            disabled={testing}
            className="rounded-lg border border-cy/50 text-cy px-4 py-2.5 text-sm font-display font-bold hover:bg-cy/10 transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            <IconSpark className={`w-4 h-4 ${testing ? "animate-pulse" : ""}`} />
            {testing ? "Test en cours…" : "Tester la clé"}
          </button>
          <button
            onClick={save}
            className="rounded-lg bg-mint text-abyss px-5 py-2.5 text-sm font-display font-bold hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(62,207,142,0.6)] transition-all duration-300"
          >
            Enregistrer
          </button>
          <button
            onClick={remove}
            className="rounded-lg border border-line text-dim px-4 py-2.5 text-sm hover:text-coral hover:border-coral/40 transition-colors"
          >
            Supprimer la clé
          </button>
        </div>
      </div>
    </div>
  );
}
