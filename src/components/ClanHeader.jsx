import { Link, MapPin, Medal, RefreshCw, Shield, Swords, Trophy } from 'lucide-react';
import { formatNumber } from '../lib/format.js';
import { leagueName } from '../lib/names.js';
import { copyText } from '../lib/toast.js';
import Freshness from './Freshness.jsx';

export default function ClanHeader({ clan, onRefresh, refreshing }) {
  const facts = [
    clan.location && [MapPin, clan.location],
    clan.warLeague && [Swords, leagueName(clan.warLeague)],
    [Medal, `${formatNumber(clan.warWins)} guerres gagnées`],
    [Trophy, `${formatNumber(clan.points)} points`],
  ].filter(Boolean);

  return (
    <section className="card rise overflow-hidden p-5 sm:p-7">
      <div className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-accent-400/10 blur-3xl" />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {clan.badgeUrl ? (
          <img src={clan.badgeUrl} alt="" className="size-24 shrink-0 drop-shadow-[0_8px_24px_rgb(245_197_49/0.35)]" />
        ) : (
          <div className="grid size-24 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-600">
            <Shield className="size-10" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="tag-chip">{clan.tag}</span>
            <span className="tag-chip">Niveau {clan.level}</span>
          </p>
          <h1 className="mt-2 font-display text-4xl break-words text-white sm:text-5xl">{clan.name}</h1>
          {clan.description && <p className="mt-2 max-w-2xl text-sm text-zinc-400">{clan.description}</p>}
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            {facts.map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Icon className="size-3.5 text-accent-400" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Freshness at={clan.fetchedAt} />
          </div>
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col">
          <button type="button" className="btn btn-quiet" onClick={() => copyText(window.location.href)}>
            <Link className="size-4" aria-hidden="true" />
            Copier le lien
          </button>
          <button type="button" className="btn btn-quiet" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            Actualiser
          </button>
        </div>
      </div>
    </section>
  );
}
