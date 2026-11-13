import { useMemo, useRef, useState } from 'react';
import { RANKINGS, rankMembers } from '../lib/rankings.js';
import { exportNodeAsPng } from '../lib/exportPng.js';
import { formatNumber, ROLE_LABELS } from '../lib/format.js';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };
const SIZES = [10, 20, 50];

export default function Leaderboard({ clan }) {
  const [type, setType] = useState('trophies');
  const [size, setSize] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const cardRef = useRef(null);

  const ranking = RANKINGS[type];
  const rows = useMemo(
    () => rankMembers(clan.members, ranking.key).slice(0, size),
    [clan.members, ranking.key, size],
  );

  async function handleExport() {
    setExporting(true);
    setExportError(false);
    try {
      const slug = clan.tag.replace('#', '').toLowerCase();
      await exportNodeAsPng(cardRef.current, `classement-${ranking.key}-${slug}.png`);
    } catch (err) {
      console.error(err);
      setExportError(true);
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="panel p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {Object.values(RANKINGS).map((r) => (
          <button
            key={r.key}
            type="button"
            className="btn btn-ghost"
            aria-pressed={type === r.key}
            onClick={() => setType(r.key)}
          >
            {r.icon} {r.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-300">
          Top
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="rounded-lg border-2 border-night-700 bg-night-950 px-2 py-1.5"
          >
            {SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-gold" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Export…' : '📸 Export PNG'}
        </button>
      </div>
      {exportError && (
        <p role="alert" className="mb-3 text-sm text-red-300">
          L'export a échoué. Réessaie.
        </p>
      )}

      {/* Zone capturée par l'export PNG */}
      <div ref={cardRef} className="rounded-xl bg-night-950 p-4">
        <div className="mb-3 text-center">
          <h3 className="title-clash text-2xl">
            {ranking.icon} Classement {ranking.label}
          </h3>
          <p className="text-sm text-slate-400">
            {clan.name} · {clan.tag}
          </p>
        </div>
        <ol className="flex flex-col gap-1.5">
          {rows.map((m) => (
            <li
              key={m.tag}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                m.rank <= 3 ? 'bg-gold-500/15 ring-1 ring-gold-500/40' : 'bg-night-800'
              }`}
            >
              <span className="w-8 shrink-0 text-center font-display text-lg text-slate-300">
                {MEDALS[m.rank] ?? m.rank}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{m.name}</span>
                <span className="block truncate text-xs text-slate-400">
                  {ROLE_LABELS[m.role] ?? m.role}
                  {m.townHallLevel && ` · HDV ${m.townHallLevel}`}
                </span>
              </span>
              <span className="shrink-0 font-display text-lg text-gold-300 tabular-nums">
                {formatNumber(m[ranking.key])} {ranking.icon}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-center text-xs text-slate-500">Clash Creator AI</p>
      </div>
    </section>
  );
}
