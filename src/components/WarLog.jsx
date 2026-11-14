import { History, Star } from 'lucide-react';
import { getWarLog } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { formatDate, RESULT_LABELS, RESULT_STYLES } from '../lib/format.js';
import AsyncSection from './AsyncSection.jsx';

function summarize(wars) {
  const count = (r) => wars.filter((w) => w.result === r).length;
  let streak = 0;
  while (streak < wars.length && wars[streak].result === wars[0].result) streak += 1;
  return { wins: count('win'), losses: count('lose'), ties: count('tie'), streak };
}

export function ResultBadge({ result }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${RESULT_STYLES[result]}`}>
      {RESULT_LABELS[result]}
    </span>
  );
}

export default function WarLog({ clanTag }) {
  const state = useAsync(getWarLog, clanTag);

  return (
    <AsyncSection icon={History} title="Historique des guerres" state={state}>
      {({ private: isPrivate, wars }) => {
        if (isPrivate) {
          return <p className="p-4 text-sm text-zinc-400">Le journal de guerre de ce clan est privé.</p>;
        }
        if (wars.length === 0) {
          return <p className="p-4 text-sm text-zinc-400">Aucune guerre classique récente.</p>;
        }
        const s = summarize(wars);
        return (
          <>
            <p className="border-b border-white/[0.08] p-4 text-sm text-zinc-300">
              Sur les {wars.length} dernières guerres :{' '}
              <span className="font-semibold text-emerald-300">{s.wins} victoires</span>,{' '}
              <span className="font-semibold text-red-300">{s.losses} défaites</span>
              {s.ties > 0 && `, ${s.ties} égalités`}, soit {Math.round((s.wins / wars.length) * 100)} % de
              victoires. Série en cours : {s.streak}{' '}
              {RESULT_LABELS[wars[0].result].toLowerCase()}
              {s.streak > 1 ? 's' : ''}.
            </p>
            <ol className="divide-y divide-white/5">
              {wars.map((w, i) => (
                <li key={i} className="row-hover flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
                  <span className="w-14 shrink-0 text-xs text-zinc-500">{formatDate(w.endTime)}</span>
                  <ResultBadge result={w.result} />
                  <span className="min-w-0 flex-1 truncate text-zinc-200">contre {w.opponentName}</span>
                  <span className="flex items-center gap-1 font-semibold text-white tabular-nums">
                    {w.stars} – {w.opponentStars}
                    <Star className="size-3.5 fill-accent-400 text-accent-400" aria-hidden="true" />
                  </span>
                  <span className="w-28 text-right text-xs text-zinc-500 tabular-nums">
                    {w.destruction.toFixed(1)} % – {w.opponentDestruction.toFixed(1)} %
                  </span>
                </li>
              ))}
            </ol>
          </>
        );
      }}
    </AsyncSection>
  );
}
