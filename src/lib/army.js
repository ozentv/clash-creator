// Calculs sur les armées : qui peut jouer une composition, et ce qu'il reste à améliorer.

// Noms (API) des unités d'une composition : troupes, sorts et engin de siège.
export const compositionUnits = (composition) => [
  ...(composition.troupes ?? []).map((u) => u.nom),
  ...(composition.sorts ?? []).map((u) => u.nom),
  ...(composition.engin ? [composition.engin] : []),
];

// Un membre peut jouer une composition s'il a l'hôtel de ville requis et toutes les unités débloquées.
// `readiness` : niveau moyen de ces unités, en pourcentage du niveau maximum du jeu.
export function assessMember(composition, member) {
  const units = compositionUnits(composition);
  const missing = units.filter((name) => !member.levels[name]);
  const owned = units.filter((name) => member.levels[name]);
  const readiness = owned.length
    ? Math.round((owned.reduce((n, name) => n + member.levels[name].level / member.levels[name].maxLevel, 0) / owned.length) * 100)
    : 0;
  const hallOk = (member.townHallLevel ?? 0) >= composition.hdv;
  return { eligible: hallOk && missing.length === 0 && units.length > 0, hallOk, missing, readiness };
}

// Membres capables de jouer la composition, du mieux équipé au moins bien équipé.
export function whoCanPlay(composition, roster) {
  return roster
    .map((member) => ({ ...member, ...assessMember(composition, member) }))
    .filter((m) => m.eligible)
    .sort((a, b) => b.readiness - a.readiness || a.name.localeCompare(b.name));
}

const CATEGORIES = [
  ['heroes', 'Héros', 'hero'],
  ['equipment', 'Équipements', 'equipment'],
  ['pets', 'Familiers', 'pet'],
  ['troops', 'Troupes', 'troop'],
  ['spells', 'Sorts', 'spell'],
  ['siegeMachines', 'Engins de siège', 'siege'],
];

// Unités du village principal qui ne sont pas au niveau maximum, de l'écart le plus grand au plus petit.
export function remainingUpgrades(player) {
  const groups = CATEGORIES.map(([key, label, category]) => {
    const units = (player[key] ?? [])
      .filter((u) => u.level < u.maxLevel)
      .map((u) => ({ ...u, gap: u.maxLevel - u.level }))
      .sort((a, b) => b.gap - a.gap || a.name.localeCompare(b.name));
    return { key, label, category, units, total: (player[key] ?? []).length, levels: units.reduce((n, u) => n + u.gap, 0) };
  }).filter((g) => g.total > 0);
  return { groups, levels: groups.reduce((n, g) => n + g.levels, 0), units: groups.reduce((n, g) => n + g.units.length, 0) };
}
