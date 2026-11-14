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
  return (
    <div className={`min-w-0 flex-1 ${align === 'right' ? 'text-right' : ''}`}>
      <p className="truncate font-semibold">{side.name}</p>
      <p className="font-display text-3xl text-gold-300 tabular-nums">⭐ {side.stars}</p>
      <p className="text-xs text-slate-400 tabular-nums">{side.destruction.toFixed(1)} % détruit</p>
    </div>
  );
}

function Attack({ attack }) {
  return (
    <span className="rounded-md bg-night-950 px-2 py-0.5 text-xs whitespace-nowrap tabular-nums">
      {'⭐'.repeat(attack.stars) || '0 ⭐'} {Math.round(attack.destruction)} %
      {attack.defenderPosition && <span className="text-slate-500"> sur n°{attack.defenderPosition}</span>}
    </span>
  );
}

function WarContent({ war, onSelectPlayer }) {
  if (war.state === 'notInWar') {
    return (
      <p className="text-slate-400">
        Aucune guerre classique en cours. Les guerres de la Ligue de guerre de clans n'apparaissent
        pas ici.
      </p>
    );
  }
  if (war.state === 'private') {
    return (
      <p className="text-slate-400">
        Le journal de guerre de ce clan est privé. Le chef peut le rendre public dans les
        paramètres du clan.
      </p>
    );
  }

  const fighting = war.state !== 'preparation';
  const pending = war.members
    .map((m) => ({ ...m, left: war.attacksPerMember - m.attacks.length }))
    .filter((m) => m.left > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-night-950 p-4">
        <p className="mb-2 text-center text-sm text-slate-300">
          <span className="font-display text-gold-300">{STATE_LABELS[war.state] ?? war.state}</span>
          {' · '}
          {war.teamSize} contre {war.teamSize}
          {timing(war) && ` · ${timing(war)}`}
        </p>
        <div className="flex items-center gap-3">
          <Side side={war.clan} />
          <span className="font-display text-xl text-slate-500">VS</span>
          <Side side={war.opponent} align="right" />
        </div>
      </div>

      {fighting && (
        <div>
          <h4 className="mb-2 font-display text-lg text-gold-300">
            {war.state === 'inWar' ? 'Attaques restantes' : 'Attaques non utilisées'} (
            {pending.reduce((n, m) => n + m.left, 0)})
          </h4>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-400">Tout le monde a utilisé ses attaques. 👏</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {pending.map((m) => (
                <li key={m.tag}>
                  <button
                    type="button"
                    onClick={() => onSelectPlayer(m.tag)}
                    className="cursor-pointer rounded-full bg-red-500/15 px-3 py-1 text-sm text-red-200 ring-1 ring-red-500/40 hover:bg-red-500/25"
                  >
                    {m.name} <span className="font-display">×{m.left}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ol className="flex flex-col gap-1.5">
        {war.members.map((m) => (
          <li key={m.tag} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-night-800 px-3 py-2">
            <span className="w-6 shrink-0 text-center font-display text-slate-400">{m.position}</span>
            <span className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelectPlayer(m.tag)}
                className="block max-w-full cursor-pointer truncate font-semibold hover:text-gold-300 hover:underline"
              >
                {m.name}
              </button>
              {m.townHallLevel && <span className="text-xs text-slate-400">HDV {m.townHallLevel}</span>}
            </span>
            {fighting && (
              <span className="flex flex-wrap justify-end gap-1.5">
                {m.attacks.map((a, i) => (
                  <Attack key={i} attack={a} />
                ))}
                {m.attacks.length === 0 && <span className="text-xs text-slate-500">Pas encore attaqué</span>}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function WarPanel({ clanTag, onSelectPlayer }) {
  const { status, data: war, error } = useAsync(getWar, clanTag);

  return (
    <section className="panel p-4 sm:p-5">
      <h3 className="title-clash mb-4 text-2xl">⚔️ Guerre de clan</h3>
      {status === 'loading' && <p className="text-slate-400">Chargement de la guerre…</p>}
      {status === 'error' && (
        <p role="alert" className="text-red-300">
          ⚠️ {error}
        </p>
      )}
      {status === 'success' && <WarContent war={war} onSelectPlayer={onSelectPlayer} />}
    </section>
  );
}
