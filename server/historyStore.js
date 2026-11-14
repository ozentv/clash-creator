import { dbEnabled, once, pool } from './db.js';

// Historique : un relevé par clan et par jour, enregistré quand le clan est consulté
// (ou par /api/cron/snapshot). Le dernier relevé de la journée remplace le précédent.

const KEEP_DAYS = 180;

const init = once(
  `create table if not exists clan_snapshots (
     clan_tag text not null,
     day date not null,
     data jsonb not null,
     updated_at timestamptz not null default now(),
     primary key (clan_tag, day)
   )`,
);

const sum = (members, key) => members.reduce((n, m) => n + (m[key] ?? 0), 0);

export function toSnapshot(clan) {
  return {
    name: clan.name,
    level: clan.level,
    points: clan.points,
    warWins: clan.warWins,
    memberCount: clan.members.length,
    totalTrophies: sum(clan.members, 'trophies'),
    totalDonations: sum(clan.members, 'donations'),
    members: clan.members.map((m) => ({
      tag: m.tag,
      name: m.name,
      trophies: m.trophies,
      donations: m.donations,
      townHallLevel: m.townHallLevel,
      expLevel: m.expLevel,
    })),
  };
}

const lastSaved = new Map(); // tag -> date du dernier enregistrement, pour ne pas écrire à chaque visite

// Enregistre le relevé du jour. Ne lève jamais d'erreur : l'historique ne doit pas bloquer l'affichage.
export async function recordSnapshot(clan) {
  if (!dbEnabled) return;
  if (Date.now() - (lastSaved.get(clan.tag) ?? 0) < 30 * 60_000) return;
  lastSaved.set(clan.tag, Date.now());
  try {
    await init();
    await pool.query(
      `insert into clan_snapshots (clan_tag, day, data) values ($1, current_date, $2)
       on conflict (clan_tag, day) do update set data = excluded.data, updated_at = now()`,
      [clan.tag, toSnapshot(clan)],
    );
    await pool.query(`delete from clan_snapshots where day < current_date - $1::int`, [KEEP_DAYS]);
  } catch (err) {
    lastSaved.delete(clan.tag);
    console.error('Historique :', err.message);
  }
}

// Résume une suite de relevés (du plus ancien au plus récent) : séries et mouvements de membres.
export function summarize(rows) {
  const days = rows.map(({ day, data }) => ({
    day,
    memberCount: data.memberCount,
    totalTrophies: data.totalTrophies,
    totalDonations: data.totalDonations,
    points: data.points,
    warWins: data.warWins,
  }));
  const movements = [];
  for (let i = 1; i < rows.length; i++) {
    const before = new Map(rows[i - 1].data.members.map((m) => [m.tag, m.name]));
    const after = new Map(rows[i].data.members.map((m) => [m.tag, m.name]));
    const joined = [...after].filter(([tag]) => !before.has(tag)).map(([tag, name]) => ({ tag, name }));
    const left = [...before].filter(([tag]) => !after.has(tag)).map(([tag, name]) => ({ tag, name }));
    if (joined.length || left.length) movements.push({ day: rows[i].day, joined, left });
  }
  return { days, movements: movements.reverse() };
}

const dayString = `to_char(day, 'YYYY-MM-DD') as day`;

export async function clanHistory(tag) {
  await init();
  const { rows } = await pool.query(
    `select ${dayString}, data from clan_snapshots where clan_tag = $1 order by day`,
    [tag],
  );
  return summarize(rows);
}

export async function playerHistory(tag) {
  await init();
  const { rows } = await pool.query(
    `select ${dayString}, m as member
       from clan_snapshots, jsonb_array_elements(data -> 'members') m
      where m ->> 'tag' = $1
      order by day`,
    [tag],
  );
  // Un joueur présent dans deux clans suivis le même jour : on garde un seul relevé par jour.
  const byDay = new Map(rows.map((r) => [r.day, r]));
  return [...byDay.values()].map(({ day, member }) => ({
    day,
    trophies: member.trophies,
    donations: member.donations,
    townHallLevel: member.townHallLevel,
  }));
}

// Clans suivis : ceux qui ont un relevé dans les 30 derniers jours.
export async function trackedClans() {
  await init();
  const { rows } = await pool.query(
    `select distinct clan_tag from clan_snapshots where day >= current_date - 30 limit 200`,
  );
  return rows.map((r) => r.clan_tag);
}
