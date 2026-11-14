import { useMemo } from 'react';
import { UserX } from 'lucide-react';
import { findInactiveMembers } from '../lib/rankings.js';
import { formatNumber, ROLE_LABELS } from '../lib/format.js';

export default function InactiveMembers({ members, onSelectPlayer }) {
  const inactive = useMemo(() => findInactiveMembers(members), [members]);

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-white/[0.08] p-4">
        <h3 className="section-label">
          <UserX className="size-4 text-accent-400" aria-hidden="true" />
          Membres à surveiller
          <span className="text-zinc-600">{inactive.length}</span>
        </h3>
        <p className="mt-1.5 text-xs text-zinc-500">
          Estimation à partir des dons et trophées de la saison : le jeu ne communique pas la date
          de dernière connexion.
        </p>
      </div>
      {inactive.length === 0 ? (
        <p className="p-4 text-sm text-zinc-300">Aucun membre ne ressort comme inactif.</p>
      ) : (
        <ul className="grid gap-px bg-white/5 sm:grid-cols-2">
          {inactive.map((m) => (
            <li key={m.tag} className="bg-ink-900 px-4 py-3 transition-colors hover:bg-ink-800">
              <div className="flex items-baseline justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectPlayer(m.tag)}
                  className="player-link min-w-0 truncate"
                >
                  {m.name}
                </button>
                <span className="shrink-0 text-xs text-zinc-500">{ROLE_LABELS[m.role] ?? m.role}</span>
              </div>
              <p className="text-xs text-red-300">{m.reason}</p>
              <p className="mt-1 text-xs text-zinc-500 tabular-nums">
                {formatNumber(m.donations)} donnés · {formatNumber(m.donationsReceived)} reçus ·{' '}
                {formatNumber(m.trophies)} trophées
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
