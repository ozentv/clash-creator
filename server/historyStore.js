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

// ---------- Guerres ----------
// Le jeu ne donne le détail par membre que pour la guerre en cours : chaque guerre consultée
// (ou vue par /api/cron/snapshot) est donc enregistrée, puis mise à jour jusqu'à sa fin.

const initWars = once(
  `create table if not exists war_records (
     clan_tag text not null,
     war_key text not null,
     data jsonb not null,
     updated_at timestamptz not null default now(),
     primary key (clan_tag, war_key)
   )`,
);

// Ne garde d'une guerre que ce qui sert au bilan.
export function toWarRecord(war, kind = 'classique') {
  return {
    kind, // classique | ligue
    state: war.state,
    endTime: war.endTime,
    attacksPerMember: war.attacksPerMember,
    stars: war.clan.stars,
    opponentStars: war.opponent.stars,
    destruction: war.clan.destruction,
    opponentDestruction: war.opponent.destruction,
    opponentName: war.opponent.name,
    members: war.members.map((m) => ({
      tag: m.tag,
      name: m.name,
      attacks: m.attacks.map((a) => ({ stars: a.stars, destruction: a.destruction })),
    })),
  };
}

const lastWarSave = new Map(); // "clan|guerre" -> { at, state }

export async function recordWar(clanTag, war, kind) {
  if (!dbEnabled || !war?.endTime || !war.members || !['inWar', 'warEnded'].includes(war.state)) return;
  const key = `${clanTag}|${war.endTime}`;
  const last = lastWarSave.get(key);
  // Une écriture toutes les dix minutes au plus, sauf au moment où la guerre se termine.
  if (last && last.state === war.state && Date.now() - last.at < 10 * 60_000) return;
  if (lastWarSave.size > 2000) lastWarSave.clear();
  lastWarSave.set(key, { at: Date.now(), state: war.state });
  try {
    await initWars();
    await pool.query(
      `insert into war_records (clan_tag, war_key, data) values ($1, $2, $3)
       on conflict (clan_tag, war_key) do update set data = excluded.data, updated_at = now()`,
      [clanTag, war.endTime, toWarRecord(war, kind)],
    );
    await pool.query(`delete from war_records where updated_at < now() - interval '365 days'`);
  } catch (err) {
    lastWarSave.delete(key);
    console.error('Historique des guerres :', err.message);
  }
}

// Bilan par membre sur les guerres terminées (de la plus récente à la plus ancienne).
export function summarizeWars(records) {
  const ended = records
    .filter((r) => r.state === 'warEnded')
    .sort((a, b) => (a.endTime < b.endTime ? 1 : -1));
  const byMember = new Map();
  for (const war of ended) {
    for (const m of war.members) {
      const s = byMember.get(m.tag) ?? { tag: m.tag, name: m.name, wars: 0, possible: 0, attacks: 0, stars: 0, destruction: 0, triples: 0 };
      s.wars += 1;
      s.possible += war.attacksPerMember;
      for (const a of m.attacks) {
        s.attacks += 1;
        s.stars += a.stars;
        s.destruction += a.destruction;
        if (a.stars === 3) s.triples += 1;
      }
      byMember.set(m.tag, s);
    }
  }
  const members = [...byMember.values()]
    .map((s) => ({
      tag: s.tag,
      name: s.name,
      wars: s.wars,
      attacks: s.attacks,
      possible: s.possible,
      missed: s.possible - s.attacks,
      stars: s.stars,
      averageStars: s.attacks ? Math.round((s.stars / s.attacks) * 100) / 100 : null,
      averageDestruction: s.attacks ? Math.round(s.destruction / s.attacks) : null,
      triples: s.triples,
    }))
    .sort((a, b) => b.stars - a.stars || a.missed - b.missed || a.name.localeCompare(b.name));
  return {
    wars: ended.map((w) => ({
      kind: w.kind,
      endTime: w.endTime,
      opponentName: w.opponentName,
      stars: w.stars,
      opponentStars: w.opponentStars,
      result:
        w.stars !== w.opponentStars
          ? w.stars > w.opponentStars ? 'win' : 'lose'
          : w.destruction === w.opponentDestruction ? 'tie' : w.destruction > w.opponentDestruction ? 'win' : 'lose',
    })),
    members,
  };
}

export async function warStats(clanTag) {
  await initWars();
  const { rows } = await pool.query(`select data from war_records where clan_tag = $1`, [clanTag]);
  return summarizeWars(rows.map((r) => r.data));
}
