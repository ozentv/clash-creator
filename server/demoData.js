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

export function buildDemoSearch(name) {
  return ['FR', 'Élite', 'Academy'].map((suffix, i) => ({
    tag: `#2PP${TAG_CHARS[i]}`,
    name: `${name} ${suffix}`,
    level: 18 - i * 4,
    memberCount: 50 - i * 9,
    location: 'France',
    badgeUrl: null,
  }));
}

export function buildDemoWarLog() {
  const rand = seeded(11);
  const opponents = ['Les Rivaux', 'Team Foudre', 'Dragons Noirs', 'Clan des Loups', 'Phoenix FR', 'Les Invaincus', 'War Machine', 'La Horde'];
  return opponents.map((opponentName, i) => {
    const stars = 36 + Math.floor(rand() * 9);
    const opponentStars = 33 + Math.floor(rand() * 11);
    return {
      result: stars > opponentStars ? 'win' : stars < opponentStars ? 'lose' : 'tie',
      endTime: new Date(Date.now() - (i * 2 + 1) * 86_400_000).toISOString(),
      teamSize: 15,
      stars,
      destruction: 80 + rand() * 19,
      opponentName,
      opponentStars,
      opponentDestruction: 75 + rand() * 22,
    };
  });
}

export function buildDemoLeague() {
  const rand = seeded(23);
  const opponents = ['Team Foudre', 'Dragons Noirs', 'Phoenix FR', 'La Horde', 'War Machine', 'Les Loups', 'Titans'];
  const rounds = opponents.map((opponentName, i) => {
    const done = i < 3;
    const stars = i < 4 ? 30 + Math.floor(rand() * 13) : 0;
    const opponentStars = i < 4 ? 28 + Math.floor(rand() * 14) : 0;
    return {
      round: i + 1,
      state: done ? 'warEnded' : i === 3 ? 'inWar' : 'preparation',
      result: done ? (stars > opponentStars ? 'win' : stars < opponentStars ? 'lose' : 'tie') : null,
      opponentName,
      stars,
      destruction: i < 4 ? 78 + rand() * 20 : 0,
      opponentStars,
      opponentDestruction: i < 4 ? 74 + rand() * 22 : 0,
    };
  });
  const members = buildMembers()
    .slice(0, 15)
    .map((m, i) => {
      const attacks = i % 5 === 4 ? 2 : i % 7 === 6 ? 3 : 4;
      const stars = Math.round(attacks * (1.6 + rand() * 1.4));
      return { tag: m.tag, name: m.name, wars: 4, attacks, stars, destruction: attacks * (70 + rand() * 30) };
    })
    .sort((a, b) => b.stars - a.stars);
  return {
    state: 'inWar',
    season: new Date().toISOString().slice(0, 7),
    clans: [{ tag: '#2PP', name: 'Les Démos FR' }, ...opponents.map((name, i) => ({ tag: `#2PP${TAG_CHARS[i]}`, name }))],
    rounds,
    members,
  };
}

export function buildDemoRaids() {
  const rand = seeded(31);
  const members = buildMembers()
    .filter((_, i) => i % 6 !== 5)
    .map((m, i) => {
      const attackLimit = 5 + (i % 3 === 0 ? 1 : 0);
      const attacks = i % 4 === 3 ? Math.floor(rand() * attackLimit) : attackLimit;
      return { tag: m.tag, name: m.name, attacks, attackLimit, loot: Math.floor(attacks * (2500 + rand() * 2500)) };
    })
    .sort((a, b) => b.loot - a.loot);
  return {
    state: 'ongoing',
    startTime: new Date(Date.now() - 86_400_000).toISOString(),
    endTime: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    totalLoot: members.reduce((n, m) => n + m.loot, 0),
    raidsCompleted: 3,
    totalAttacks: members.reduce((n, m) => n + m.attacks, 0),
    districtsDestroyed: 21,
    members,
  };
}
