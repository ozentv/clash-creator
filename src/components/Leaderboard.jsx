import { useMemo, useRef, useState } from 'react';
import { Castle, Download, Gift, Scale, Star, Trophy } from 'lucide-react';
import { RANKINGS, rankMembers } from '../lib/rankings.js';
import { exportNodeAsPng } from '../lib/exportPng.js';
import { ROLE_LABELS } from '../lib/format.js';

const ICONS = { trophies: Trophy, donations: Gift, balance: Scale, expLevel: Star, townHall: Castle };
const PODIUM = {
  1: 'bg-accent-400 text-black',
  2: 'bg-zinc-300 text-black',
  3: 'bg-amber-700 text-white',
};
const SIZES = [10, 20, 50];

export default function Leaderboard({ clan, onSelectPlayer }) {
  const [type, setType] = useState('trophies');
  const [size, setSize] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const cardRef = useRef(null);

  const ranking = RANKINGS[type];
  const Icon = ICONS[type];
  const rows = useMemo(
    () => rankMembers(clan.members, type).slice(0, size),
    [clan.members, type, size],
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
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] p-4">
        <h3 className="section-label mr-2">
          <Trophy className="size-4 text-accent-400" aria-hidden="true" />
          Classements
        </h3>
        <label className="ml-auto flex items-center gap-2 text-sm text-zinc-400">
          Top
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="field px-2 py-1.5 text-sm"
          >
            {SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-primary" onClick={handleExport} disabled={exporting}>
          <Download className="size-4" aria-hidden="true" />
          {exporting ? 'Export…' : 'Exporter en PNG'}
        </button>
        <div className="flex w-full flex-wrap gap-2 pt-1">
          {Object.values(RANKINGS).map((r) => (
            <button
              key={r.key}
              type="button"
              className="btn btn-quiet px-3 py-1.5"
              aria-pressed={type === r.key}
              onClick={() => setType(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {exportError && (
        <p role="alert" className="px-4 pt-3 text-sm text-red-300">
          L'export a échoué. Réessaie.
        </p>
      )}

      {/* Zone capturée par l'export PNG */}
      <div ref={cardRef} className="bg-ink-900 p-4">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-2xl text-white">
              Classement <span className="text-accent-400">{ranking.label}</span>
            </p>
            <p className="truncate text-sm text-zinc-400">
              {clan.name} · {clan.tag}
              {ranking.hint && ` · ${ranking.hint}`}
            </p>
          </div>
          <p className="shrink-0 font-mono text-[11px] tracking-widest text-zinc-600 uppercase">Clash Creator</p>
        </div>
        <ol className="divide-y divide-white/5 rounded-lg border border-white/10">
          {rows.map((m) => (
            <li key={m.tag} className="row-hover flex items-center gap-3 px-3 py-2.5">
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-md text-sm font-bold tabular-nums ${
                  PODIUM[m.rank] ?? 'bg-ink-800 text-zinc-400'
                }`}
              >
                {m.rank}
              </span>
              <span className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onSelectPlayer(m.tag)}
                  className="player-link block max-w-full truncate"
                >
                  {m.name}
                </button>
                <span className="block truncate text-xs text-zinc-500">
                  {ROLE_LABELS[m.role] ?? m.role}
                  {m.townHallLevel && ` · HDV ${m.townHallLevel}`}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 font-semibold text-white tabular-nums">
                {ranking.format(m.score)}
                <Icon className="size-4 text-accent-400" aria-hidden="true" />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
