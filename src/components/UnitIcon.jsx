import { unitIconUrl } from '../lib/unitIcons.js';
import { unitName } from '../lib/names.js';

const TONES = {
  hero: 'border-accent-400/40 bg-accent-400/15 text-accent-400',
  equipment: 'border-violet-400/40 bg-violet-400/15 text-violet-300',
  pet: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300',
  troop: 'border-sky-400/40 bg-sky-400/15 text-sky-300',
  spell: 'border-fuchsia-400/40 bg-fuchsia-400/15 text-fuchsia-300',
  siege: 'border-orange-400/40 bg-orange-400/15 text-orange-300',
};

// "Chevaucheur de dragon" -> "CD", "P.E.K.K.A" -> "PE"
function initials(label) {
  const words = label.split(/[\s.\-']+/).filter((w) => w.length > 2 || /^[A-Z]$/.test(w));
  const letters = words.length > 1 ? words[0][0] + words[1][0] : label.replace(/[^\p{L}]/gu, '').slice(0, 2);
  return letters.toUpperCase();
}

// Image de l'unité si elle existe, sinon pastille à initiales colorée par catégorie.
export default function UnitIcon({ name, category }) {
  const url = unitIconUrl(name);
  if (url) {
    return <img src={url} alt="" loading="lazy" className="size-9 shrink-0 rounded-lg object-contain" />;
  }
  return (
    <span
      aria-hidden="true"
      className={`grid size-9 shrink-0 place-items-center rounded-lg border font-mono text-[11px] font-semibold ${TONES[category] ?? TONES.troop}`}
    >
      {initials(unitName(name))}
    </span>
  );
}
