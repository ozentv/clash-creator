import { formatNumber } from '../lib/format.js';

export default function ClanHeader({ clan }) {
  const facts = [
    clan.location && `📍 ${clan.location}`,
    clan.warLeague && `⚔️ ${clan.warLeague}`,
    `🏅 ${formatNumber(clan.warWins)} guerres gagnées`,
    `🏆 ${formatNumber(clan.points)} points de clan`,
  ].filter(Boolean);

  return (
    <section className="panel flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:text-left">
      {clan.badgeUrl ? (
        <img src={clan.badgeUrl} alt="" className="size-24 shrink-0" />
      ) : (
        <div className="grid size-24 shrink-0 place-items-center rounded-2xl bg-night-700 text-5xl">
          🛡️
        </div>
      )}
      <div className="min-w-0">
        <h2 className="title-clash text-3xl break-words">{clan.name}</h2>
        <p className="font-mono text-sm text-slate-400">
          {clan.tag} · niveau {clan.level}
        </p>
        {clan.description && <p className="mt-2 text-sm text-slate-300">{clan.description}</p>}
        <ul className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          {facts.map((fact) => (
            <li key={fact} className="rounded-full bg-night-700 px-3 py-1 text-xs text-slate-200">
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
