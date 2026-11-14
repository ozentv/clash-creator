import compositionsData from '../data/compositions.json' with { type: 'json' };
import basesData from '../data/bases.json' with { type: 'json' };

// Bibliothèque de compositions et de bases (voir src/data/README.md).

const LINK_PREFIX = 'https://link.clashofclans.com/';
export const BASE_TYPES = ['Guerre', 'Ligue', 'Trophées', 'Farm'];

// Seuls les liens de partage officiels du jeu sont acceptés.
export const safeLink = (link) =>
  typeof link === 'string' && link.startsWith(LINK_PREFIX) ? link : null;

const isUnitList = (list) =>
  Array.isArray(list) &&
  list.every((u) => typeof u?.nom === 'string' && Number.isInteger(u.nombre) && u.nombre > 0);

// Renvoie la liste des problèmes d'un fichier de la bibliothèque (vide = fichier valide).
export function validateLibrary(entries, kind) {
  if (!Array.isArray(entries)) return ['Le fichier doit contenir une liste.'];
  const problems = [];
  const ids = new Set();
  entries.forEach((e, i) => {
    const where = `${kind} n°${i + 1} (${e?.id ?? 'sans id'})`;
    if (typeof e?.id !== 'string' || !/^[a-z0-9-]+$/.test(e.id)) problems.push(`${where} : id manquant ou invalide`);
    else if (ids.has(e.id)) problems.push(`${where} : id en double`);
    ids.add(e?.id);
    if (typeof e?.nom !== 'string' || !e.nom.trim()) problems.push(`${where} : nom manquant`);
    if (!Number.isInteger(e?.hdv) || e.hdv < 1 || e.hdv > 30) problems.push(`${where} : hdv invalide`);
    if (e?.lien && !safeLink(e.lien)) problems.push(`${where} : le lien doit commencer par ${LINK_PREFIX}`);
    if (kind === 'composition') {
      if (!isUnitList(e?.troupes) || e.troupes.length === 0) problems.push(`${where} : troupes invalides`);
      if (e?.sorts !== undefined && !isUnitList(e.sorts)) problems.push(`${where} : sorts invalides`);
    }
    if (kind === 'base' && !BASE_TYPES.includes(e?.type)) problems.push(`${where} : type invalide`);
  });
  return problems;
}

const byTownHall = (a, b) => b.hdv - a.hdv || a.nom.localeCompare(b.nom);

export const compositions = [...compositionsData].sort(byTownHall);
export const bases = [...basesData].sort(byTownHall);
