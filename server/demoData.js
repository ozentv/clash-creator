// Clan fictif servi quand aucun COC_API_TOKEN n'est configuré,
// pour pouvoir tester l'interface sans clé API.

const NAMES = [
  'DarkViking', 'Néo', 'LaReineRouge', 'xX_Pekka_Xx', 'Tonton Gobelin', 'Zeus94',
  'MissHdv', 'Barbouze', 'Sorcier Fou', 'Kratos', 'Lulu la Mine', 'Capitaine Élixir',
  'Rushator', 'Golem2Pierre', 'Shadow', 'Mamie Valkyrie', 'El Dragon', 'Titi',
  'ArcherQueen_', 'Bouliste', 'Le Farmeur', 'Momo', 'Sapeur Zélé', 'Yeti Blanc',
  'Gardien Noir', 'Pioupiou', 'Le Baron', 'Foudre', 'Mineur Pro', 'Petit Poucet',
];

// Générateur pseudo-aléatoire déterministe : les données restent stables.
function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function buildDemoClan(tag) {
  const rand = seeded(42);
  const members = NAMES.map((name, i) => {
    const th = Math.max(9, 17 - Math.floor(i / 4));
    const donations = Math.floor(rand() ** 2 * 4200);
    return {
      tag: `#DEMO${i}`,
      name,
      role: i === 0 ? 'leader' : i < 4 ? 'coLeader' : i < 12 ? 'admin' : 'member',
      expLevel: 90 + th * 9 + Math.floor(rand() * 30),
      townHallLevel: th,
      league: th >= 15 ? 'Legend League' : th >= 12 ? 'Titan League' : 'Champion League',
      trophies: Math.floor(1800 + th * 210 + rand() * 900),
      donations,
      donationsReceived: Math.floor(rand() * 2600),
    };
  });
  return {
    tag: `#${tag}`,
    name: 'Les Démos FR',
    description: 'Clan de démonstration — ajoute ton token API pour voir de vraies données.',
    level: 18,
    points: 48210,
    badgeUrl: null,
    warWins: 312,
    warWinStreak: 7,
    warLeague: 'Crystal League I',
    location: 'France',
    members,
  };
}
