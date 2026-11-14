import { useState } from 'react';
import { ChartLine, LogIn, LogOut, Table2 } from 'lucide-react';
import { getClanHistory } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { formatDate, formatNumber } from '../lib/format.js';
import LineChart from './LineChart.jsx';

const RANGES = [
  [30, '30 jours'],
  [90, '90 jours'],
  [0, 'Tout'],
];

function Notice({ title, children }) {
  return (
    <div className="card p-8 text-center">
      <ChartLine className="mx-auto size-10 text-zinc-700" aria-hidden="true" />
      <p className="mt-4 font-display text-xl text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-400">{children}</p>
    </div>
  );
}

export default function HistoryTab({ clanTag, onSelectPlayer }) {
  const { status, data, error } = useAsync(getClanHistory, clanTag);
  const [range, setRange] = useState(30);
  const [table, setTable] = useState(false);

  if (status === 'loading' || status === 'idle') {
    return (
      <div role="status" aria-label="Chargement" className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-64 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (status === 'error') {
    return (
      <p role="alert" className="card p-6 text-center text-sm text-red-300">
        {error}
      </p>
    );
  }
  if (!data.enabled) {
    return (
      <Notice title="Historique non activé">
        Le suivi dans le temps a besoin d'une base de données : ajoute la variable DATABASE_URL côté serveur.
      </Notice>
    );
  }
  if (data.days.length < 2) {
    return (
      <Notice title="L'historique commence aujourd'hui">
        Le site enregistre un relevé de ce clan par jour, à chaque visite. Les courbes apparaîtront dès demain,
        puis s'allongeront jour après jour.
      </Notice>
    );
  }

  const days = range ? data.days.slice(-range) : data.days;
  const since = days[0].day;
  const movements = data.movements.filter((m) => m.day >= since);
  const series = (key) => days.map((d) => ({ day: d.day, value: d[key] }));

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Période affichée" className="flex gap-2">
          {RANGES.map(([value, label]) => (
            <button key={value} type="button" className="btn btn-quiet px-3 py-1.5" aria-pressed={range === value} onClick={() => setRange(value)}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-quiet ml-auto px-3 py-1.5" aria-pressed={table} onClick={() => setTable((t) => !t)}>
          <Table2 className="size-4" aria-hidden="true" />
          Tableau
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <LineChart title="Trophées cumulés" points={series('totalTrophies')} />
        <LineChart title="Membres" points={series('memberCount')} />
        <LineChart title="Dons de la saison" points={series('totalDonations')} />
      </div>
      <p className="-mt-2 text-xs text-zinc-500">
        {days.length} relevés, du {formatDate(days[0].day)} au {formatDate(days.at(-1).day)} — les dons repartent
        de zéro à chaque nouvelle saison.
      </p>

      {table && (
        <section className="card overflow-hidden">
          <div className="max-h-96 overflow-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="sticky top-0 bg-ink-900 text-xs text-zinc-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Jour</th>
                  <th className="px-4 py-2.5 text-right font-medium">Membres</th>
                  <th className="px-4 py-2.5 text-right font-medium">Trophées</th>
                  <th className="px-4 py-2.5 text-right font-medium">Dons</th>
                  <th className="px-4 py-2.5 text-right font-medium">Points de clan</th>
                </tr>
              </thead>
              <tbody>
                {[...days].reverse().map((d) => (
                  <tr key={d.day} className="row-hover border-t border-white/5">
                    <td className="px-4 py-2 text-zinc-300">{formatDate(d.day)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{d.memberCount}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatNumber(d.totalTrophies)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatNumber(d.totalDonations)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatNumber(d.points)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="card overflow-hidden">
        <h3 className="section-label border-b border-white/[0.08] p-4">
          Arrivées et départs
          <span className="text-zinc-600">{movements.length}</span>
        </h3>
        {movements.length === 0 ? (
          <p className="p-4 text-sm text-zinc-400">Aucun mouvement de membre sur la période.</p>
        ) : (
          <ol className="divide-y divide-white/5">
            {movements.map((m) => (
              <li key={m.day} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 text-sm">
                <span className="w-16 shrink-0 text-xs text-zinc-500">{formatDate(m.day)}</span>
                {m.joined.map((p) => (
                  <button key={p.tag} type="button" onClick={() => onSelectPlayer(p.tag)} className="flex cursor-pointer items-center gap-1.5 rounded-md bg-emerald-400/10 px-2 py-0.5 text-emerald-300 hover:bg-emerald-400/20">
                    <LogIn className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Arrivée :</span>
                    {p.name}
                  </button>
                ))}
                {m.left.map((p) => (
                  <button key={p.tag} type="button" onClick={() => onSelectPlayer(p.tag)} className="flex cursor-pointer items-center gap-1.5 rounded-md bg-red-400/10 px-2 py-0.5 text-red-300 hover:bg-red-400/20">
                    <LogOut className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Départ :</span>
                    {p.name}
                  </button>
                ))}
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
