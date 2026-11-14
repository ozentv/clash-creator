import { useMemo } from 'react';
import { Crown, Gift, Trophy, Users } from 'lucide-react';
import { computeStats } from '../lib/rankings.js';
import { formatNumber } from '../lib/format.js';

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="card min-w-0 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-zinc-400">{label}</span>
        <Icon className="size-4 shrink-0 text-accent-400" aria-hidden="true" />
      </div>
      <p className="mt-2 text-xl leading-tight font-bold break-words text-white tabular-nums sm:text-2xl">{value}</p>
      <p className="h-4 truncate text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

export default function StatCards({ members }) {
  const stats = useMemo(() => computeStats(members), [members]);

  return (
    <section aria-label="Statistiques du clan" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard icon={Users} label="Membres" value={`${stats.count} / 50`} />
      <StatCard
        icon={Trophy}
        label="Trophées cumulés"
        value={formatNumber(stats.totalTrophies)}
        hint={`Moyenne ${formatNumber(stats.avgTrophies)}`}
      />
      <StatCard
        icon={Gift}
        label="Dons de la saison"
        value={formatNumber(stats.totalDonations)}
        hint={`Moyenne ${formatNumber(stats.avgDonations)}`}
      />
      <StatCard
        icon={Crown}
        label="Meilleur donateur"
        value={stats.topDonor?.name ?? '—'}
        hint={stats.topDonor && `${formatNumber(stats.topDonor.donations)} dons`}
      />
    </section>
  );
}
