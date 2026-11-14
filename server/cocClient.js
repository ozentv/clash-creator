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

async function cocGet(path, token) {
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
export const fetchPlayer = (tag, token) => cocGet(`/players/${tagPath(tag)}`, token);

// Les fonctions to*Dto ne gardent que les champs utiles au front.

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
    members: (raw.memberList ?? []).map((m) => ({
      tag: m.tag,
      name: m.name,
      role: m.role,
      expLevel: m.expLevel ?? 0,
      townHallLevel: m.townHallLevel ?? null,
      league: m.leagueTier?.name ?? m.league?.name ?? null,
      trophies: m.trophies ?? 0,
      donations: m.donations ?? 0,
      donationsReceived: m.donationsReceived ?? 0,
    })),
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
      })),
  };
}

export function toPlayerDto(raw) {
  return {
    tag: raw.tag,
    name: raw.name,
    role: raw.role ?? null,
    expLevel: raw.expLevel ?? 0,
    townHallLevel: raw.townHallLevel ?? null,
    builderHallLevel: raw.builderHallLevel ?? null,
    league: raw.leagueTier?.name ?? raw.league?.name ?? null,
    trophies: raw.trophies ?? 0,
    bestTrophies: raw.bestTrophies ?? 0,
    builderBaseTrophies: raw.builderBaseTrophies ?? null,
    warStars: raw.warStars ?? 0,
    warPreference: raw.warPreference ?? null, // in | out
    attackWins: raw.attackWins ?? 0,
    defenseWins: raw.defenseWins ?? 0,
    donations: raw.donations ?? 0,
    donationsReceived: raw.donationsReceived ?? 0,
    capitalContributions: raw.clanCapitalContributions ?? 0,
    heroes: (raw.heroes ?? [])
      .filter((h) => h.village === 'home')
      .map((h) => ({ name: h.name, level: h.level, maxLevel: h.maxLevel })),
  };
}
