export const RANKINGS = {
  trophies: { key: 'trophies', label: 'Trophées', icon: '🏆' },
  donations: { key: 'donations', label: 'Dons', icon: '🎁' },
};

export function rankMembers(members, key) {
  return [...members]
    .sort((a, b) => b[key] - a[key] || a.name.localeCompare(b.name))
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
    inactiveDonors: members.filter((m) => m.donations === 0).length,
    topTrophies: rankMembers(members, 'trophies')[0] ?? null,
    topDonor: rankMembers(members, 'donations')[0] ?? null,
  };
}
