import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Search, Users } from 'lucide-react';
import { formatNumber, ROLE_LABELS } from '../lib/format.js';

const ROLE_RANK = { leader: 0, coLeader: 1, admin: 2, member: 3 };
const COLUMNS = [
  { key: 'name', label: 'Joueur', value: (m) => m.name.toLowerCase(), numeric: false },
  { key: 'role', label: 'Rôle', value: (m) => ROLE_RANK[m.role] ?? 9, numeric: false },
  { key: 'townHallLevel', label: 'HDV', value: (m) => m.townHallLevel ?? 0, numeric: true },
  { key: 'trophies', label: 'Trophées', value: (m) => m.trophies, numeric: true },
  { key: 'donations', label: 'Dons', value: (m) => m.donations, numeric: true },
  { key: 'donationsReceived', label: 'Reçus', value: (m) => m.donationsReceived, numeric: true },
];

export default function MemberList({ members, onSelectPlayer }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'trophies', dir: 'desc' });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const column = COLUMNS.find((c) => c.key === sort.key);
    const sign = sort.dir === 'asc' ? 1 : -1;
    return members
      .filter((m) => !q || m.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const [x, y] = [column.value(a), column.value(b)];
        return (x < y ? -1 : x > y ? 1 : 0) * sign;
      });
  }, [members, query, sort]);

  function toggleSort(column) {
    setSort((s) =>
      s.key === column.key
        ? { key: s.key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, dir: column.numeric ? 'desc' : 'asc' },
    );
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] p-4">
        <h3 className="section-label">
          <Users className="size-4 text-accent-400" aria-hidden="true" />
          Membres
          <span className="text-zinc-600">{members.length}</span>
        </h3>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrer par pseudo…"
            aria-label="Filtrer les membres par pseudo"
            className="field w-full py-2 pr-3 pl-9 text-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr>
              {COLUMNS.map((c) => {
                const active = sort.key === c.key;
                const Arrow = sort.dir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={c.key}
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={`px-4 py-2.5 font-normal ${c.numeric ? 'text-right' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(c)}
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
                <td className="px-4 py-2.5">
                  <button type="button" onClick={() => onSelectPlayer(m.tag)} className="player-link">
                    {m.name}
                  </button>
                  <span className="block font-mono text-[11px] text-zinc-600">{m.tag}</span>
                </td>
                <td className="px-4 py-2.5 text-zinc-400">{ROLE_LABELS[m.role] ?? m.role}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{m.townHallLevel ?? '—'}</td>
                <td className="px-4 py-2.5 text-right font-medium text-white tabular-nums">
                  {formatNumber(m.trophies)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatNumber(m.donations)}</td>
                <td className="px-4 py-2.5 text-right text-zinc-500 tabular-nums">
                  {formatNumber(m.donationsReceived)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-400">Aucun membre ne correspond.</p>
        )}
      </div>
    </section>
  );
}
