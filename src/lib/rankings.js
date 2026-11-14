import { formatNumber, formatSigned } from './format.js';

export const RANKINGS = {
  trophies: {
    key: 'trophies',
    label: 'Trophées',
    icon: '🏆',
    value: (m) => m.trophies,
    format: formatNumber,
  },
  donations: {
    key: 'donations',
    label: 'Dons',
    icon: '🎁',
    value: (m) => m.donations,
    format: formatNumber,
  },
  balance: {
    key: 'balance',
    label: 'Bilan dons',
    icon: '⚖️',
    hint: 'Dons donnés moins dons reçus',
    value: (m) => m.donations - m.donationsReceived,
    format: formatSigned,
  },
  expLevel: {
    key: 'expLevel',
    label: 'Niveau',
    icon: '⭐',
    value: (m) => m.expLevel,
    format: formatNumber,
  },
  townHall: {
    key: 'townHall',
    label: 'Hôtel de ville',
    icon: '🏰',
    value: (m) => m.townHallLevel ?? 0,
    format: (n) => `HDV ${n}`,
  },
};

export function rankMembers(members, key) {
  const { value } = RANKINGS[key];
  return members
    .map((m) => ({ ...m, score: value(m) }))
    .sort((a, b) => b.score - a.score || b.trophies - a.trophies || a.name.localeCompare(b.name))
    .map((m, i) => ({ ...m, rank: i + 1 }));
}

export function computeStats(members) {
  const sum = (key) => members.reduce((total, m) => total + m[key], 0);
  const count = members.length;
  const totalTrophies = sum('trophies');
  const totalDonations = sum('donations');
  return {
    count,
    totalTrophies,
    totalDonations,
    avgTrophies: count ? Math.round(totalTrophies / count) : 0,
    avgDonations: count ? Math.round(totalDonations / count) : 0,
    topDonor: rankMembers(members, 'donations')[0] ?? null,
  };
}

// L'API ne donne pas la date de dernière connexion : on repère les membres
// probablement inactifs à partir de leurs dons et trophées de la saison.
export function findInactiveMembers(members) {
  const { avgTrophies, avgDonations } = computeStats(members);
  if (avgDonations === 0) return []; // début de saison : rien à comparer
  return members
    .map((m) => {
      if (m.donations === 0 && m.donationsReceived === 0) {
        return { ...m, reason: 'Aucun don donné ni reçu cette saison' };
      }
      if (m.donations < avgDonations * 0.25 && m.trophies < avgTrophies) {
        return { ...m, reason: 'Peu de dons et trophées sous la moyenne du clan' };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.donations - b.donations || a.trophies - b.trophies);
}
