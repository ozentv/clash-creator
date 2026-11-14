import { useMemo, useState } from 'react';
import { formatNumber, ROLE_LABELS } from '../lib/format.js';

export default function MemberList({ members, onSelectPlayer }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? members.filter((m) => m.name.toLowerCase().includes(q)) : members;
  }, [members, query]);

  return (
    <section className="panel p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="title-clash text-2xl">👥 Membres ({members.length})</h3>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un membre…"
          aria-label="Rechercher un membre"
          className="w-full rounded-xl border-2 border-night-700 bg-night-950 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none sm:w-64"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs tracking-wide text-slate-400 uppercase">
            <tr>
              <th className="px-3 py-2">Joueur</th>
              <th className="px-3 py-2">Rôle</th>
              <th className="px-3 py-2 text-right">HDV</th>
              <th className="px-3 py-2 text-right">Trophées</th>
              <th className="px-3 py-2 text-right">Dons</th>
              <th className="px-3 py-2 text-right">Reçus</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.tag} className="border-t border-night-700">
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onSelectPlayer(m.tag)}
                    className="cursor-pointer text-left font-semibold hover:text-gold-300 hover:underline"
                  >
                    {m.name}
                  </button>
                  <span className="block font-mono text-xs text-slate-500">{m.tag}</span>
                </td>
                <td className="px-3 py-2 text-slate-300">{ROLE_LABELS[m.role] ?? m.role}</td>
                <td className="px-3 py-2 text-right tabular-nums">{m.townHallLevel ?? '—'}</td>
                <td className="px-3 py-2 text-right text-gold-300 tabular-nums">
                  {formatNumber(m.trophies)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{formatNumber(m.donations)}</td>
                <td className="px-3 py-2 text-right text-slate-400 tabular-nums">
                  {formatNumber(m.donationsReceived)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-6 text-center text-slate-400">Aucun membre ne correspond.</p>
        )}
      </div>
    </section>
  );
}
