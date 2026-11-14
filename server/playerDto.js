import { leagueIcon, toLabels } from './cocClient.js';

// Conversion de la réponse /players/{tag} : l'API renvoie troupes, familiers, engins de siège
// et super troupes dans une seule liste, qu'on répartit ici par catégorie.

const SIEGE_MACHINES = new Set([
  'Wall Wrecker', 'Battle Blimp', 'Stone Slammer', 'Siege Barracks',
  'Log Launcher', 'Flame Flinger', 'Battle Drill', 'Troop Launcher',
]);
const PETS = new Set([
  'L.A.S.S.I', 'Electro Owl', 'Mighty Yak', 'Unicorn', 'Frosty', 'Diggy',
  'Poison Lizard', 'Phoenix', 'Spirit Fox', 'Angry Jelly', 'Sneezy',
]);
const SUPER_TROOPS = new Set(['Sneaky Goblin', 'Rocket Balloon', 'Inferno Dragon', 'Ice Hound']);
const isSuperTroop = (name) => name.startsWith('Super ') || SUPER_TROOPS.has(name);

// Succès du jeu qui servent de compteurs sur toute la carrière du joueur.
const CAREER_ACHIEVEMENTS = [
  'Conqueror', 'Unbreakable', 'Humiliator', 'War League Legend', 'Games Champion',
  'Friend in Need', 'Sharing is caring', 'Siege Sharer',
  'Aggressive Capitalism', 'Most Valuable Clanmate',
  'Gold Grab', 'Elixir Escapade', 'Heroic Heist', 'Well Seasoned',
];

const unit = (u) => ({ name: u.name, level: u.level, maxLevel: u.maxLevel });
const byLevel = (a, b) => b.level / b.maxLevel - a.level / a.maxLevel || a.name.localeCompare(b.name);

// Pourcentage d'avancement : niveaux atteints sur niveaux maximum du jeu.
function progress(units) {
  const max = units.reduce((n, u) => n + u.maxLevel, 0);
  return max ? Math.round((units.reduce((n, u) => n + u.level, 0) / max) * 100) : null;
}

const season = (s) => (s ? { id: s.id ?? null, rank: s.rank ?? null, trophies: s.trophies ?? null } : null);

export function toPlayerDto(raw) {
  const home = (list) => (list ?? []).filter((u) => u.village === 'home');
  const allTroops = home(raw.troops);
  const troops = allTroops.filter((u) => !SIEGE_MACHINES.has(u.name) && !PETS.has(u.name) && !isSuperTroop(u.name));
  const heroes = home(raw.heroes).map(unit);
  const spells = home(raw.spells).map(unit);
  const equipment = home(raw.heroEquipment).map(unit).sort(byLevel);
  const achievements = new Map((raw.achievements ?? []).map((a) => [a.name, a.value]));

  return {
    tag: raw.tag,
    name: raw.name,
    role: raw.role ?? null,
    clan: raw.clan ? { tag: raw.clan.tag, name: raw.clan.name, badgeUrl: raw.clan.badgeUrls?.small ?? null } : null,
    expLevel: raw.expLevel ?? 0,
    townHallLevel: raw.townHallLevel ?? null,
    townHallWeaponLevel: raw.townHallWeaponLevel ?? null,
    league: raw.leagueTier?.name ?? raw.league?.name ?? null,
    leagueIcon: leagueIcon(raw),
    trophies: raw.trophies ?? 0,
    bestTrophies: raw.bestTrophies ?? 0,
    warStars: raw.warStars ?? 0,
    warPreference: raw.warPreference ?? null, // in | out
    attackWins: raw.attackWins ?? 0,
    defenseWins: raw.defenseWins ?? 0,
    donations: raw.donations ?? 0,
    donationsReceived: raw.donationsReceived ?? 0,
    capitalContributions: raw.clanCapitalContributions ?? 0,
    labels: toLabels(raw.labels),
    legend: raw.legendStatistics
      ? {
          trophies: raw.legendStatistics.legendTrophies ?? 0,
          current: season(raw.legendStatistics.currentSeason),
          previous: season(raw.legendStatistics.previousSeason),
          best: season(raw.legendStatistics.bestSeason),
        }
      : null,
    builderBase: raw.builderHallLevel
      ? {
          hallLevel: raw.builderHallLevel,
          trophies: raw.builderBaseTrophies ?? 0,
          bestTrophies: raw.bestBuilderBaseTrophies ?? 0,
          league: raw.builderBaseLeague?.name ?? null,
          heroes: (raw.heroes ?? []).filter((h) => h.village === 'builderBase').map(unit),
        }
      : null,
    heroes,
    equipment,
    pets: allTroops.filter((u) => PETS.has(u.name)).map(unit),
    troops: troops.map(unit),
    spells,
    siegeMachines: allTroops.filter((u) => SIEGE_MACHINES.has(u.name)).map(unit),
    activeSuperTroops: allTroops.filter((u) => u.superTroopIsActive).map((u) => u.name),
    progress: {
      heroes: progress(heroes),
      troops: progress(troops),
      spells: progress(spells),
      equipment: progress(equipment),
    },
    career: CAREER_ACHIEVEMENTS.filter((name) => achievements.has(name)).map((name) => ({
      key: name,
      value: achievements.get(name),
    })),
  };
}
