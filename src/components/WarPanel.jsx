import { Clock, Star, Swords } from 'lucide-react';
import { getWar } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { formatDuration } from '../lib/format.js';

const STATE_LABELS = {
  preparation: 'Jour de préparation',
  inWar: 'Jour de combat',
  warEnded: 'Guerre terminée',
};

function timing(war) {
  const now = Date.now();
  if (war.state === 'preparation' && war.startTime) {
    return `Début dans ${formatDuration(new Date(war.startTime) - now)}`;
  }
  if (war.state === 'inWar' && war.endTime) {
    return `Fin dans ${formatDuration(new Date(war.endTime) - now)}`;
  }
  return null;
}

function Side({ side, align }) {
  const right = align === 'right';
  return (
    <div className={`min-w-0 flex-1 ${right ? 'text-right' : ''}`}>
      <p className="truncate text-sm font-medium text-zinc-300">{side.name}</p>
      <p className={`flex items-center gap-2 text-4xl font-bold text-white tabular-nums ${right ? 'justify-end' : ''}`}>
        <Star className="size-6 fill-accent-400 text-accent-400" aria-hidden="true" />
        {side.stars}
      </p>
      <p className="text-xs text-zinc-500 tabular-nums">{side.destruction.toFixed(1)} % détruit</p>
    </div>
  );
}

function Attack({ attack }) {
  return (
    <span className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-0.5 text-xs whitespace-nowrap text-zinc-300 tabular-nums">
      <span className="flex" aria-label={`${attack.stars} étoiles`}>
        {[1, 2, 3].map((n) => (
          <Star
            key={n}
            aria-hidden="true"
            className={`size-3 ${n <= attack.stars ? 'fill-accent-400 text-accent-400' : 'text-zinc-700'}`}
          />
        ))}
      </span>
      {Math.round(attack.destruction)} %
      {attack.defenderPosition && <span className="text-zinc-500">n°{attack.defenderPosition}</span>}
    </span>
  );
}

function WarContent({ war, onSelectPlayer }) {
  if (war.state === 'notInWar') {
    return (
      <p className="p-4 text-sm text-zinc-400">
        Aucune guerre classique en cours. Les guerres de la Ligue de guerre de clans n'apparaissent
        pas ici.
      </p>
    );
  }
  if (war.state === 'private') {
    return (
      <p className="p-4 text-sm text-zinc-400">
        Le journal de guerre de ce clan est privé. Le chef peut le rendre public dans les
        paramètres du clan.
      </p>
    );
  }

  const fighting = war.state !== 'preparation';
  const pending = war.members
    .map((m) => ({ ...m, left: war.attacksPerMember - m.attacks.length }))
    .filter((m) => m.left > 0);
  const when = timing(war);

  return (
    <>
      <div className="border-b border-white/10 p-4">
        <p className="mb-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-zinc-400">
          <span className="rounded-md bg-accent-400/10 px-2 py-0.5 font-semibold text-accent-400">
            {STATE_LABELS[war.state] ?? war.state}
          </span>
          <span>
            {war.teamSize} contre {war.teamSize}
          </span>
          {when && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {when}
            </span>
          )}
        </p>
        <div className="flex items-center gap-4">
          <Side side={war.clan} />
          <span className="text-xs font-semibold tracking-widest text-zinc-600">VS</span>
          <Side side={war.opponent} align="right" />
        </div>
      </div>

      {fighting && (
        <div className="border-b border-white/10 p-4">
          <h4 className="mb-2 text-sm font-semibold text-white">
            {war.state === 'inWar' ? 'Attaques restantes' : 'Attaques non utilisées'}
            <span className="ml-2 text-zinc-500">{pending.reduce((n, m) => n + m.left, 0)}</span>
          </h4>
          {pending.length === 0 ? (
            <p className="text-sm text-zinc-400">Tout le monde a utilisé ses attaques.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {pending.map((m) => (
                <li key={m.tag}>
                  <button
                    type="button"
                    onClick={() => onSelectPlayer(m.tag)}
                    className="cursor-pointer rounded-md border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-sm text-red-200 hover:border-red-400/60"
                  >
                    {m.name} <span className="font-semibold tabular-nums">×{m.left}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ol className="divide-y divide-white/5">
        {war.members.map((m) => (
          <li key={m.tag} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
            <span className="w-6 shrink-0 text-sm text-zinc-500 tabular-nums">{m.position}</span>
            <span className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelectPlayer(m.tag)}
                className="player-link block max-w-full truncate"
              >
                {m.name}
              </button>
              {m.townHallLevel && <span className="text-xs text-zinc-500">HDV {m.townHallLevel}</span>}
            </span>
            {fighting && (
              <span className="flex w-full flex-wrap gap-1.5 pl-9 sm:w-auto sm:justify-end sm:pl-0">
                {m.attacks.map((a, i) => (
                  <Attack key={i} attack={a} />
                ))}
                {m.attacks.length === 0 && <span className="text-xs text-zinc-600">Pas encore attaqué</span>}
              </span>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

export default function WarPanel({ clanTag, onSelectPlayer }) {
  const { status, data: war, error } = useAsync(getWar, clanTag);

  return (
    <section id="guerre" className="card overflow-hidden">
      <h3 className="section-label border-b border-white/10 p-4">
        <Swords className="size-4 text-accent-400" aria-hidden="true" />
        Guerre de clan
      </h3>
      {status === 'loading' && <p className="p-4 text-sm text-zinc-400">Chargement de la guerre…</p>}
      {status === 'error' && (
        <p role="alert" className="p-4 text-sm text-red-300">
          {error}
        </p>
      )}
      {status === 'success' && <WarContent war={war} onSelectPlayer={onSelectPlayer} />}
    </section>
  );
}
