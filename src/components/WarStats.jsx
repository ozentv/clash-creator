import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChartNoAxesColumn, Star } from 'lucide-react';
import { getWarStats } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { formatDate } from '../lib/format.js';
import AsyncSection from './AsyncSection.jsx';
import { ResultBadge } from './WarLog.jsx';

const decimal = (n) => (n == null ? '—' : n.toFixed(2).replace('.', ','));
const COLUMNS = [
  { key: 'name', label: 'Joueur', value: (m) => m.name.toLowerCase(), text: true },
  { key: 'wars', label: 'Guerres', value: (m) => m.wars },
  { key: 'missed', label: 'Attaques', value: (m) => m.missed },
  { key: 'stars', label: 'Étoiles', value: (m) => m.stars },
  { key: 'averageStars', label: 'Moy. / attaque', value: (m) => m.averageStars ?? -1 },
  { key: 'averageDestruction', label: 'Destruction moy.', value: (m) => m.averageDestruction ?? -1 },
  { key: 'triples', label: 'Triples', value: (m) => m.triples },
];

// Bilan de chaque membre sur les guerres enregistrées par le site (classiques et manches de ligue).
export default function WarStats({ clan, onSelectPlayer }) {
  const state = useAsync(getWarStats, clan.tag);
  const [sort, setSort] = useState({ key: 'stars', dir: 'desc' });
  const current = useMemo(() => new Set(clan.members.map((m) => m.tag)), [clan.members]);

  function toggle(column) {
    setSort((s) =>
      s.key === column.key
        ? { key: s.key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, dir: column.text ? 'asc' : 'desc' },
    );
  }

  return (
    <AsyncSection icon={ChartNoAxesColumn} title="Bilan des membres en guerre" state={state}>
      {({ enabled, wars, members }) => {
        if (!enabled) {
          return (
            <p className="p-4 text-sm text-zinc-400">
              Ce bilan a besoin d'une base de données : ajoute la variable DATABASE_URL côté serveur.
            </p>
          );
        }
        if (wars.length === 0) {
          return (
            <p className="p-4 text-sm text-zinc-400">
              Aucune guerre terminée n'est encore enregistrée. Le site garde le détail de chaque guerre à partir
              du moment où elle est consultée ici ; le bilan se remplira au fil des guerres.
            </p>
          );
        }
        const column = COLUMNS.find((c) => c.key === sort.key);
        const sign = sort.dir === 'asc' ? 1 : -1;
        const rows = [...members].sort((a, b) => {
          const [x, y] = [column.value(a), column.value(b)];
          return (x < y ? -1 : x > y ? 1 : 0) * sign;
        });
        const missed = members.reduce((n, m) => n + m.missed, 0);
        return (
          <>
            <p className="border-b border-white/[0.08] p-4 text-sm text-zinc-300">
              Sur <span className="font-semibold text-white">{wars.length} guerres</span> enregistrées depuis le{' '}
              {formatDate(wars.at(-1).endTime)}, manches de ligue comprises.{' '}
              {missed > 0 ? (
                <span className="text-red-300">{missed} attaques n'ont pas été faites.</span>
              ) : (
                'Aucune attaque manquée.'
              )}
            </p>
            <ul className="flex gap-2 overflow-x-auto border-b border-white/[0.08] p-4" aria-label="Guerres prises en compte">
              {wars.map((w) => (
                <li key={w.endTime} className="shrink-0 rounded-lg border border-white/[0.08] px-3 py-2 text-xs">
                  <p className="flex items-center gap-2">
                    <ResultBadge result={w.result} />
                    <span className="flex items-center gap-1 font-semibold text-white tabular-nums">
                      {w.stars} – {w.opponentStars}
                      <Star className="size-3 fill-accent-400 text-accent-400" aria-hidden="true" />
                    </span>
                  </p>
                  <p className="mt-1 max-w-40 truncate text-zinc-400">{w.opponentName}</p>
                  <p className="text-zinc-600">
                    {formatDate(w.endTime)}
                    {w.kind === 'ligue' && ' · ligue'}
                  </p>
                </li>
              ))}
            </ul>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr>
                    {COLUMNS.map((c) => {
                      const active = sort.key === c.key;
                      const Arrow = sort.dir === 'asc' ? ArrowUp : ArrowDown;
                      return (
                        <th
                          key={c.key}
                          aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                          className={`px-4 py-2.5 font-normal ${c.text ? '' : 'text-right'}`}
                        >
                          <button
                            type="button"
                            onClick={() => toggle(c)}
                            className={`inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] tracking-wider uppercase hover:text-white ${
                              active ? 'text-accent-400' : 'text-zinc-500'
                            }`}
                          >
                            {c.label}
                            {active && <Arrow className="size-3" aria-hidden="true" />}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((m) => (
                    <tr key={m.tag} className="row-hover border-t border-white/5">
                      <td className="px-4 py-2">
                        <button type="button" onClick={() => onSelectPlayer(m.tag)} className="player-link">
                          {m.name}
                        </button>
                        {!current.has(m.tag) && <span className="ml-2 text-xs text-zinc-600">a quitté le clan</span>}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">{m.wars}</td>
                      <td className={`px-4 py-2 text-right tabular-nums ${m.missed > 0 ? 'text-red-300' : 'text-zinc-300'}`}>
                        {m.attacks} / {m.possible}
                        {m.missed > 0 && <span className="ml-1.5 text-xs">({m.missed} manquée{m.missed > 1 ? 's' : ''})</span>}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-white tabular-nums">{m.stars}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{decimal(m.averageStars)}</td>
                      <td className="px-4 py-2 text-right text-zinc-400 tabular-nums">
                        {m.averageDestruction == null ? '—' : `${m.averageDestruction} %`}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">{m.triples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      }}
    </AsyncSection>
  );
}
