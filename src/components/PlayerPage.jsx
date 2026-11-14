import { useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Award,
  Castle,
  Gift,
  History,
  Link,
  Shield,
  Star,
  Swords,
  Trophy,
  User,
} from 'lucide-react';
import { getPlayer } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { rankMembers } from '../lib/rankings.js';
import { formatCompact, formatNumber, formatRank, formatSigned, ROLE_LABELS } from '../lib/format.js';
import { ACHIEVEMENT_LABELS, CAREER_LABELS, labelName, leagueName, unitName } from '../lib/names.js';
import { copyText } from '../lib/toast.js';
import ExportButtons from './ExportButtons.jsx';
import Freshness from './Freshness.jsx';
import AnimatedNumber from './AnimatedNumber.jsx';
import Tabs from './Tabs.jsx';
import UnitIcon from './UnitIcon.jsx';

const VIEWS = [
  ['profil', 'Profil', User],
  ['armee', 'Armée', Swords],
  ['carriere', 'Carrière', History],
  ['succes', 'Succès', Award],
];
const VILLAGE_LABELS = { home: 'Village principal', builderBase: 'Base des ouvriers', clanCapital: 'Capitale de clan' };

function Panel({ icon: Icon, title, count, children, className = '', storySkip = false }) {
  return (
    <section className={`card overflow-hidden ${className}`} data-story-skip={storySkip ? '' : undefined}>
      <h3 className="section-label border-b border-white/[0.08] p-4">
        {Icon && <Icon className="size-4 text-accent-400" aria-hidden="true" />}
        {title}
        {count != null && <span className="text-zinc-600">{count}</span>}
      </h3>
      {children}
    </section>
  );
}

