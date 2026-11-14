// Données fictives servies quand aucun COC_API_TOKEN n'est configuré,
// pour pouvoir tester l'interface sans clé API.

const NAMES = [
  'DarkViking', 'Néo', 'LaReineRouge', 'xX_Pekka_Xx', 'Tonton Gobelin', 'Zeus94',
  'MissHdv', 'Barbouze', 'Sorcier Fou', 'Kratos', 'Lulu la Mine', 'Capitaine Élixir',
  'Rushator', 'Golem2Pierre', 'Shadow', 'Mamie Valkyrie', 'El Dragon', 'Titi',
  'ArcherQueen_', 'Bouliste', 'Le Farmeur', 'Momo', 'Sapeur Zélé', 'Yeti Blanc',
  'Gardien Noir', 'Pioupiou', 'Le Baron', 'Foudre', 'Mineur Pro', 'Petit Poucet',
];
const TAG_CHARS = '0289PYLQGRJCUV';

// Générateur pseudo-aléatoire déterministe : les données restent stables.
function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function buildMembers() {
  const rand = seeded(42);
  return NAMES.map((name, i) => {
    const th = Math.max(9, 17 - Math.floor(i / 4));
    const quiet = i % 9 === 8; // quelques membres peu actifs
    return {
      tag: `#QQ${TAG_CHARS[Math.floor(i / 14)]}${TAG_CHARS[i % 14]}`,
      name,
      role: i === 0 ? 'leader' : i < 4 ? 'coLeader' : i < 12 ? 'admin' : 'member',
      expLevel: 90 + th * 9 + Math.floor(rand() * 30),
      townHallLevel: th,
      league: th >= 15 ? 'Legend League' : th >= 12 ? 'Titan League' : 'Champion League',
      trophies: Math.floor(1800 + th * 210 + rand() * 900) - (quiet ? 1500 : 0),
      donations: quiet ? 0 : Math.floor(rand() ** 2 * 4200),
      donationsReceived: quiet ? 0 : Math.floor(rand() * 2600),
    };
  });
}

export function buildDemoClan(tag) {
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
    members: buildMembers(),
  };
}

export function buildDemoWar(tag) {
  const rand = seeded(7);
  const members = buildMembers()
    .slice(0, 15)
    .map((m, i) => ({
      tag: m.tag,
      name: m.name,
      position: i + 1,
      townHallLevel: m.townHallLevel,
      attacks: Array.from({ length: i % 4 === 0 ? 0 : i % 4 === 1 ? 1 : 2 }, (_, n) => {
        const stars = Math.min(3, 1 + Math.floor(rand() * 3));
        return {
          stars,
          destruction: stars === 3 ? 100 : Math.floor(50 + rand() * 49),
          defenderPosition: Math.min(15, Math.max(1, i + 1 + n)),
        };
      }),
    }));
  const attacks = members.flatMap((m) => m.attacks);
  return {
    state: 'inWar',
    teamSize: 15,
    attacksPerMember: 2,
    startTime: new Date(Date.now() - 19 * 3_600_000).toISOString(),
    endTime: new Date(Date.now() + 5 * 3_600_000).toISOString(),
    clan: {
      tag: `#${tag}`,
      name: 'Les Démos FR',
      stars: 31,
      destruction: 78.4,
      attacks: attacks.length,
    },
    opponent: { tag: '#QQQQ', name: 'Les Rivaux', stars: 28, destruction: 71.9, attacks: 17 },
    members,
  };
}

export function buildDemoPlayer(tag) {
  const member = buildMembers().find((m) => m.tag === `#${tag}`);
  if (!member) return null;
  const th = member.townHallLevel;
  const hero = (name, unlockedAt, max) =>
    th >= unlockedAt ? [{ name, level: Math.min(max, (th - unlockedAt + 1) * 12), maxLevel: max }] : [];
  return {
    ...member,
    builderHallLevel: Math.min(10, th - 6),
    bestTrophies: member.trophies + 420,
    builderBaseTrophies: 2100 + th * 90,
    warStars: 300 + th * 55,
    warPreference: member.donations === 0 ? 'out' : 'in',
    attackWins: 40 + th * 3,
    defenseWins: 6,
    capitalContributions: member.donations * 40,
    heroes: [
      ...hero('Barbarian King', 7, 100),
      ...hero('Archer Queen', 8, 100),
      ...hero('Grand Warden', 11, 75),
      ...hero('Royal Champion', 13, 50),
    ],
  };
}
