import { useMemo } from 'react';
import { computeStats } from '../lib/rankings.js';
import { formatNumber } from '../lib/format.js';

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="panel flex min-w-0 flex-col gap-1 p-4">
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <span className="text-xs tracking-wide text-slate-400 uppercase">{label}</span>
      <span className="truncate font-display text-2xl text-gold-300 sm:text-3xl">{value}</span>
      {hint && <span className="truncate text-xs text-slate-400">{hint}</span>}
    </div>
  );
}

export default function StatCards({ members }) {
  const stats = useMemo(() => computeStats(members), [members]);

  return (
    <section aria-label="Statistiques du clan" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard icon="👥" label="Membres" value={`${stats.count}/50`} />
      <StatCard
        icon="🏆"
        label="Trophées cumulés"
        value={formatNumber(stats.totalTrophies)}
        hint={`Moyenne : ${formatNumber(stats.avgTrophies)}`}
      />
      <StatCard
        icon="🎁"
        label="Dons de la saison"
        value={formatNumber(stats.totalDonations)}
        hint={`Moyenne : ${formatNumber(stats.avgDonations)}`}
      />
      <StatCard
        icon="👑"
        label="Meilleur donateur"
        value={stats.topDonor?.name ?? '—'}
        hint={stats.topDonor && `${formatNumber(stats.topDonor.donations)} dons`}
      />
    </section>
  );
}
