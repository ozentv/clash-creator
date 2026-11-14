import { MapPin, Shield, Swords, Trophy, Medal } from 'lucide-react';
import { formatNumber } from '../lib/format.js';

export default function ClanHeader({ clan }) {
  const facts = [
    clan.location && [MapPin, clan.location],
    clan.warLeague && [Swords, clan.warLeague],
    [Medal, `${formatNumber(clan.warWins)} guerres gagnées`],
    [Trophy, `${formatNumber(clan.points)} points de clan`],
  ].filter(Boolean);

  return (
    <section className="card flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:text-left">
      {clan.badgeUrl ? (
        <img src={clan.badgeUrl} alt="" className="size-20 shrink-0" />
      ) : (
        <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-ink-800 text-zinc-500">
          <Shield className="size-9" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0">
        <h2 className="font-display text-3xl break-words text-white">{clan.name}</h2>
        <p className="text-sm text-zinc-400">
          {clan.tag} · Niveau {clan.level}
        </p>
        {clan.description && <p className="mt-2 text-sm text-zinc-300">{clan.description}</p>}
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 sm:justify-start">
          {facts.map(([Icon, text]) => (
            <li key={text} className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Icon className="size-3.5 text-accent-400" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
