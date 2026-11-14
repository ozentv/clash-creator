import { useCallback, useMemo } from 'react';
import { ArrowDown, ArrowUp, Minus, Shield, Trophy } from 'lucide-react';
import { getLocations, getRanking } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { formatNumber } from '../lib/format.js';

const KINDS = [
  ['clans', 'Clans'],
  ['joueurs', 'Joueurs'],
];
const PODIUM = { 1: 'bg-accent-400 text-black', 2: 'bg-zinc-300 text-black', 3: 'bg-amber-700 text-white' };

// Évolution depuis le classement précédent : flèche, écart et libellé pour les lecteurs d'écran.
function Move({ rank, previous }) {
  if (!previous || previous <= 0 || previous === rank) {
    return <Minus className="size-3.5 text-zinc-700" aria-label="Rang inchangé" />;
  }
  const up = previous > rank;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span className={`flex items-center gap-0.5 text-xs tabular-nums ${up ? 'text-emerald-300' : 'text-red-300'}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="sr-only">{up ? 'Gagne' : 'Perd'}</span>
      {Math.abs(previous - rank)}
      <span className="sr-only">places</span>
    </span>
  );
}

export default function Rankings({ location, kind, onChange, onOpenClan, onOpenPlayer }) {
  const locations = useAsync(getLocations, 'tous');
  // Pays par défaut : la France si elle figure dans la liste, sinon le monde.
  const selected = useMemo(() => {
    const list = locations.data ?? [];
    return location ?? list.find((l) => l.countryCode === 'FR')?.id ?? list[0]?.id ?? null;
  }, [location, locations.data]);

  const apiKind = kind === 'joueurs' ? 'players' : 'clans';
  const load = useCallback((key) => getRanking(...key.split('/')), []);
  const ranking = useAsync(load, selected ? `${selected}/${apiKind}` : null);
  const rows = ranking.data ?? [];
  const placeName = locations.data?.find((l) => l.id === selected)?.name ?? '';

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="rise">
        <p className="eyebrow">Classements officiels du jeu</p>
        <h1 className="mt-2 flex items-center gap-3 font-display text-4xl text-white sm:text-5xl">
          <Trophy className="size-8 text-accent-400" aria-hidden="true" />
          Classements
        </h1>
        <p className="mt-2 text-zinc-400">Les meilleurs clans et joueurs, par pays ou dans le monde.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Type de classement" className="flex gap-2">
          {KINDS.map(([key, label]) => (
            <button key={key} type="button" className="btn btn-quiet px-3 py-1.5" aria-pressed={kind === key} onClick={() => onChange({ kind: key })}>
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          Pays
          <select
            value={selected ?? ''}
            onChange={(e) => onChange({ location: e.target.value })}
            disabled={!locations.data}
            className="field max-w-52 px-2 py-1.5 text-sm"
          >
            {(locations.data ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(locations.status === 'error' || ranking.status === 'error') && (
        <p role="alert" className="card p-6 text-center text-sm text-red-300">
          {locations.error ?? ranking.error}
        </p>
      )}
      {(ranking.status === 'loading' || locations.status === 'loading') && (
        <div role="status" aria-label="Chargement" className="skeleton h-96 rounded-2xl" />
      )}
      {ranking.status === 'success' &&
        (rows.length === 0 ? (
          <p className="card p-8 text-center text-sm text-zinc-400">Aucun classement disponible pour ce pays.</p>
        ) : (
          <section className="card rise overflow-hidden">
            <h2 className="section-label border-b border-white/[0.08] p-4">
              {kind === 'joueurs' ? 'Meilleurs joueurs' : 'Meilleurs clans'} · {placeName}
              <span className="text-zinc-600">{rows.length}</span>
            </h2>
            <ol className="divide-y divide-white/5">
              {rows.map((row) => (
                <li key={row.tag} className="row-hover flex items-center gap-3 px-4 py-2.5">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-md text-sm font-bold tabular-nums ${PODIUM[row.rank] ?? 'bg-ink-800 text-zinc-400'}`}>
                    {row.rank}
                  </span>
                  <span className="w-8 shrink-0">
                    <Move rank={row.rank} previous={row.previousRank} />
                  </span>
                  {kind === 'clans' &&
                    (row.badgeUrl ? (
                      <img src={row.badgeUrl} alt="" loading="lazy" className="size-8 shrink-0" />
                    ) : (
                      <Shield className="size-8 shrink-0 p-1.5 text-zinc-600" aria-hidden="true" />
                    ))}
                  <span className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => (kind === 'clans' ? onOpenClan(row.tag) : onOpenPlayer(row.tag))}
                      className="player-link block max-w-full truncate"
                    >
                      {row.name}
                    </button>
                    <span className="block truncate text-xs text-zinc-500">
                      {kind === 'clans'
                        ? [row.level && `Niveau ${row.level}`, row.memberCount != null && `${row.memberCount}/50`].filter(Boolean).join(' · ')
                        : [row.expLevel && `Niveau ${row.expLevel}`, row.clanName].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 font-semibold text-white tabular-nums">
                    {formatNumber(kind === 'clans' ? row.points : row.trophies)}
                    <Trophy className="size-4 text-accent-400" aria-hidden="true" />
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}
    </main>
  );
}
