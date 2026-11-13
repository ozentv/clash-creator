const nf = new Intl.NumberFormat('fr-FR');
export const formatNumber = (n) => nf.format(n);

export const ROLE_LABELS = {
  leader: 'Chef',
  coLeader: 'Chef adjoint',
  admin: 'Aîné',
  member: 'Membre',
};
