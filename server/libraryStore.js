import fs from 'node:fs';
import pg from 'pg';

// Bibliothèque : fiches des fichiers src/data (lecture seule) + fiches ajoutées depuis le site,
// enregistrées dans PostgreSQL quand DATABASE_URL est défini.

const MAX_ENTRIES = 500;
const url = process.env.DATABASE_URL?.trim();
export const dbEnabled = Boolean(url);
const pool = dbEnabled ? new pg.Pool({ connectionString: url, max: 3, connectionTimeoutMillis: 8000 }) : null;
pool?.on('error', (err) => console.error('Base de données :', err.message));

let ready; // création de la table, une seule fois
function init() {
  ready ??= pool
    .query(
      `create table if not exists library_entries (
         id text primary key,
         kind text not null check (kind in ('composition', 'base')),
         data jsonb not null,
         created_at timestamptz not null default now()
       )`,
    )
    .catch((err) => {
      ready = undefined; // on réessaiera à la prochaine requête
      throw err;
    });
  return ready;
}

function readFile(name) {
  try {
    const entries = JSON.parse(fs.readFileSync(new URL(`../src/data/${name}`, import.meta.url), 'utf8'));
    return Array.isArray(entries) ? entries.map((e) => ({ ...e, source: 'fichier' })) : [];
  } catch (err) {
    console.error(`Lecture de src/data/${name} impossible :`, err.message);
    return [];
  }
}
const files = { composition: readFile('compositions.json'), base: readFile('bases.json') };

const byTownHall = (a, b) => b.hdv - a.hdv || a.nom.localeCompare(b.nom);

export async function listLibrary() {
  let rows = [];
  let warning = null;
  if (dbEnabled) {
    try {
      await init();
      ({ rows } = await pool.query('select id, kind, data from library_entries order by created_at desc'));
    } catch (err) {
      console.error('Base de données :', err.message);
      warning = 'Les fiches ajoutées depuis le site sont momentanément indisponibles.';
    }
  }
  const of = (kind) =>
    [...files[kind], ...rows.filter((r) => r.kind === kind).map((r) => ({ ...r.data, id: r.id, source: 'site' }))].sort(byTownHall);
  return { compositions: of('composition'), bases: of('base'), warning };
}

export async function addEntry(kind, entry) {
  await init();
  const { rows } = await pool.query('select count(*)::int as n from library_entries');
  if (rows[0].n >= MAX_ENTRIES) throw new Error('La bibliothèque est pleine.');
  await pool.query('insert into library_entries (id, kind, data) values ($1, $2, $3)', [entry.id, kind, entry]);
  return { ...entry, source: 'site' };
}

export async function removeEntry(id) {
  await init();
  const result = await pool.query('delete from library_entries where id = $1', [id]);
  return result.rowCount > 0;
}

export const closeStore = () => pool?.end();
