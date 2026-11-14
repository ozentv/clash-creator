import { Info } from 'lucide-react';
import { formatNumber } from '../lib/format.js';
import { CLAN_TYPE_LABELS, labelName, leagueName, WAR_FREQUENCY_LABELS } from '../lib/names.js';

// Fiche d'identité du clan : conditions d'entrée, bilan de guerre, capitale.
export default function ClanInfo({ clan }) {
  const played = clan.warLosses != null ? clan.warWins + clan.warLosses + (clan.warTies ?? 0) : null;
  const rows = [
    ['Accès', CLAN_TYPE_LABELS[clan.type]],
    ['Trophées requis', clan.requiredTrophies != null && formatNumber(clan.requiredTrophies)],
    ['Hôtel de ville requis', clan.requiredTownHall && `HDV ${clan.requiredTownHall}`],
    ['Langue', clan.language],
    ['Fréquence de guerre', WAR_FREQUENCY_LABELS[clan.warFrequency]],
    [
      'Bilan de guerre',
      played != null
        ? `${formatNumber(clan.warWins)} V · ${formatNumber(clan.warLosses)} D · ${formatNumber(clan.warTies ?? 0)} N`
        : `${formatNumber(clan.warWins)} victoires`,
    ],
    ['Taux de victoire', played ? `${Math.round((clan.warWins / played) * 100)} %` : null],
    ['Série de victoires', clan.warWinStreak > 0 && formatNumber(clan.warWinStreak)],
    ['Journal de guerre', clan.warLogPublic == null ? null : clan.warLogPublic ? 'Public' : 'Privé'],
    ['Ligue de guerre', leagueName(clan.warLeague)],
    ['Capitale', clan.capitalHallLevel && `Niveau ${clan.capitalHallLevel}`],
    ['Points de capitale', clan.capitalPoints != null && formatNumber(clan.capitalPoints)],
    ['Ligue de capitale', leagueName(clan.capitalLeague)],
    ['Points base des ouvriers', clan.builderBasePoints != null && formatNumber(clan.builderBasePoints)],
  ].filter(([, value]) => value);

  return (
    <section className="card overflow-hidden">
      <h3 className="section-label border-b border-white/[0.08] p-4">
        <Info className="size-4 text-accent-400" aria-hidden="true" />
        Fiche du clan
      </h3>
      {clan.labels.length > 0 && (
        <ul className="flex flex-wrap gap-2 border-b border-white/[0.08] p-4">
          {clan.labels.map((label) => (
            <li key={label.name} className="flex items-center gap-1.5 rounded-md border border-white/[0.08] py-1 pr-2.5 pl-1.5 text-xs text-zinc-300">
              {label.iconUrl && <img src={label.iconUrl} alt="" className="size-5" />}
              {labelName(label.name)}
            </li>
          ))}
        </ul>
      )}
      <dl className="divide-y divide-white/5">
        {rows.map(([label, value]) => (
          <div key={label} className="row-hover flex items-baseline justify-between gap-4 px-4 py-2 text-sm">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="text-right font-medium text-zinc-100 tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
