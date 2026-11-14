import { useMemo } from 'react';
import { ArrowDownToLine, Castle, Crown, Gift, HandHeart, Star, Trophy, Users } from 'lucide-react';
import { computeStats, rankMembers } from '../lib/rankings.js';
import { formatNumber } from '../lib/format.js';
import AnimatedNumber from './AnimatedNumber.jsx';

function StatCard({ icon: Icon, label, children, hint }) {
  return (
    <div className="card card-lift group min-w-0 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-zinc-400">{label}</span>
        <Icon
          className="size-4 shrink-0 text-accent-400 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12"
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-xl leading-tight font-bold break-words text-white tabular-nums sm:text-2xl">
        {children}
      </p>
      <p className="h-4 truncate text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

const oneDecimal = (n) => (n / 10).toFixed(1).replace('.', ',');

export default function StatCards({ members }) {
  const stats = useMemo(() => {
    const base = computeStats(members);
    const avg = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
    return {
      ...base,
      totalReceived: members.reduce((n, m) => n + m.donationsReceived, 0),
      donors: members.filter((m) => m.donations > 0).length,
      avgTownHall: avg(members.map((m) => m.townHallLevel).filter(Boolean)),
      avgLevel: Math.round(avg(members.map((m) => m.expLevel))),
      topTrophies: rankMembers(members, 'trophies')[0] ?? null,
    };
  }, [members]);

  return (
    <section aria-label="Statistiques du clan" className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard icon={Users} label="Membres" hint={`${50 - stats.count} places libres`}>
        <AnimatedNumber value={stats.count} /> / 50
      </StatCard>
      <StatCard icon={Trophy} label="Trophées cumulés" hint={`Moyenne ${formatNumber(stats.avgTrophies)}`}>
        <AnimatedNumber value={stats.totalTrophies} format={formatNumber} />
      </StatCard>
      <StatCard icon={Gift} label="Dons de la saison" hint={`Moyenne ${formatNumber(stats.avgDonations)}`}>
        <AnimatedNumber value={stats.totalDonations} format={formatNumber} />
      </StatCard>
      <StatCard icon={ArrowDownToLine} label="Dons reçus" hint="cette saison">
        <AnimatedNumber value={stats.totalReceived} format={formatNumber} />
      </StatCard>
      <StatCard icon={Castle} label="Hôtel de ville moyen" hint="tous membres confondus">
        <AnimatedNumber value={Math.round(stats.avgTownHall * 10)} format={oneDecimal} />
      </StatCard>
      <StatCard icon={Star} label="Niveau moyen">
        <AnimatedNumber value={stats.avgLevel} />
      </StatCard>
      <StatCard
        icon={HandHeart}
        label="Membres donateurs"
        hint={stats.count ? `${Math.round((stats.donors / stats.count) * 100)} % du clan` : null}
      >
        <AnimatedNumber value={stats.donors} /> / {stats.count}
      </StatCard>
      <StatCard
        icon={Crown}
        label="Meilleur donateur"
        hint={stats.topDonor && `${formatNumber(stats.topDonor.donations)} dons`}
      >
        {stats.topDonor?.name ?? '—'}
      </StatCard>
    </section>
  );
}
