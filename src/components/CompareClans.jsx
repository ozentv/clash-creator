import { useCallback, useState } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { getClan } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { computeStats } from '../lib/rankings.js';
import { formatNumber } from '../lib/format.js';
import { normalizeTag } from '../lib/tag.js';

function metrics(clan) {
  const stats = computeStats(clan.members);
  const halls = clan.members.map((m) => m.townHallLevel).filter(Boolean);
  return {
    level: clan.level,
    members: stats.count,
    points: clan.points,
    warWins: clan.warWins,
    warWinStreak: clan.warWinStreak,
    totalTrophies: stats.totalTrophies,
    avgTrophies: stats.avgTrophies,
    totalDonations: stats.totalDonations,
    avgDonations: stats.avgDonations,
    avgTownHall: halls.length ? halls.reduce((a, b) => a + b, 0) / halls.length : 0,
  };
}

const ROWS = [
  ['level', 'Niveau du clan', formatNumber],
  ['members', 'Membres', formatNumber],
  ['points', 'Points de clan', formatNumber],
  ['warWins', 'Guerres gagnées', formatNumber],
  ['warWinStreak', 'Série de victoires', formatNumber],
  ['totalTrophies', 'Trophées cumulés', formatNumber],
  ['avgTrophies', 'Trophées moyens', formatNumber],
  ['totalDonations', 'Dons de la saison', formatNumber],
  ['avgDonations', 'Dons moyens', formatNumber],
  ['avgTownHall', 'Hôtel de ville moyen', (n) => n.toFixed(1).replace('.', ',')],
];

export default function CompareClans({ clan, recent }) {
  const [value, setValue] = useState('');
  const [otherTag, setOtherTag] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const loadOther = useCallback((tag) => getClan(tag).then((b) => b.clan), []);
  const { status, data: other, error } = useAsync(loadOther, otherTag);

  function handleSubmit(e) {
    e.preventDefault();
    const tag = normalizeTag(value);
    setInvalid(!tag);
    if (tag) setOtherTag(tag);
  }

  const suggestions = recent.filter((c) => c.tag !== clan.tag);
  const a = metrics(clan);
  const b = other && metrics(other);
  const cell = (mine, theirs) =>
    `px-4 py-2.5 text-right tabular-nums ${mine > theirs ? 'font-semibold text-accent-400' : 'text-zinc-300'}`;

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-white/10 p-4">
        <h3 className="section-label mb-3">
          <GitCompareArrows className="size-4 text-accent-400" aria-hidden="true" />
          Comparer avec un autre clan
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
          <label htmlFor="compare-tag" className="sr-only">
            Tag du clan à comparer
          </label>
          <input
            id="compare-tag"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="#TAG du clan à comparer"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={invalid}
            className="field min-w-0 flex-1 px-3 py-2 text-sm uppercase placeholder:normal-case"
          />
          <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Chargement…' : 'Comparer'}
          </button>
        </form>
        {invalid && <p className="mt-2 text-sm text-red-300">Tag invalide.</p>}
        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs text-zinc-500">Clans récents :</span>
            {suggestions.map((c) => (
              <button
                key={c.tag}
                type="button"
                className="btn btn-quiet px-2.5 py-1"
                aria-pressed={otherTag === normalizeTag(c.tag)}
                onClick={() => setOtherTag(normalizeTag(c.tag))}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {status === 'error' && (
        <p role="alert" className="p-4 text-sm text-red-300">
          {error}
        </p>
      )}
      {status === 'idle' && (
        <p className="p-4 text-sm text-zinc-400">
          Entre le tag d'un autre clan pour comparer ses chiffres avec ceux de {clan.name}.
        </p>
      )}
      {b && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Le meilleur chiffre est en jaune</th>
                <th className="px-4 py-3 text-right font-display text-base font-normal text-white">{clan.name}</th>
                <th className="px-4 py-3 text-right font-display text-base font-normal text-white">{other.name}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([key, label, format]) => (
                <tr key={key} className="border-t border-white/5">
                  <th scope="row" className="px-4 py-2.5 text-left font-normal text-zinc-400">
                    {label}
                  </th>
                  <td className={cell(a[key], b[key])}>{format(a[key])}</td>
                  <td className={cell(b[key], a[key])}>{format(b[key])}</td>
                </tr>
              ))}
              <tr className="border-t border-white/5">
                <th scope="row" className="px-4 py-2.5 text-left font-normal text-zinc-400">
                  Ligue de guerre
                </th>
                <td className="px-4 py-2.5 text-right text-zinc-300">{clan.warLeague ?? '—'}</td>
                <td className="px-4 py-2.5 text-right text-zinc-300">{other.warLeague ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
