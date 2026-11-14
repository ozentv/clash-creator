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
  400: 'Tag de clan invalide.',
  403: "Accès refusé par l'API Clash of Clans : token invalide ou adresse IP du serveur non autorisée pour cette clé.",
  404: 'Clan introuvable. Vérifie le tag.',
  429: 'Trop de requêtes. Réessaie dans quelques instants.',
  503: "L'API Clash of Clans est en maintenance.",
};

export async function fetchClan(tag, token) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/clans/${encodeURIComponent('#' + tag)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new CocApiError(502, "Impossible de joindre l'API Clash of Clans.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // Un vrai « clan introuvable » vient de l'API avec reason = notFound.
    // Tout autre 404 signale une adresse d'API (COC_API_BASE_URL) incorrecte.
    if (res.status === 404 && body?.reason !== 'notFound') {
      throw new CocApiError(
        502,
        "L'adresse de l'API est incorrecte : vérifie COC_API_BASE_URL (elle doit se terminer par /v1).",
      );
    }
    console.error('API Clash of Clans :', res.status, body?.reason ?? '', body?.message ?? '');
    throw new CocApiError(
      res.status,
      ERROR_MESSAGES[res.status] ?? `Erreur de l'API Clash of Clans (${res.status}).`,
    );
  }
  return res.json();
}

// Ne garde que les champs utiles au front.
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
      expLevel: m.expLevel,
      townHallLevel: m.townHallLevel ?? null,
      league: m.leagueTier?.name ?? m.league?.name ?? null,
      trophies: m.trophies ?? 0,
      donations: m.donations ?? 0,
      donationsReceived: m.donationsReceived ?? 0,
    })),
  };
}
