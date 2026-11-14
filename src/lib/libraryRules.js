// Règles de la bibliothèque (compositions et bases), partagées par le site, le serveur et les tests.

const LINK_PREFIX = 'https://link.clashofclans.com/';
export const BASE_TYPES = ['Guerre', 'Ligue', 'Trophées', 'Farm'];
export const KINDS = { compositions: 'composition', bases: 'base' };

// Seuls les liens de partage officiels du jeu sont acceptés.
export const safeLink = (link) =>
  typeof link === 'string' && link.startsWith(LINK_PREFIX) ? link : null;

const isUnitList = (list) =>
  Array.isArray(list) &&
  list.every((u) => typeof u?.nom === 'string' && u.nom && Number.isInteger(u.nombre) && u.nombre > 0);

// Renvoie la liste des problèmes d'une liste de fiches (vide = tout est valide).
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

const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const units = (list) =>
  (Array.isArray(list) ? list : [])
    .slice(0, 20)
    .map((u) => ({ nom: text(u?.nom, 40), nombre: Number.parseInt(u?.nombre, 10) }))
    .filter((u) => u.nom);

const slug = (value) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

// Nettoie une fiche saisie dans le formulaire : seuls les champs connus sont gardés.
// Renvoie { entry, problems } ; problems est vide si la fiche peut être enregistrée.
export function cleanEntry(kind, input, randomSuffix = Math.random().toString(36).slice(2, 6)) {
  const nom = text(input?.nom, 60);
  const hdv = Number.parseInt(input?.hdv, 10);
  const base = {
    id: [slug(nom) || 'fiche', `hdv${hdv}`, randomSuffix].join('-'),
    nom,
    hdv,
    note: text(input?.note, 600),
    lien: text(input?.lien, 600),
  };
  const entry =
    kind === 'composition'
      ? { ...base, style: text(input?.style, 30), troupes: units(input?.troupes), sorts: units(input?.sorts), engin: text(input?.engin, 40) }
      : { ...base, type: text(input?.type, 20) };

  const problems = validateLibrary([entry], kind).map((p) => p.replace(/^.*? : /, ''));
  if (kind === 'base' && !entry.lien) problems.push('le lien de la base est obligatoire');
  return { entry, problems };
}
