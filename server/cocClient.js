// Client minimal pour l'API officielle Clash of Clans.
// Le token reste côté serveur : il n'est jamais envoyé au navigateur.

// COC_API_BASE_URL permet de passer par un proxy à IP fixe quand l'hébergeur
// n'a pas d'adresse IP sortante unique (cas de Render).
const BASE_URL = (process.env.COC_API_BASE_URL?.trim() || 'https://api.clashofclans.com/v1').replace(
  /\/+$/,
  '',
);

export class CocApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const ERROR_MESSAGES = {
  400: 'Tag invalide.',
  403: "Accès refusé par l'API Clash of Clans : token invalide ou adresse IP du serveur non autorisée pour cette clé.",
  404: 'Introuvable. Vérifie le tag.',
  429: 'Trop de requêtes. Réessaie dans quelques instants.',
  503: "L'API Clash of Clans est en maintenance.",
};

// Petit cache mémoire : évite de rappeler l'API à chaque changement d'onglet
// et amortit les rafales (la ligue de clans demande jusqu'à 28 requêtes).
const CACHE_TTL = 45_000;
const cache = new Map();

async function cocGet(path, token) {
  const hit = cache.get(path);
  if (hit && hit.expires > Date.now()) return hit.data;
  const data = await cocFetch(path, token);
  if (cache.size > 500) cache.clear();
  cache.set(path, { data, expires: Date.now() + CACHE_TTL });
  return data;
}

