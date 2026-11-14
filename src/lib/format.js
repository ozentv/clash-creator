const nf = new Intl.NumberFormat('fr-FR');
export const formatNumber = (n) => nf.format(n);
export const formatSigned = (n) => (n > 0 ? '+' : '') + nf.format(n);

export const ROLE_LABELS = {
  leader: 'Chef',
  coLeader: 'Chef adjoint',
  admin: 'Aîné',
  member: 'Membre',
};

export const HERO_LABELS = {
  'Barbarian King': 'Roi des barbares',
  'Archer Queen': 'Reine des archers',
  'Grand Warden': 'Grand gardien',
  'Royal Champion': 'Championne royale',
  'Minion Prince': 'Prince gargouille',
};

// "5 h 12" ou "34 min" jusqu'à (ou depuis) une date ISO.
export function formatDuration(ms) {
  const minutes = Math.max(0, Math.round(Math.abs(ms) / 60_000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
}
