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
    type: 'inviteOnly',
    requiredTrophies: 2400,
    requiredTownHall: 11,
    warFrequency: 'always',
    warLogPublic: true,
    warLosses: 104,
    warTies: 6,
    capitalHallLevel: 10,
    capitalPoints: 4120,
    capitalLeague: 'Master League II',
    builderBasePoints: 38650,
    language: 'Français',
    labels: ['Clan Wars', 'Clan War League', 'Friendly'],
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
      defenses: i % 3,
      starsConceded: i % 3 === 0 ? null : 1 + (i % 3),
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
  const rand = seeded(tag.charCodeAt(3) + 5);
  const ratio = Math.min(1, 0.45 + (th - 9) * 0.06);
  const units = (list) =>
    list
      .filter(([, unlockedAt]) => th >= unlockedAt)
      .map(([name, , maxLevel]) => ({
        name,
        maxLevel,
        level: Math.max(1, Math.min(maxLevel, Math.round(maxLevel * (ratio + (rand() - 0.5) * 0.25)))),
      }));
  const heroes = units([['Barbarian King', 7, 100], ['Archer Queen', 8, 100], ['Minion Prince', 9, 90], ['Grand Warden', 11, 75], ['Royal Champion', 13, 50]]);
  const troops = units([
    ['Barbarian', 1, 12], ['Archer', 1, 13], ['Giant', 1, 13], ['Goblin', 1, 9], ['Wall Breaker', 1, 13],
    ['Balloon', 1, 12], ['Wizard', 1, 13], ['Healer', 1, 10], ['Dragon', 1, 12], ['P.E.K.K.A', 1, 12],
    ['Baby Dragon', 9, 11], ['Miner', 10, 11], ['Electro Dragon', 11, 8], ['Yeti', 12, 7],
    ['Dragon Rider', 13, 5], ['Electro Titan', 14, 4], ['Root Rider', 15, 3],
    ['Minion', 1, 13], ['Hog Rider', 1, 14], ['Valkyrie', 1, 11], ['Golem', 1, 14], ['Witch', 9, 7],
    ['Lava Hound', 9, 6], ['Bowler', 10, 8], ['Ice Golem', 11, 8], ['Headhunter', 12, 3],
  ]);
  const spells = units([
    ['Lightning Spell', 1, 12], ['Healing Spell', 1, 11], ['Rage Spell', 1, 6], ['Jump Spell', 1, 5],
    ['Freeze Spell', 9, 7], ['Clone Spell', 10, 8], ['Invisibility Spell', 11, 4], ['Recall Spell', 13, 6],
    ['Poison Spell', 1, 11], ['Earthquake Spell', 1, 5], ['Haste Spell', 9, 5], ['Skeleton Spell', 10, 8], ['Bat Spell', 10, 7],
  ]);
  const equipment = units([
    ['Barbarian Puppet', 7, 18], ['Rage Vial', 7, 18], ['Giant Gauntlet', 9, 27], ['Archer Puppet', 8, 18],
    ['Invisibility Vial', 8, 18], ['Frozen Arrow', 9, 27], ['Eternal Tome', 11, 18], ['Life Gem', 11, 18],
    ['Royal Gem', 13, 18], ['Seeking Shield', 13, 18],
  ]).sort((a, b) => b.level / b.maxLevel - a.level / a.maxLevel);
  const pct = (list) => {
    const max = list.reduce((n, u) => n + u.maxLevel, 0);
    return max ? Math.round((list.reduce((n, u) => n + u.level, 0) / max) * 100) : null;
  };
  const legend = member.league === 'Legend League';
  return {
    ...member,
    clan: { tag: '#2PP', name: 'Les Démos FR', badgeUrl: null },
    townHallWeaponLevel: th >= 12 ? 4 : null,
    bestTrophies: member.trophies + 420,
    warStars: 300 + th * 55,
    warPreference: member.donations === 0 ? 'out' : 'in',
    attackWins: 40 + th * 3,
    defenseWins: 6,
    capitalContributions: member.donations * 40,
    labels: ['Clan Wars', 'Active Donator', 'Veteran'],
    legend: legend
      ? {
          trophies: 1240,
          current: { id: null, rank: 48211, trophies: member.trophies },
          previous: { id: '2026-10', rank: 51200, trophies: 5510 },
          best: { id: '2026-06', rank: 20417, trophies: 5894 },
        }
      : null,
    builderBase: {
      hallLevel: Math.min(10, th - 6),
      trophies: 2100 + th * 90,
      bestTrophies: 2600 + th * 90,
      league: 'Brass League I',
      heroes: [{ name: 'Battle Machine', level: 12 + th, maxLevel: 35 }],
    },
    heroes,
    equipment,
    pets: units([['L.A.S.S.I', 14, 15], ['Electro Owl', 14, 15], ['Mighty Yak', 14, 15], ['Unicorn', 14, 15], ['Frosty', 15, 15]]),
    troops,
    spells,
    siegeMachines: units([['Wall Wrecker', 12, 5], ['Battle Blimp', 12, 4], ['Stone Slammer', 12, 5], ['Siege Barracks', 13, 5], ['Log Launcher', 13, 5]]),
    activeSuperTroops: th >= 11 ? ['Super Barbarian', 'Sneaky Goblin'] : [],
    progress: { heroes: pct(heroes), troops: pct(troops), spells: pct(spells), equipment: pct(equipment) },
    career: [
      ['Conqueror', 4200 + th * 310], ['Unbreakable', 900 + th * 40], ['Humiliator', 5100 + th * 280],
      ['War League Legend', 180 + th * 22], ['Games Champion', 96000 + th * 9000],
      ['Friend in Need', 210000 + member.donations * 60], ['Sharing is caring', 8200], ['Siege Sharer', 640],
      ['Aggressive Capitalism', 2400000 + th * 90000], ['Most Valuable Clanmate', 1900000 + th * 60000],
      ['Gold Grab', 1850000000 + th * 40000000], ['Elixir Escapade', 1920000000 + th * 40000000],
      ['Heroic Heist', 14200000 + th * 600000], ['Well Seasoned', 61000 + th * 2400],
    ].map(([key, value]) => ({ key, value })),
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