function Facts({ items, columns = 'sm:grid-cols-3' }) {
  return (
    <dl className={`grid grid-cols-2 gap-px bg-white/[0.05] ${columns}`}>
      {items.filter(Boolean).map(([label, value, hint]) => (
        <div key={label} className="bg-ink-900 px-4 py-3">
          <dt className="text-xs text-zinc-500">{label}</dt>
          <dd className="text-lg font-semibold break-words text-white tabular-nums">{value}</dd>
          {hint && <dd className="text-[11px] text-zinc-500">{hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

function Kpi({ icon: Icon, label, hint, children }) {
  return (
    <div className="card card-lift group min-w-0 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-zinc-400">{label}</span>
        <Icon className="size-4 shrink-0 text-accent-400 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12" aria-hidden="true" />
      </div>
      <p className="mt-2 text-xl leading-tight font-bold text-white tabular-nums sm:text-2xl">{children}</p>
      <p className="h-4 truncate text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

// Anneau de progression (pourcentage des niveaux maximum du jeu).
function Ring({ label, value }) {
  const circumference = 2 * Math.PI * 20;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-20">
        <svg viewBox="0 0 48 48" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="4" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="#f5c531"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / 100)}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-semibold text-white tabular-nums">{value}%</span>
      </div>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}

function UnitGrid({ units, category }) {
  return (
    <ul className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {units.map((u) => {
        const maxed = u.level >= u.maxLevel;
        return (
          <li key={u.name} className="flex min-w-0 items-center gap-2.5">
            <UnitIcon name={u.name} category={category} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate text-zinc-200">{unitName(u.name)}</span>
                <span className={`shrink-0 text-xs tabular-nums ${maxed ? 'font-semibold text-accent-400' : 'text-zinc-500'}`}>
                  {maxed ? 'max' : `${u.level}/${u.maxLevel}`}
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className={`bar-grow h-full rounded-full ${maxed ? 'bg-accent-400' : 'bg-zinc-400'}`}
                  style={{ width: `${Math.min(100, (u.level / u.maxLevel) * 100)}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Profile({ player, ranks }) {
  const rings = [
    ['Héros', player.progress.heroes],
    ['Équipements', player.progress.equipment],
    ['Troupes', player.progress.troops],
    ['Sorts', player.progress.spells],
  ].filter(([, value]) => value != null);
  const legend = player.legend;

  return (
    <>
      <div className="layout-grid grid items-start gap-4 lg:grid-cols-3">
        <Panel icon={Castle} title="Village principal" className="lg:col-span-2">
          <Facts
            items={[
              ['Hôtel de ville', player.townHallLevel ?? '—', player.townHallWeaponLevel && `Arme niveau ${player.townHallWeaponLevel}`],
              ['Niveau', player.expLevel],
              ['Ligue', <span className="text-base">{leagueName(player.league) ?? 'Aucune'}</span>],
              ['Trophées', formatNumber(player.trophies), `Record ${formatNumber(player.bestTrophies)}`],
              ['Étoiles de guerre', formatNumber(player.warStars)],
              ['Guerre', <span className="text-base">{player.warPreference === 'in' ? 'Partant' : player.warPreference === 'out' ? 'Pas dispo' : '—'}</span>],
              ['Attaques gagnées', formatNumber(player.attackWins), 'cette saison'],
              ['Défenses gagnées', formatNumber(player.defenseWins), 'cette saison'],
              ['Or de capitale donné', formatCompact(player.capitalContributions)],
              ['Dons donnés', formatNumber(player.donations), 'cette saison'],
              ['Dons reçus', formatNumber(player.donationsReceived), 'cette saison'],
              ['Bilan des dons', formatSigned(player.donations - player.donationsReceived), 'donnés moins reçus'],
            ]}
          />
        </Panel>
        <div className="flex flex-col gap-4">
          {rings.length > 0 && (
            <Panel icon={Star} title="Progression">
              <div className="grid grid-cols-2 gap-4 p-4">
                {rings.map(([label, value]) => (
                  <Ring key={label} label={label} value={value} />
                ))}
              </div>
              <p className="border-t border-white/[0.08] px-4 py-2.5 text-[11px] text-zinc-500">
                Par rapport aux niveaux maximum du jeu, tous hôtels de ville confondus.
              </p>
            </Panel>
          )}
          {ranks && (
            <Panel icon={Shield} title={`Dans ${ranks.clanName}`}>
              <Facts
                columns="grid-cols-2"
                items={[
                  ['Rang trophées', formatRank(ranks.trophies), `sur ${ranks.total}`],
                  ['Rang dons', formatRank(ranks.donations), `sur ${ranks.total}`],
                  ['Rang niveau', formatRank(ranks.expLevel), `sur ${ranks.total}`],
                  ['Rang bilan dons', formatRank(ranks.balance), `sur ${ranks.total}`],
                ]}
              />
            </Panel>
          )}
        </div>
      </div>

      {legend && (
        <Panel icon={Trophy} title="Ligue Légende" storySkip>
          <Facts
            columns="sm:grid-cols-4"
            items={[
              ['Trophées de légende', formatNumber(legend.trophies)],
              legend.current?.trophies != null && [
                'Saison en cours',
                formatNumber(legend.current.trophies),
                legend.current.rank && `rang ${formatNumber(legend.current.rank)}`,
              ],
              legend.previous?.trophies != null && [
                'Saison précédente',
                formatNumber(legend.previous.trophies),
                [legend.previous.id, legend.previous.rank && `rang ${formatNumber(legend.previous.rank)}`].filter(Boolean).join(' · '),
              ],
              legend.best?.trophies != null && [
                'Meilleure saison',
                formatNumber(legend.best.trophies),
                [legend.best.id, legend.best.rank && `rang ${formatNumber(legend.best.rank)}`].filter(Boolean).join(' · '),
              ],
            ]}
          />
        </Panel>
      )}

      {player.builderBase && (
        <Panel icon={Castle} title="Base des ouvriers" storySkip>
          <Facts
            columns="sm:grid-cols-4"
            items={[
              ['Maison des ouvriers', player.builderBase.hallLevel],
              ['Trophées', formatNumber(player.builderBase.trophies)],
              ['Record de trophées', formatNumber(player.builderBase.bestTrophies)],
              player.builderBase.league && ['Ligue', <span className="text-base">{leagueName(player.builderBase.league)}</span>],
            ]}
          />
        </Panel>
      )}
    </>
  );
}

function Army({ player }) {
  const groups = [
    // Le dernier élément indique les groupes laissés de côté dans l'export en story.
    ['Héros', player.heroes, 'hero', false],
    ['Équipements de héros', player.equipment, 'equipment', false],
    ['Familiers', player.pets, 'pet', false],
    ['Troupes', player.troops, 'troop', true],
    ['Sorts', player.spells, 'spell', true],
    ['Engins de siège', player.siegeMachines, 'siege', true],
    ['Héros de la base des ouvriers', player.builderBase?.heroes ?? [], 'hero', true],
    ['Troupes de la base des ouvriers', player.builderBase?.troops ?? [], 'troop', true],
  ].filter(([, units]) => units.length > 0);

  if (groups.length === 0) {
    return <p className="card p-6 text-center text-sm text-zinc-400">Aucune unité débloquée.</p>;
  }
  return (
    <>
      {player.activeSuperTroops.length > 0 && (
        <p className="card flex flex-wrap items-center gap-2 p-4 text-sm text-zinc-400">
          Super troupes actives :
          {player.activeSuperTroops.map((name) => (
            <span key={name} className="rounded-md bg-accent-400/10 px-2.5 py-1 text-xs font-semibold text-accent-400">
              {unitName(name)}
            </span>
          ))}
        </p>
      )}
      {groups.map(([title, units, category, storySkip]) => {
        const maxed = units.filter((u) => u.level >= u.maxLevel).length;
        return (
          <Panel key={title} title={title} count={`${units.length} · ${maxed} au max`} storySkip={storySkip}>
            <UnitGrid units={units} category={category} />
          </Panel>
        );
      })}
    </>
  );
}

function Career({ player }) {
  if (player.career.length === 0) {
    return <p className="card p-6 text-center text-sm text-zinc-400">Statistiques de carrière indisponibles.</p>;
  }
  return (
    <Panel icon={History} title="Depuis la création du compte">
      <Facts
        columns="sm:grid-cols-3 lg:grid-cols-5"
        items={[
          ['Étoiles de guerre', formatNumber(player.warStars)],
          ...player.career.map(({ key, value }) => [
            CAREER_LABELS[key] ?? key,
            value >= 100_000 ? formatCompact(value) : formatNumber(value),
          ]),
        ]}
      />
    </Panel>
  );
}

function Achievements({ player }) {
  const groups = Object.keys(VILLAGE_LABELS)
    .map((village) => [village, player.achievements.filter((a) => a.village === village)])
    .filter(([, list]) => list.length > 0);

  if (groups.length === 0) {
    return <p className="card p-6 text-center text-sm text-zinc-400">Succès indisponibles.</p>;
  }
  const done = player.achievements.filter((a) => a.stars >= 3).length;
  return (
    <>
      <p className="text-sm text-zinc-400">
        <span className="font-semibold text-white">{done}</span> succès terminés sur {player.achievements.length}.
        Le titre de chaque succès est celui du jeu, en anglais ; la ligne du dessous explique ce qu'il mesure.
      </p>
      {groups.map(([village, list]) => (
        <Panel key={village} icon={Award} title={VILLAGE_LABELS[village]} count={list.length}>
          <ul className="layout-grid grid gap-px bg-white/[0.05] md:grid-cols-2">
            {list.map((a) => (
              <li key={a.name} className="bg-ink-900 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-zinc-100">{a.name}</span>
                  <span className="flex shrink-0" aria-label={`${a.stars} étoiles sur 3`}>
                    {[1, 2, 3].map((n) => (
                      <Star key={n} aria-hidden="true" className={`size-3.5 ${n <= a.stars ? 'fill-accent-400 text-accent-400' : 'text-zinc-700'}`} />
                    ))}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-zinc-500">{ACHIEVEMENT_LABELS[a.name] ?? a.info}</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className={`h-full rounded-full ${a.stars >= 3 ? 'bg-accent-400' : 'bg-zinc-400'}`}
                      style={{ width: `${a.target ? Math.min(100, (a.value / a.target) * 100) : 100}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[11px] text-zinc-500 tabular-nums">
                    {formatCompact(a.value)}
                    {a.target > 0 && ` / ${formatCompact(a.target)}`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ))}
    </>
  );
}

function Skeleton() {
  return (
    <div role="status" aria-label="Chargement du joueur" className="flex flex-col gap-4">
      <div className="skeleton h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton h-80 w-full rounded-2xl" />
    </div>
  );
}

// clan : clan actuellement chargé dans le site (ou null), pour les rangs et le bouton de retour.
export default function PlayerPage({ tag, view, onView, clan, onOpenClan, onBack }) {
  const { status, data: player, error } = useAsync(getPlayer, tag);
  const exportRef = useRef(null);
  const fullTag = `#${tag}`;

  const ranks = useMemo(() => {
    if (!clan?.members.some((m) => m.tag === fullTag)) return null;
    const rankIn = (key) => rankMembers(clan.members, key).find((m) => m.tag === fullTag).rank;
    return {
      clanName: clan.name,
      total: clan.members.length,
      trophies: rankIn('trophies'),
      donations: rankIn('donations'),
      expLevel: rankIn('expLevel'),
      balance: rankIn('balance'),
    };
  }, [clan, fullTag]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
      {clan && (
        <button type="button" onClick={onBack} className="btn btn-quiet self-start">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour à {clan.name}
        </button>
      )}

      {status === 'loading' && <Skeleton />}
      {status === 'error' && (
        <div role="alert" className="card p-8 text-center">
          <p className="font-display text-2xl text-white">Joueur introuvable</p>
          <p className="mt-2 text-sm text-zinc-400">
            {error} <span className="font-mono">{fullTag}</span>
          </p>
        </div>
      )}

      {status === 'success' && (
        <div ref={exportRef} className="flex flex-col gap-4">
          <section className="card rise overflow-hidden p-5 sm:p-7">
            <div className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-accent-400/10 blur-3xl" />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid size-24 shrink-0 place-items-center rounded-2xl border border-accent-400/30 bg-accent-400/10 text-center">
                <div>
                  <p className="font-mono text-[11px] tracking-widest text-accent-400">HDV</p>
                  <p className="font-display text-4xl text-white">{player.townHallLevel ?? '—'}</p>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="tag-chip">{player.tag}</span>
                  <span className="tag-chip">Niveau {player.expLevel}</span>
                  {ROLE_LABELS[player.role] && <span className="tag-chip">{ROLE_LABELS[player.role]}</span>}
                </p>
                <h1 className="mt-2 font-display text-4xl break-words text-white sm:text-5xl">{player.name}</h1>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  {player.league && (
                    <span className="flex items-center gap-1.5 rounded-md bg-white/[0.05] px-2.5 py-1 text-zinc-300">
                      {player.leagueIcon && <img src={player.leagueIcon} alt="" className="size-5" />}
                      {leagueName(player.league)}
                    </span>
                  )}
                  {player.labels.map((label) => (
                    <span key={label.name} className="flex items-center gap-1.5 rounded-md border border-white/[0.08] py-1 pr-2.5 pl-1.5 text-zinc-400">
                      {label.iconUrl && <img src={label.iconUrl} alt="" className="size-5" />}
                      {labelName(label.name)}
                    </span>
                  ))}
                </p>
                <div className="mt-3">
                  <Freshness at={player.fetchedAt} />
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col" data-no-export>
                {player.clan ? (
                  <button type="button" className="btn btn-primary" onClick={() => onOpenClan(player.clan.tag)}>
                    {player.clan.badgeUrl ? (
                      <img src={player.clan.badgeUrl} alt="" className="size-5" />
                    ) : (
                      <Shield className="size-4" aria-hidden="true" />
                    )}
                    <span className="max-w-40 truncate">{player.clan.name}</span>
                  </button>
                ) : (
                  <span className="rounded-lg border border-white/10 px-4 py-2 text-center text-sm text-zinc-500">Sans clan</span>
                )}
                <button type="button" className="btn btn-quiet" onClick={() => copyText(window.location.href)}>
                  <Link className="size-4" aria-hidden="true" />
                  Copier le lien
                </button>
                <ExportButtons
                  compact
                  targetRef={exportRef}
                  filename={`joueur-${tag.toLowerCase()}-${view}`}
                />
              </div>
            </div>
          </section>

          <section aria-label="Chiffres clés du joueur" className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi icon={Trophy} label="Trophées" hint={`Record ${formatNumber(player.bestTrophies)}`}>
              <AnimatedNumber value={player.trophies} format={formatNumber} />
            </Kpi>
            <Kpi icon={Star} label="Étoiles de guerre" hint="depuis la création du compte">
              <AnimatedNumber value={player.warStars} format={formatNumber} />
            </Kpi>
            <Kpi icon={Gift} label="Dons de la saison" hint={`${formatNumber(player.donationsReceived)} reçus`}>
              <AnimatedNumber value={player.donations} format={formatNumber} />
            </Kpi>
            <Kpi icon={Swords} label="Attaques gagnées" hint={`${formatNumber(player.defenseWins)} défenses gagnées`}>
              <AnimatedNumber value={player.attackWins} format={formatNumber} />
            </Kpi>
          </section>

          <Tabs tabs={VIEWS} current={view} onChange={onView} label="Sections du joueur" idPrefix="vue" />

          <div key={view} id="vue-panel" role="tabpanel" aria-labelledby={`vue-${view}`} className="stagger flex flex-col gap-4">
            {view === 'profil' && <Profile player={player} ranks={ranks} />}
            {view === 'armee' && <Army player={player} />}
            {view === 'carriere' && <Career player={player} />}
            {view === 'succes' && <Achievements player={player} />}
          </div>
        </div>
      )}
    </main>
  );
}
