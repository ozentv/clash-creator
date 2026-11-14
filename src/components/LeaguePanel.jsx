import { Medal, Star } from 'lucide-react';
import { getLeague } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import AsyncSection from './AsyncSection.jsx';
import { ResultBadge } from './WarLog.jsx';

const ROUND_STATE = { preparation: 'Préparation', inWar: 'En cours' };

export default function LeaguePanel({ clanTag, onSelectPlayer }) {
  const state = useAsync(getLeague, clanTag);

  return (
    <AsyncSection icon={Medal} title="Ligue de guerre de clans" state={state}>
      {(league) => {
        if (league.state === 'none') {
          return (
            <p className="p-4 text-sm text-zinc-400">
              Ce clan ne participe pas à la ligue de guerre de clans en ce moment.
            </p>
          );
        }
        const totalStars = league.rounds.reduce((n, r) => n + r.stars, 0);
        return (
          <>
            <p className="border-b border-white/[0.08] p-4 text-sm text-zinc-300">
              Saison {league.season ?? '—'} · {league.clans.length} clans dans le groupe ·{' '}
              <span className="font-semibold text-white">{totalStars} étoiles</span> gagnées
            </p>
            {league.rounds.length === 0 ? (
              <p className="p-4 text-sm text-zinc-400">Les manches n'ont pas encore commencé.</p>
            ) : (
              <ol className="divide-y divide-white/5 border-b border-white/10">
                {league.rounds.map((r) => (
                  <li key={r.round} className="row-hover flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
                    <span className="w-20 shrink-0 text-xs text-zinc-500">Manche {r.round}</span>
                    {r.result ? (
                      <ResultBadge result={r.result} />
                    ) : (
                      <span className="rounded-md bg-accent-400/10 px-2 py-0.5 text-xs font-semibold text-accent-400">
                        {ROUND_STATE[r.state] ?? r.state}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-zinc-200">contre {r.opponentName}</span>
                    {r.state !== 'preparation' && (
                      <span className="flex items-center gap-1 font-semibold text-white tabular-nums">
                        {r.stars} – {r.opponentStars}
                        <Star className="size-3.5 fill-accent-400 text-accent-400" aria-hidden="true" />
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
            {league.members.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="text-xs text-zinc-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Joueur</th>
                      <th className="px-4 py-2.5 text-right font-medium">Étoiles</th>
                      <th className="px-4 py-2.5 text-right font-medium">Attaques</th>
                      <th className="px-4 py-2.5 text-right font-medium">Destruction moy.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {league.members.map((m) => (
                      <tr key={m.tag} className="row-hover border-t border-white/5">
                        <td className="px-4 py-2">
                          <button type="button" onClick={() => onSelectPlayer(m.tag)} className="player-link">
                            {m.name}
                          </button>
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-white tabular-nums">{m.stars}</td>
                        <td
                          className={`px-4 py-2 text-right tabular-nums ${
                            m.attacks < m.wars ? 'text-red-300' : 'text-zinc-300'
                          }`}
                        >
                          {m.attacks} / {m.wars}
                        </td>
                        <td className="px-4 py-2 text-right text-zinc-400 tabular-nums">
                          {m.attacks ? `${Math.round(m.destruction / m.attacks)} %` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        );
      }}
    </AsyncSection>
  );
}
