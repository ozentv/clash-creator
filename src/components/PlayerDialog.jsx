import { useEffect, useMemo, useRef, useState } from 'react';
import { Shield, X } from 'lucide-react';
import { getPlayer } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { rankMembers } from '../lib/rankings.js';
import { formatCompact, formatNumber, formatRank, ROLE_LABELS } from '../lib/format.js';
import { CAREER_LABELS, unitName } from '../lib/names.js';

const VIEWS = [
  ['profil', 'Profil'],
  ['armee', 'Armée'],
  ['carriere', 'Carrière'],
];

function Fact({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-white/[0.08] px-3 py-2">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="text-lg font-semibold text-white tabular-nums">{value}</dd>
      {hint && <dd className="text-[11px] text-zinc-500">{hint}</dd>}
    </div>
  );
}

function Heading({ children, count }) {
  return (
    <h4 className="section-label mt-6 mb-3">
      {children}
      {count != null && <span className="text-zinc-600">{count}</span>}
    </h4>
  );
}

// Anneau de progression (pourcentage des niveaux maximum du jeu).
function Ring({ label, value }) {
  const circumference = 2 * Math.PI * 20;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative size-16">
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
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.2, 0.7, 0.2, 1)' }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-semibold text-white tabular-nums">
          {value}%
        </span>
      </div>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}

