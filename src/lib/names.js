// Noms français des unités, que l'API renvoie en anglais. Un nom absent reste en anglais.
const UNIT_NAMES = {
  // Héros
  'Barbarian King': 'Roi des barbares',
  'Archer Queen': 'Reine des archers',
  'Grand Warden': 'Grand gardien',
  'Royal Champion': 'Championne royale',
  'Minion Prince': 'Prince gargouille',
  'Battle Machine': 'Machine de combat',
  'Battle Copter': 'Hélicoptère de combat',
  // Troupes
  Barbarian: 'Barbare',
  Archer: 'Archer',
  Giant: 'Géant',
  Goblin: 'Gobelin',
  'Wall Breaker': 'Sapeur',
  Balloon: 'Ballon',
  Wizard: 'Sorcier',
  Healer: 'Guérisseuse',
  Dragon: 'Dragon',
  'P.E.K.K.A': 'P.E.K.K.A',
  'Baby Dragon': 'Bébé dragon',
  Miner: 'Mineur',
  'Electro Dragon': 'Électro-dragon',
  Yeti: 'Yéti',
  'Dragon Rider': 'Chevaucheur de dragon',
  'Electro Titan': 'Électro-titan',
  'Root Rider': 'Chevaucheuse de racines',
  Minion: 'Gargouille',
  'Hog Rider': 'Chevaucheur de cochon',
  Valkyrie: 'Valkyrie',
  Golem: 'Golem',
  Witch: 'Sorcière',
  'Lava Hound': 'Molosse de lave',
  Bowler: 'Bouliste',
  'Ice Golem': 'Golem de glace',
  Headhunter: 'Chasseuse de têtes',
  // Sorts
  'Lightning Spell': 'Foudre',
  'Healing Spell': 'Guérison',
  'Rage Spell': 'Rage',
  'Jump Spell': 'Saut',
  'Freeze Spell': 'Gel',
  'Clone Spell': 'Clonage',
  'Invisibility Spell': 'Invisibilité',
  'Recall Spell': 'Rappel',
  'Poison Spell': 'Poison',
  'Earthquake Spell': 'Séisme',
  'Haste Spell': 'Précipitation',
  'Skeleton Spell': 'Squelettes',
  'Bat Spell': 'Chauves-souris',
  // Engins de siège
  'Wall Wrecker': 'Broyeur de murs',
  'Battle Blimp': 'Dirigeable de combat',
  'Stone Slammer': 'Démolisseur',
  'Siege Barracks': 'Caserne de siège',
  'Log Launcher': 'Lance-bûches',
  'Flame Flinger': 'Catapulte à flammes',
  'Battle Drill': 'Foreuse de combat',
  // Familiers
  'Electro Owl': 'Électro-chouette',
  'Mighty Yak': 'Yack puissant',
  Unicorn: 'Licorne',
  Phoenix: 'Phénix',
};
export const unitName = (name) => UNIT_NAMES[name] ?? name;

// Succès du jeu utilisés comme compteurs de carrière.
export const CAREER_LABELS = {
  Conqueror: 'Attaques gagnées',
  Unbreakable: 'Défenses réussies',
  Humiliator: 'Hôtels de ville détruits',
  'War League Legend': 'Étoiles en ligue de clans',
  'Games Champion': 'Points aux jeux de clan',
  'Friend in Need': 'Troupes données',
  'Sharing is caring': 'Sorts donnés',
  'Siege Sharer': 'Engins de siège donnés',
  'Aggressive Capitalism': 'Or de capitale pillé',
  'Most Valuable Clanmate': 'Or de capitale donné',
  'Gold Grab': 'Or pillé',
  'Elixir Escapade': 'Élixir pillé',
  'Heroic Heist': 'Élixir noir pillé',
  'Well Seasoned': 'Points de défis saisonniers',
};

export const CLAN_TYPE_LABELS = { open: 'Ouvert à tous', inviteOnly: 'Sur invitation', closed: 'Fermé' };
export const WAR_FREQUENCY_LABELS = {
  always: 'Toujours en guerre',
  moreThanOncePerWeek: "Plus d'une fois par semaine",
  oncePerWeek: 'Une fois par semaine',
  lessThanOncePerWeek: "Moins d'une fois par semaine",
  never: 'Jamais',
};

// Étiquettes de clan et de joueur (l'API les renvoie en anglais).
const LABEL_NAMES = {
  'Clan Wars': 'Guerres de clans',
  'Clan War League': 'Ligue de clans',
  'Trophy Pushing': 'Course aux trophées',
  'Friendly Wars': 'Guerres amicales',
  'Clan Games': 'Jeux de clan',
  'Builder Base': 'Base des ouvriers',
  'Base Designing': 'Création de villages',
  'Clan Capital': 'Capitale de clan',
  Donations: 'Dons',
  Friendly: 'Amical',
  Talkative: 'Bavard',
  Relaxed: 'Détendu',
  Competitive: 'Compétitif',
  'Newbie Friendly': 'Débutants bienvenus',
  'Active Donator': 'Donateur actif',
  'Active Daily': 'Actif chaque jour',
  Veteran: 'Vétéran',
  Newbie: 'Débutant',
};
export const labelName = (name) => LABEL_NAMES[name] ?? name;

// Listes proposées dans le formulaire de la bibliothèque (noms de l'API).
export const TROOP_CHOICES = [
  'Barbarian', 'Archer', 'Giant', 'Goblin', 'Wall Breaker', 'Balloon', 'Wizard', 'Healer', 'Dragon',
  'P.E.K.K.A', 'Baby Dragon', 'Miner', 'Electro Dragon', 'Yeti', 'Dragon Rider', 'Electro Titan',
  'Root Rider', 'Minion', 'Hog Rider', 'Valkyrie', 'Golem', 'Witch', 'Lava Hound', 'Bowler',
  'Ice Golem', 'Headhunter',
];
export const SPELL_CHOICES = [
  'Lightning Spell', 'Healing Spell', 'Rage Spell', 'Jump Spell', 'Freeze Spell', 'Clone Spell',
  'Invisibility Spell', 'Recall Spell', 'Poison Spell', 'Earthquake Spell', 'Haste Spell',
  'Skeleton Spell', 'Bat Spell',
];
export const SIEGE_CHOICES = [
  'Wall Wrecker', 'Battle Blimp', 'Stone Slammer', 'Siege Barracks', 'Log Launcher', 'Flame Flinger',
  'Battle Drill',
];

// "sorcier" -> "Wizard" : retrouve le nom de l'API à partir du nom français saisi.
const API_NAMES = new Map(Object.entries(UNIT_NAMES).map(([api, fr]) => [fr.toLowerCase(), api]));
export const toApiName = (name) => API_NAMES.get(name.trim().toLowerCase()) ?? name.trim();