async function cocFetch(path, token) {
  let res;
  try {
    res = await fetch(BASE_URL + path, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new CocApiError(502, "Impossible de joindre l'API Clash of Clans.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // Un vrai « introuvable » vient de l'API avec reason = notFound.
    // Tout autre 404 signale une adresse d'API (COC_API_BASE_URL) incorrecte.
    if (res.status === 404 && body?.reason !== 'notFound') {
      throw new CocApiError(
        502,
        "L'adresse de l'API est incorrecte : vérifie COC_API_BASE_URL (elle doit se terminer par /v1).",
      );
    }
    console.error('API Clash of Clans :', path, res.status, body?.reason ?? '', body?.message ?? '');
    throw new CocApiError(
      res.status,
      ERROR_MESSAGES[res.status] ?? `Erreur de l'API Clash of Clans (${res.status}).`,
    );
  }
  return res.json();
}

const tagPath = (tag) => encodeURIComponent('#' + tag);

export const fetchClan = (tag, token) => cocGet(`/clans/${tagPath(tag)}`, token);
export const fetchCurrentWar = (tag, token) => cocGet(`/clans/${tagPath(tag)}/currentwar`, token);
export const searchClans = (name, token) =>
  cocGet(`/clans?name=${encodeURIComponent(name)}&limit=10`, token);
export const fetchWarLog = (tag, token) => cocGet(`/clans/${tagPath(tag)}/warlog?limit=20`, token);
export const fetchLeagueGroup = (tag, token) =>
  cocGet(`/clans/${tagPath(tag)}/currentwar/leaguegroup`, token);
export const fetchLeagueWar = (warTag, token) =>
  cocGet(`/clanwarleagues/wars/${tagPath(warTag)}`, token);
export const fetchRaidSeasons = (tag, token) =>
  cocGet(`/clans/${tagPath(tag)}/capitalraidseasons?limit=1`, token);
export const fetchPlayer = (tag, token) => cocGet(`/players/${tagPath(tag)}`, token);

// Les fonctions to*Dto ne gardent que les champs utiles au front.

// Images officielles fournies par l'API : ligues et étiquettes.
export const leagueIcon = (raw) =>
  raw.leagueTier?.iconUrls?.small ?? raw.league?.iconUrls?.small ?? raw.league?.iconUrls?.tiny ?? null;
export const toLabels = (labels) =>
  (labels ?? []).map((l) => ({ name: l.name, iconUrl: l.iconUrls?.small ?? null }));

export function toClanDto(raw) {
  return {
    tag: raw.tag,
    name: raw.name,
    description: raw.description ?? '',
    level: raw.clanLevel,
    points: raw.clanPoints,
    badgeUrl: raw.badgeUrls?.medium ?? null,
    warWins: raw.warWins ?? 0,
    warWinStreak: raw.warWinStreak ?? 0,
    warLeague: raw.warLeague?.name ?? null,
    location: raw.location?.name ?? null,
    type: raw.type ?? null, // open | inviteOnly | closed
    requiredTrophies: raw.requiredTrophies ?? null,
    requiredTownHall: raw.requiredTownhallLevel ?? null,
    warFrequency: raw.warFrequency ?? null,
    warLogPublic: raw.isWarLogPublic ?? null,
    warLosses: raw.warLosses ?? null, // absents quand le journal de guerre est privé
    warTies: raw.warTies ?? null,
    capitalHallLevel: raw.clanCapital?.capitalHallLevel ?? null,
    capitalPoints: raw.clanCapitalPoints ?? null,
    capitalLeague: raw.capitalLeague?.name ?? null,
    builderBasePoints: raw.clanBuilderBasePoints ?? null,
    language: raw.chatLanguage?.name ?? null,
    labels: toLabels(raw.labels),
    members: (raw.memberList ?? []).map((m) => ({
      tag: m.tag,
      name: m.name,
      role: m.role,
      expLevel: m.expLevel ?? 0,
      townHallLevel: m.townHallLevel ?? null,
      league: m.leagueTier?.name ?? m.league?.name ?? null,
      leagueIcon: leagueIcon(m),
      trophies: m.trophies ?? 0,
      donations: m.donations ?? 0,
      donationsReceived: m.donationsReceived ?? 0,
    })),
  };
}

export function toClanSummaryDto(raw) {
  return {
    tag: raw.tag,
    name: raw.name,
    level: raw.clanLevel ?? null,
    memberCount: raw.members ?? null,
    location: raw.location?.name ?? null,
    badgeUrl: raw.badgeUrls?.small ?? null,
  };
}

// "20261114T101500.000Z" -> "2026-11-14T10:15:00.000Z"
function toIsoDate(value) {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z$/.exec(value ?? '');
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}.${m[7]}Z` : null;
}

export function toWarDto(raw) {
  if (!raw?.state || raw.state === 'notInWar' || !raw.clan?.members) {
    return { state: 'notInWar' };
  }
  const opponentPosition = new Map(
    (raw.opponent?.members ?? []).map((m) => [m.tag, m.mapPosition]),
  );
  const side = (s) => ({
    tag: s.tag,
    name: s.name,
    stars: s.stars ?? 0,
    destruction: s.destructionPercentage ?? 0,
    attacks: s.attacks ?? 0,
  });
  return {
    state: raw.state, // preparation | inWar | warEnded
    teamSize: raw.teamSize,
    attacksPerMember: raw.attacksPerMember ?? 2,
    startTime: toIsoDate(raw.startTime),
    endTime: toIsoDate(raw.endTime),
    clan: side(raw.clan),
    opponent: side(raw.opponent ?? {}),
    members: [...raw.clan.members]
      .sort((a, b) => a.mapPosition - b.mapPosition)
      .map((m) => ({
        tag: m.tag,
        name: m.name,
        position: m.mapPosition,
        townHallLevel: m.townhallLevel ?? null,
        attacks: (m.attacks ?? []).map((a) => ({
          stars: a.stars,
          destruction: a.destructionPercentage,
          defenderPosition: opponentPosition.get(a.defenderTag) ?? null,
        })),
        defenses: m.opponentAttacks ?? 0,
        starsConceded: m.bestOpponentAttack?.stars ?? null,
      })),
  };
}

export function toWarLogDto(raw) {
  return (raw.items ?? [])
    .filter((w) => w.result && w.opponent?.name) // les entrées de ligue n'ont ni résultat ni adversaire
    .map((w) => ({
      result: w.result, // win | lose | tie
      endTime: toIsoDate(w.endTime),
      teamSize: w.teamSize,
      stars: w.clan?.stars ?? 0,
      destruction: w.clan?.destructionPercentage ?? 0,
      opponentName: w.opponent.name,
      opponentStars: w.opponent.stars ?? 0,
      opponentDestruction: w.opponent.destructionPercentage ?? 0,
    }));
}

export function toRaidDto(raw) {
  const season = raw.items?.[0];
  if (!season) return { state: 'none' };
  return {
    state: season.state, // ongoing | ended
    startTime: toIsoDate(season.startTime),
    endTime: toIsoDate(season.endTime),
    totalLoot: season.capitalTotalLoot ?? 0,
    raidsCompleted: season.raidsCompleted ?? 0,
    totalAttacks: season.totalAttacks ?? 0,
    districtsDestroyed: season.enemyDistrictsDestroyed ?? 0,
    members: (season.members ?? [])
      .map((m) => ({
        tag: m.tag,
        name: m.name,
        attacks: m.attacks ?? 0,
        attackLimit: (m.attackLimit ?? 0) + (m.bonusAttackLimit ?? 0),
        loot: m.capitalResourcesLooted ?? 0,
      }))
      .sort((a, b) => b.loot - a.loot),
  };
}

// Ligue de guerre de clans : agrège les manches du clan et les étoiles de ses membres.
export async function loadLeague(tag, token) {
  const group = await fetchLeagueGroup(tag, token);
  const ourTag = '#' + tag;
  const rounds = [];
  const stats = new Map();

  for (const [index, round] of (group.rounds ?? []).entries()) {
    const warTags = (round.warTags ?? []).filter((t) => t && t !== '#0');
    if (warTags.length === 0) continue;
    const wars = await Promise.all(warTags.map((t) => fetchLeagueWar(t.replace('#', ''), token)));
    const war = wars.find((w) => w.clan?.tag === ourTag || w.opponent?.tag === ourTag);
    if (!war) continue;
    const [us, them] = war.clan.tag === ourTag ? [war.clan, war.opponent] : [war.opponent, war.clan];

    let result = null;
    if (war.state === 'warEnded') {
      const diff =
        us.stars - them.stars || us.destructionPercentage - them.destructionPercentage;
      result = diff > 0 ? 'win' : diff < 0 ? 'lose' : 'tie';
    }
    rounds.push({
      round: index + 1,
      state: war.state,
      result,
      opponentName: them.name,
      stars: us.stars ?? 0,
      destruction: us.destructionPercentage ?? 0,
      opponentStars: them.stars ?? 0,
      opponentDestruction: them.destructionPercentage ?? 0,
    });

    if (war.state === 'preparation') continue;
    for (const m of us.members ?? []) {
      const s = stats.get(m.tag) ?? { tag: m.tag, name: m.name, wars: 0, attacks: 0, stars: 0, destruction: 0 };
      s.wars += 1;
      for (const a of m.attacks ?? []) {
        s.attacks += 1;
        s.stars += a.stars;
        s.destruction += a.destructionPercentage;
      }
      stats.set(m.tag, s);
    }
  }

  return {
    state: group.state, // preparation | inWar | ended
    season: group.season ?? null,
    clans: (group.clans ?? []).map((c) => ({ tag: c.tag, name: c.name })),
    rounds,
    members: [...stats.values()].sort((a, b) => b.stars - a.stars || b.destruction - a.destruction),
  };
}

export { toPlayerDto } from './playerDto.js';