function UnitGrid({ units }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
      {units.map((u) => {
        const maxed = u.level >= u.maxLevel;
        return (
          <li key={u.name} className="min-w-0">
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

  return (
    <>
      {ranks && (
        <dl className="mb-4 grid grid-cols-3 gap-2">
          <Fact label="Rang trophées" value={formatRank(ranks.trophies)} hint={`sur ${ranks.total}`} />
          <Fact label="Rang dons" value={formatRank(ranks.donations)} hint={`sur ${ranks.total}`} />
          <Fact label="Rang niveau" value={formatRank(ranks.expLevel)} hint={`sur ${ranks.total}`} />
        </dl>
      )}

      {rings.length > 0 && (
        <>
          <Heading>Progression</Heading>
          <div className="flex flex-wrap justify-around gap-3 rounded-lg border border-white/[0.08] p-4">
            {rings.map(([label, value]) => (
              <Ring key={label} label={label} value={value} />
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-600">Par rapport aux niveaux maximum du jeu, tous hôtels de ville confondus.</p>
        </>
      )}

      <Heading>Village principal</Heading>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Fact
          label="Hôtel de ville"
          value={player.townHallLevel ?? '—'}
          hint={player.townHallWeaponLevel ? `Arme niveau ${player.townHallWeaponLevel}` : null}
        />
        <Fact label="Niveau" value={player.expLevel} />
        <Fact label="Trophées" value={formatNumber(player.trophies)} hint={`Record ${formatNumber(player.bestTrophies)}`} />
        <Fact label="Étoiles de guerre" value={formatNumber(player.warStars)} />
        <Fact label="Attaques gagnées" value={formatNumber(player.attackWins)} hint="cette saison" />
        <Fact label="Défenses gagnées" value={formatNumber(player.defenseWins)} hint="cette saison" />
        <Fact label="Dons donnés" value={formatNumber(player.donations)} hint="cette saison" />
        <Fact label="Dons reçus" value={formatNumber(player.donationsReceived)} hint="cette saison" />
        <Fact label="Or de capitale donné" value={formatCompact(player.capitalContributions)} />
      </dl>

      {player.legend && (
        <>
          <Heading>Ligue Légende</Heading>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Fact label="Trophées de légende" value={formatNumber(player.legend.trophies)} />
            {player.legend.best?.trophies != null && (
              <Fact
                label="Meilleure saison"
                value={formatNumber(player.legend.best.trophies)}
                hint={[player.legend.best.id, player.legend.best.rank && `rang ${formatNumber(player.legend.best.rank)}`].filter(Boolean).join(' · ')}
              />
            )}
            {player.legend.previous?.trophies != null && (
              <Fact
                label="Saison précédente"
                value={formatNumber(player.legend.previous.trophies)}
                hint={player.legend.previous.rank && `rang ${formatNumber(player.legend.previous.rank)}`}
              />
            )}
          </dl>
        </>
      )}

      {player.builderBase && (
        <>
          <Heading>Base des ouvriers</Heading>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Fact label="Maison des ouvriers" value={player.builderBase.hallLevel} />
            <Fact
              label="Trophées"
              value={formatNumber(player.builderBase.trophies)}
              hint={`Record ${formatNumber(player.builderBase.bestTrophies)}`}
            />
            {player.builderBase.league && <Fact label="Ligue" value={<span className="text-sm">{player.builderBase.league}</span>} />}
          </dl>
        </>
      )}
    </>
  );
}

function Army({ player }) {
  const groups = [
    ['Héros', player.heroes],
    ['Équipements de héros', player.equipment],
    ['Familiers', player.pets],
    ['Troupes', player.troops],
    ['Sorts', player.spells],
    ['Engins de siège', player.siegeMachines],
    ['Héros de la base des ouvriers', player.builderBase?.heroes ?? []],
  ].filter(([, units]) => units.length > 0);

  if (groups.length === 0) return <p className="py-6 text-center text-sm text-zinc-400">Aucune unité débloquée.</p>;
  return (
    <>
      {player.activeSuperTroops.length > 0 && (
        <p className="mb-4 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          Super troupes actives :
          {player.activeSuperTroops.map((name) => (
            <span key={name} className="rounded-md bg-accent-400/10 px-2 py-0.5 font-semibold text-accent-400">
              {unitName(name)}
            </span>
          ))}
        </p>
      )}
      {groups.map(([title, units]) => (
        <div key={title} className="first:-mt-6">
          <Heading count={units.length}>{title}</Heading>
          <UnitGrid units={units} />
        </div>
      ))}
    </>
  );
}

function Career({ player }) {
  if (player.career.length === 0) {
    return <p className="py-6 text-center text-sm text-zinc-400">Statistiques de carrière indisponibles.</p>;
  }
  return (
    <>
      <p className="mb-3 text-xs text-zinc-500">Totaux depuis la création du compte.</p>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Fact label="Étoiles de guerre" value={formatNumber(player.warStars)} />
        {player.career.map(({ key, value }) => (
          <Fact
            key={key}
            label={CAREER_LABELS[key] ?? key}
            value={value >= 100_000 ? formatCompact(value) : formatNumber(value)}
          />
        ))}
      </dl>
    </>
  );
}

function PlayerSheet({ player, ranks }) {
  const [view, setView] = useState('profil');
  const chips = [
    ROLE_LABELS[player.role],
    player.league,
    player.warPreference === 'in' && 'Partant pour la guerre',
    player.warPreference === 'out' && 'Pas dispo pour la guerre',
  ].filter(Boolean);

  return (
    <>
      <p className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        {player.clan && (
          <span className="flex items-center gap-1.5 rounded-md bg-white/[0.05] py-1 pr-2.5 pl-1.5 text-zinc-200">
            {player.clan.badgeUrl ? (
              <img src={player.clan.badgeUrl} alt="" className="size-5" />
            ) : (
              <Shield className="size-4 text-zinc-500" aria-hidden="true" />
            )}
            {player.clan.name}
          </span>
        )}
        {chips.map((chip) => (
          <span key={chip} className="rounded-md bg-white/[0.05] px-2.5 py-1 text-zinc-300">
            {chip}
          </span>
        ))}
      </p>

      <div role="tablist" aria-label="Sections de la fiche" className="mb-5 flex gap-5 border-b border-white/[0.08]">
        {VIEWS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={view === key}
            className="tab py-2.5"
            onClick={() => setView(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div key={view} className="rise">
        {view === 'profil' && <Profile player={player} ranks={ranks} />}
        {view === 'armee' && <Army player={player} />}
        {view === 'carriere' && <Career player={player} />}
      </div>
    </>
  );
}

export default function PlayerDialog({ tag, onClose, members }) {
  const dialogRef = useRef(null);
  const { status, data: player, error } = useAsync(getPlayer, tag);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (tag && !dialog.open) dialog.showModal();
    if (!tag && dialog.open) dialog.close();
  }, [tag]);

  // Rangs du joueur dans le clan affiché, s'il en fait partie.
  const ranks = useMemo(() => {
    if (!tag || !members?.some((m) => m.tag === tag)) return null;
    const rankIn = (key) => rankMembers(members, key).find((m) => m.tag === tag).rank;
    return {
      total: members.length,
      trophies: rankIn('trophies'),
      donations: rankIn('donations'),
      expLevel: rankIn('expLevel'),
    };
  }, [tag, members]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-labelledby="player-dialog-title"
      className="card fixed m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto p-0 text-zinc-100 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id="player-dialog-title" className="font-display text-3xl break-words text-white">
              {player?.name ?? 'Fiche joueur'}
            </h3>
            <p className="font-mono text-xs text-zinc-500">{tag}</p>
          </div>
          <button type="button" className="btn btn-quiet shrink-0 p-2" onClick={onClose} aria-label="Fermer">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        {status === 'loading' && (
          <div role="status" aria-label="Chargement" className="flex flex-col gap-3 py-2">
            <div className="skeleton h-6 w-1/2" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-40 w-full" />
          </div>
        )}
        {status === 'error' && (
          <p role="alert" className="py-6 text-center text-sm text-red-300">
            {error}
          </p>
        )}
        {status === 'success' && (
          <div className="rise">
            <PlayerSheet key={player.tag} player={player} ranks={ranks} />
          </div>
        )}
      </div>
    </dialog>
  );
}
