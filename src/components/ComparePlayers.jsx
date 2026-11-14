import { useState } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { getPlayer } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { formatNumber } from '../lib/format.js';
import { leagueName, unitName } from '../lib/names.js';
import { normalizeTag } from '../lib/tag.js';

const pct = (n) => (n == null ? '—' : `${n} %`);
const ROWS = [
  ['Hôtel de ville', (p) => p.townHallLevel ?? 0, formatNumber],
  ['Niveau', (p) => p.expLevel, formatNumber],
  ['Trophées', (p) => p.trophies, formatNumber],
  ['Record de trophées', (p) => p.bestTrophies, formatNumber],
  ['Étoiles de guerre', (p) => p.warStars, formatNumber],
  ['Attaques gagnées (saison)', (p) => p.attackWins, formatNumber],
  ['Dons donnés (saison)', (p) => p.donations, formatNumber],
  ['Dons reçus (saison)', (p) => p.donationsReceived, formatNumber],
  ['Progression des héros', (p) => p.progress.heroes, pct],
  ['Progression des équipements', (p) => p.progress.equipment, pct],
  ['Progression des troupes', (p) => p.progress.troops, pct],
  ['Progression des sorts', (p) => p.progress.spells, pct],
];

// Compare le joueur affiché à un autre, choisi par tag ou parmi les membres du clan ouvert.
export default function ComparePlayers({ player, clan }) {
  const [value, setValue] = useState('');
  const [otherTag, setOtherTag] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const { status, data: other, error } = useAsync(getPlayer, otherTag);

  function handleSubmit(e) {
    e.preventDefault();
    const tag = normalizeTag(value);
    setInvalid(!tag);
    if (tag) setOtherTag(tag);
  }

  const mates = (clan?.members ?? []).filter((m) => m.tag !== player.tag);
  // Niveaux de héros, pour tous les héros que possède au moins l'un des deux joueurs.
  const heroNames = other ? [...new Set([...player.heroes, ...other.heroes].map((h) => h.name))] : [];
  const heroLevel = (p, name) => p.heroes.find((h) => h.name === name)?.level ?? 0;
  const rows = other
    ? [...ROWS, ...heroNames.map((name) => [unitName(name), (p) => heroLevel(p, name), (n) => (n ? formatNumber(n) : '—')])]
    : [];
  const cell = (mine, theirs) =>
    `px-4 py-2.5 text-right tabular-nums ${(mine ?? 0) > (theirs ?? 0) ? 'font-semibold text-accent-400' : 'text-zinc-300'}`;

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-white/[0.08] p-4">
        <h3 className="section-label mb-3">
          <GitCompareArrows className="size-4 text-accent-400" aria-hidden="true" />
          Comparer avec un autre joueur
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
          <label htmlFor="compare-player" className="sr-only">
            Tag du joueur à comparer
          </label>
          <input
            id="compare-player"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="#TAG du joueur"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={invalid}
            className="field min-w-0 flex-1 px-3 py-2 text-sm uppercase placeholder:normal-case"
          />
          {mates.length > 0 && (
            <select
              aria-label={`Choisir un membre de ${clan.name}`}
              value=""
              onChange={(e) => e.target.value && setOtherTag(normalizeTag(e.target.value))}
              className="field max-w-56 px-2 py-2 text-sm"
            >
              <option value="">Membre de {clan.name}…</option>
              {mates.map((m) => (
                <option key={m.tag} value={m.tag}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
          <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Chargement…' : 'Comparer'}
          </button>
        </form>
        {invalid && <p className="mt-2 text-sm text-red-300">Tag invalide.</p>}
      </div>

      {status === 'error' && (
        <p role="alert" className="p-4 text-sm text-red-300">
          {error}
        </p>
      )}
      {status === 'idle' && (
        <p className="p-4 text-sm text-zinc-400">
          Entre le tag d'un autre joueur{mates.length > 0 ? ' ou choisis un membre du clan' : ''} pour comparer
          ses chiffres avec ceux de {player.name}.
        </p>
      )}
      {other && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Le meilleur chiffre est en jaune</th>
                <th className="px-4 py-3 text-right font-display text-base text-white">{player.name}</th>
                <th className="px-4 py-3 text-right font-display text-base text-white">{other.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, value, format]) => (
                <tr key={label} className="row-hover border-t border-white/5">
                  <th scope="row" className="px-4 py-2.5 text-left font-normal text-zinc-400">
                    {label}
                  </th>
                  <td className={cell(value(player), value(other))}>{format(value(player))}</td>
                  <td className={cell(value(other), value(player))}>{format(value(other))}</td>
                </tr>
              ))}
              <tr className="border-t border-white/5">
                <th scope="row" className="px-4 py-2.5 text-left font-normal text-zinc-400">
                  Ligue
                </th>
                <td className="px-4 py-2.5 text-right text-zinc-300">{leagueName(player.league) ?? '—'}</td>
                <td className="px-4 py-2.5 text-right text-zinc-300">{leagueName(other.league) ?? '—'}</td>
              </tr>
              <tr className="border-t border-white/5">
                <th scope="row" className="px-4 py-2.5 text-left font-normal text-zinc-400">
                  Clan
                </th>
                <td className="px-4 py-2.5 text-right text-zinc-300">{player.clan?.name ?? 'Sans clan'}</td>
                <td className="px-4 py-2.5 text-right text-zinc-300">{other.clan?.name ?? 'Sans clan'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
