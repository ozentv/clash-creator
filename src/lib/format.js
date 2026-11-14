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

const df = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
export const formatDate = (iso) => (iso ? df.format(new Date(iso)) : '—');

export const RESULT_LABELS = { win: 'Victoire', lose: 'Défaite', tie: 'Égalité' };
export const RESULT_STYLES = {
  win: 'bg-emerald-400/10 text-emerald-300',
  lose: 'bg-red-400/10 text-red-300',
  tie: 'bg-zinc-400/10 text-zinc-300',
};
