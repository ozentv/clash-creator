import pg from 'pg';

// Connexion PostgreSQL partagée (bibliothèque et historique). Sans DATABASE_URL, pool vaut null.
const url = process.env.DATABASE_URL?.trim();
export const dbEnabled = Boolean(url);
export const pool = dbEnabled ? new pg.Pool({ connectionString: url, max: 3, connectionTimeoutMillis: 8000 }) : null;
pool?.on('error', (err) => console.error('Base de données :', err.message));

// Exécute une fois la création d'une table ; réessaie à la requête suivante en cas d'échec.
export function once(sql) {
  let ready;
  return () => {
    ready ??= pool.query(sql).catch((err) => {
      ready = undefined;
      throw err;
    });
    return ready;
  };
}
