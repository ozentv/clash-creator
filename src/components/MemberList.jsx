import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { formatNumber, ROLE_LABELS } from '../lib/format.js';

export default function MemberList({ members, onSelectPlayer }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? members.filter((m) => m.name.toLowerCase().includes(q)) : members;
  }, [members, query]);

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
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
            placeholder="Rechercher un membre…"
            aria-label="Rechercher un membre"
            className="field w-full py-2 pr-3 pl-9 text-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Joueur</th>
              <th className="px-4 py-2.5 font-medium">Rôle</th>
              <th className="px-4 py-2.5 text-right font-medium">HDV</th>
              <th className="px-4 py-2.5 text-right font-medium">Trophées</th>
              <th className="px-4 py-2.5 text-right font-medium">Dons</th>
              <th className="px-4 py-2.5 text-right font-medium">Reçus</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.tag} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-2.5">
                  <button type="button" onClick={() => onSelectPlayer(m.tag)} className="player-link">
                    {m.name}
                  </button>
                  <span className="block text-xs text-zinc-600">{m.tag}</span>
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
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-zinc-400">Aucun membre ne correspond.</p>
        )}
      </div>
    </section>
  );
}
