import { useMemo } from 'react';
import { Castle } from 'lucide-react';
import { ROLE_LABELS } from '../lib/format.js';

const ROLE_ORDER = ['leader', 'coLeader', 'admin', 'member'];

// Répartition des membres par hôtel de ville et par rôle.
export default function Composition({ members }) {
  const { halls, roles, max } = useMemo(() => {
    const byHall = new Map();
    const byRole = new Map();
    for (const m of members) {
      if (m.townHallLevel) byHall.set(m.townHallLevel, (byHall.get(m.townHallLevel) ?? 0) + 1);
      byRole.set(m.role, (byRole.get(m.role) ?? 0) + 1);
    }
    const halls = [...byHall.entries()].sort((a, b) => b[0] - a[0]);
    return {
      halls,
      roles: ROLE_ORDER.filter((r) => byRole.has(r)).map((r) => [r, byRole.get(r)]),
      max: Math.max(1, ...halls.map(([, n]) => n)),
    };
  }, [members]);

  return (
    <section className="card overflow-hidden">
      <h3 className="section-label border-b border-white/[0.08] p-4">
        <Castle className="size-4 text-accent-400" aria-hidden="true" />
        Composition
      </h3>
      {halls.length === 0 ? (
        <p className="p-4 text-sm text-zinc-400">Niveaux d'hôtel de ville indisponibles.</p>
      ) : (
        <ul className="flex flex-col gap-2 p-4" aria-label="Membres par hôtel de ville">
          {halls.map(([level, count], i) => (
            <li key={level} className="flex items-center gap-3 text-sm">
              <span className="w-14 shrink-0 font-mono text-xs text-zinc-500">HDV {level}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                <span
                  className="bar-grow block h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400"
                  style={{ width: `${(count / max) * 100}%`, animationDelay: `${i * 50}ms` }}
                />
              </span>
              <span className="w-6 shrink-0 text-right font-semibold text-white tabular-nums">{count}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="grid grid-cols-2 gap-px border-t border-white/[0.08] bg-white/[0.05]">
        {roles.map(([role, count]) => (
          <div key={role} className="bg-ink-900 px-4 py-3">
            <dt className="text-xs text-zinc-500">{ROLE_LABELS[role] ?? role}</dt>
            <dd className="text-lg font-semibold text-white tabular-nums">{count}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
