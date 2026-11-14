import { useEffect, useRef } from 'react';
import { getPlayer } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { formatNumber, HERO_LABELS, ROLE_LABELS } from '../lib/format.js';

function Fact({ label, value }) {
  return (
    <div className="rounded-lg bg-night-800 px-3 py-2">
      <dt className="text-xs tracking-wide text-slate-400 uppercase">{label}</dt>
      <dd className="font-display text-lg text-gold-300 tabular-nums">{value}</dd>
    </div>
  );
}

function PlayerSheet({ player }) {
  const facts = [
    ['Hôtel de ville', player.townHallLevel ?? '—'],
    ['Niveau', player.expLevel],
    ['Trophées', formatNumber(player.trophies)],
    ['Record de trophées', formatNumber(player.bestTrophies)],
    ['Étoiles de guerre', formatNumber(player.warStars)],
    ['Attaques gagnées', formatNumber(player.attackWins)],
    ['Défenses gagnées', formatNumber(player.defenseWins)],
    ['Dons donnés', formatNumber(player.donations)],
    ['Dons reçus', formatNumber(player.donationsReceived)],
    ['Or de capitale donné', formatNumber(player.capitalContributions)],
  ];
  if (player.builderHallLevel) {
    facts.push(['Maison des ouvriers', player.builderHallLevel]);
  }

  return (
    <>
      <p className="mb-4 flex flex-wrap gap-2 text-xs">
        {[
          ROLE_LABELS[player.role],
          player.league,
          player.warPreference === 'in' && '⚔️ Partant pour la guerre',
          player.warPreference === 'out' && '🚫 Pas dispo pour la guerre',
        ]
          .filter(Boolean)
          .map((tag) => (
            <span key={tag} className="rounded-full bg-night-700 px-3 py-1 text-slate-200">
              {tag}
            </span>
          ))}
      </p>
      <dl className="grid grid-cols-2 gap-2">
        {facts.map(([label, value]) => (
          <Fact key={label} label={label} value={value} />
        ))}
      </dl>
      {player.heroes.length > 0 && (
        <>
          <h4 className="mt-5 mb-2 font-display text-lg text-gold-300">Héros</h4>
          <ul className="flex flex-col gap-2">
            {player.heroes.map((h) => (
              <li key={h.name}>
                <div className="flex justify-between text-sm">
                  <span>{HERO_LABELS[h.name] ?? h.name}</span>
                  <span className="text-slate-300 tabular-nums">
                    {h.level} / {h.maxLevel}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-night-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
                    style={{ width: `${Math.min(100, (h.level / h.maxLevel) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export default function PlayerDialog({ tag, onClose }) {
  const dialogRef = useRef(null);
  const { status, data: player, error } = useAsync(getPlayer, tag);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (tag && !dialog.open) dialog.showModal();
    if (!tag && dialog.open) dialog.close();
  }, [tag]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-labelledby="player-dialog-title"
      className="panel m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto p-0 text-slate-100 backdrop:bg-black/70"
    >
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id="player-dialog-title" className="title-clash text-2xl break-words">
              {player?.name ?? 'Fiche joueur'}
            </h3>
            <p className="font-mono text-xs text-slate-400">{tag}</p>
          </div>
          <button type="button" className="btn btn-ghost shrink-0 px-3 py-1" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        {status === 'loading' && <p className="py-6 text-center text-slate-400">Chargement…</p>}
        {status === 'error' && (
          <p role="alert" className="py-6 text-center text-red-300">
            ⚠️ {error}
          </p>
        )}
        {status === 'success' && <PlayerSheet player={player} />}
      </div>
    </dialog>
  );
}
