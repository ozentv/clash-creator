import { useMemo } from 'react';
import { findInactiveMembers } from '../lib/rankings.js';
import { formatNumber, ROLE_LABELS } from '../lib/format.js';

export default function InactiveMembers({ members, onSelectPlayer }) {
  const inactive = useMemo(() => findInactiveMembers(members), [members]);

  return (
    <section className="panel p-4 sm:p-5">
      <h3 className="title-clash text-2xl">😴 Membres à surveiller ({inactive.length})</h3>
      <p className="mt-1 mb-4 text-sm text-slate-400">
        Estimation à partir des dons et trophées de la saison : le jeu ne communique pas la date
        de dernière connexion.
      </p>
      {inactive.length === 0 ? (
        <p className="text-slate-300">Aucun membre ne ressort comme inactif. 👏</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {inactive.map((m) => (
            <li key={m.tag} className="rounded-lg bg-night-800 px-3 py-2">
              <div className="flex items-baseline justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectPlayer(m.tag)}
                  className="min-w-0 cursor-pointer truncate font-semibold hover:text-gold-300 hover:underline"
                >
                  {m.name}
                </button>
                <span className="shrink-0 text-xs text-slate-400">{ROLE_LABELS[m.role] ?? m.role}</span>
              </div>
              <p className="text-xs text-red-200">{m.reason}</p>
              <p className="mt-1 text-xs text-slate-400 tabular-nums">
                🎁 {formatNumber(m.donations)} donnés · {formatNumber(m.donationsReceived)} reçus · 🏆{' '}
                {formatNumber(m.trophies)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
