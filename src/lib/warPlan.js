// Plan d'attaque de guerre : pour chaque membre (repéré par sa position), une ou deux cibles
// ennemies. Le plan tient dans l'adresse de la page, donc il se partage par simple lien.

export const MAX_TARGETS = 2;
const valid = (n) => Number.isInteger(n) && n >= 1 && n <= 50;

// { 1: [3, 4], 2: [1] } -> "1-3.4_2-1"
export function encodePlan(plan) {
  return Object.entries(plan)
    .map(([position, targets]) => [Number(position), targets.filter(valid).slice(0, MAX_TARGETS)])
    .filter(([position, targets]) => valid(position) && targets.length > 0)
    .sort((a, b) => a[0] - b[0])
    .map(([position, targets]) => `${position}-${targets.join('.')}`)
    .join('_');
}

export function decodePlan(text) {
  const plan = {};
  for (const part of (text ?? '').split('_')) {
    const match = /^(\d{1,2})-(\d{1,2}(?:\.\d{1,2})*)$/.exec(part);
    if (!match) continue;
    const position = Number(match[1]);
    const targets = match[2].split('.').map(Number).filter(valid).slice(0, MAX_TARGETS);
    if (valid(position) && targets.length > 0) plan[position] = targets;
  }
  return plan;
}

// Analyse d'un plan : cibles prises plusieurs fois et bases ennemies que personne n'attaque.
export function reviewPlan(plan, teamSize) {
  const counts = new Map();
  for (const targets of Object.values(plan)) {
    for (const target of targets) counts.set(target, (counts.get(target) ?? 0) + 1);
  }
  return {
    assigned: [...counts.values()].reduce((a, b) => a + b, 0),
    doubled: [...counts].filter(([, n]) => n > 1).map(([target]) => target).sort((a, b) => a - b),
    uncovered: Array.from({ length: teamSize }, (_, i) => i + 1).filter((n) => !counts.has(n)),
  };
}
