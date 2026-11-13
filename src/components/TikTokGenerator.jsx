import { useEffect, useState } from 'react';
import { generateTikTokScript, STYLES } from '../lib/tiktok.js';
import { generateAiScript } from '../api/clashApi.js';

export default function TikTokGenerator({ clan, aiAvailable }) {
  const [style, setStyle] = useState('hype');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    setText(generateTikTokScript(clan, style));
    setAiError(null);
  }, [clan, style]);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleAi() {
    setAiLoading(true);
    setAiError(null);
    try {
      setText(await generateAiScript(clan, style));
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <section className="panel flex flex-col gap-3 p-4 sm:p-5">
      <h3 className="title-clash text-2xl">🎬 Texte TikTok</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(STYLES).map(([key, s]) => (
          <button
            key={key}
            type="button"
            className="btn btn-ghost px-3 py-1.5 text-sm"
            aria-pressed={style === key}
            onClick={() => setStyle(key)}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>
      <textarea
        aria-label="Texte TikTok généré"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={16}
        className="w-full resize-y rounded-xl border-2 border-night-700 bg-night-950 p-3 text-sm leading-relaxed focus:border-gold-400 focus:outline-none"
      />
      {aiAvailable && (
        <button type="button" className="btn btn-green" onClick={handleAi} disabled={aiLoading}>
          {aiLoading ? 'Rédaction en cours…' : "✨ Générer avec l'IA"}
        </button>
      )}
      {aiError && (
        <p role="alert" className="text-sm text-red-300">
          {aiError}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost flex-1"
          onClick={() => setText(generateTikTokScript(clan, style))}
        >
          🎲 Regénérer
        </button>
        <button type="button" className="btn btn-gold flex-1" onClick={handleCopy} disabled={!text}>
          {copied ? '✅ Copié !' : '📋 Copier'}
        </button>
      </div>
      {!aiAvailable && (
        <p className="text-xs text-slate-500">
          Texte produit par des modèles locaux. Ajoute <code>ANTHROPIC_API_KEY</code> pour activer
          la génération par IA.
        </p>
      )}
    </section>
  );
}
