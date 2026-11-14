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
  'Apprentice Warden': 'Apprenti gardien',
  Druid: 'Druide',
  Thrower: 'Lanceur',
  Furnace: 'Fournaise',
  // Super troupes
  'Super Barbarian': 'Super barbare',
  'Super Archer': 'Super archer',
  'Super Giant': 'Super géant',
  'Sneaky Goblin': 'Gobelin furtif',
  'Super Wall Breaker': 'Super sapeur',
  'Rocket Balloon': 'Ballon-fusée',
  'Super Wizard': 'Super sorcier',
  'Super Dragon': 'Super dragon',
  'Inferno Dragon': 'Dragon infernal',
  'Super Minion': 'Super gargouille',
  'Super Valkyrie': 'Super valkyrie',
  'Super Witch': 'Super sorcière',
  'Ice Hound': 'Molosse de glace',
  'Super Bowler': 'Super bouliste',
  'Super Miner': 'Super mineur',
  'Super Hog Rider': 'Super chevaucheur de cochon',
  'Super Yeti': 'Super yéti',
  // Autres sorts, engins et familiers
  'Overgrowth Spell': 'Prolifération',
  'Revive Spell': 'Résurrection',
  'Troop Launcher': 'Lance-troupes',
  'Poison Lizard': 'Lézard venimeux',
  'Spirit Fox': 'Renard spirituel',
  'Angry Jelly': 'Gelée furieuse',
  // Équipements de héros
  'Barbarian Puppet': 'Marionnette barbare',
  'Rage Vial': 'Fiole de rage',
  'Earthquake Boots': 'Bottes sismiques',
  Vampstache: 'Vampistache',
  'Giant Gauntlet': 'Gantelet géant',
  'Spiky Ball': 'Boule à pointes',
  'Snake Bracelet': 'Bracelet serpent',
  'Archer Puppet': 'Marionnette archer',
  'Invisibility Vial': "Fiole d'invisibilité",
  'Giant Arrow': 'Flèche géante',
  'Healer Puppet': 'Marionnette guérisseuse',
  'Frozen Arrow': 'Flèche gelée',
  'Magic Mirror': 'Miroir magique',
  'Action Figure': 'Figurine articulée',
  'Eternal Tome': 'Tome éternel',
  'Life Gem': 'Gemme de vie',
  'Rage Gem': 'Gemme de rage',
  'Healing Tome': 'Tome de guérison',
  Fireball: 'Boule de feu',
  'Royal Gem': 'Gemme royale',
  'Seeking Shield': 'Bouclier chercheur',
  'Hog Rider Puppet': 'Marionnette chevaucheur de cochon',
  'Haste Vial': 'Fiole de précipitation',
  'Rocket Spear': 'Lance-roquette',
  'Electro Boots': 'Bottes électriques',
  'Dark Orb': 'Orbe sombre',
  'Metal Pants': 'Pantalon en métal',
  // Base des ouvriers
  'Raged Barbarian': 'Barbare enragé',
  'Sneaky Archer': 'Archer furtive',
  'Boxer Giant': 'Géant boxeur',
  'Beta Minion': 'Gargouille bêta',
  Bomber: 'Bombardier',
  'Cannon Cart': 'Chariot à canon',
  'Night Witch': 'Sorcière de la nuit',
  'Drop Ship': 'Vaisseau de largage',
  'Power P.E.K.K.A': 'Super P.E.K.K.A',
  'Hog Glider': 'Planeur à cochon',
  'Electrofire Wizard': 'Sorcier électrofeu',
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

// Ligues : "Crystal League II" -> "Ligue Cristal II". Un nom inconnu garde son mot anglais.
const LEAGUE_WORDS = {
  Bronze: 'Bronze', Silver: 'Argent', Gold: 'Or', Crystal: 'Cristal', Master: 'Maître',
  Champion: 'Champion', Titan: 'Titan', Legend: 'Légende',
  Wood: 'Bois', Clay: 'Argile', Stone: 'Pierre', Copper: 'Cuivre', Brass: 'Laiton', Iron: 'Fer',
  Steel: 'Acier', Titanium: 'Titane', Platinum: 'Platine', Emerald: 'Émeraude', Ruby: 'Rubis',
  Diamond: 'Diamant',
};
export function leagueName(name) {
  if (!name) return name;
  if (name === 'Unranked') return 'Non classé';
  const match = /^(.+?) League(?: (.+))?$/.exec(name);
  if (!match) return name;
  return ['Ligue', LEAGUE_WORDS[match[1]] ?? match[1], match[2]].filter(Boolean).join(' ');
}

// Ce que mesure chaque succès, en français. Le titre officiel du succès reste celui du jeu.
export const ACHIEVEMENT_LABELS = {
  ...CAREER_LABELS,
  'Bigger Coffers': "Niveau de la réserve d'or",
  'Get those Goblins!': 'Étoiles gagnées en campagne solo',
  'Get even more Goblins!': 'Étoiles gagnées en campagne solo (suite)',
  'Bigger & Better': "Niveau de l'hôtel de ville",
  'Nice and Tidy': 'Obstacles retirés',
  'Discover New Troops': 'Troupes débloquées à la caserne',
  'Sweet Victory!': 'Record de trophées',
  'Empire Builder': 'Niveau du château de clan',
  'Wall Buster': 'Remparts détruits',
  'Union Buster': "Cabanes d'ouvrier détruites",
  'War Hero': 'Étoiles gagnées en guerre de clans',
  'Clan War Wealth': "Or récupéré du butin de guerre",
  'Firefighter': 'Tours de l’enfer détruites',
  'X-Bow Exterminator': 'Arcs-X détruits',
  'Mortar Mauler': 'Mortiers détruits',
  'Anti-Artillery': "Artilleries aigle détruites",
  'Shattered and Scattered': 'Scattershots détruits',
  'Not So Easy This Time': "Hôtels de ville armés détruits",
  'League All-Star': 'Meilleure ligue atteinte',
  'Master Engineering': 'Niveau de la maison des ouvriers',
  'Next Generation Model': 'Niveau de la machine de combat',
  'Un-Build It': 'Maisons des ouvriers détruites',
  'Champion Builder': 'Record de trophées à la base des ouvriers',
  'High Gear': 'Bâtiments améliorés avec le mécanisme',
  'Hidden Treasures': 'Tour de l’horloge reconstruite',
  'Superb Work': 'Super troupes activées',
  'Counterspell': 'Tours de sorts détruites',
  'Monolith Masher': 'Monolithes détruits',
  'Get those other Goblins!': 'Étoiles gagnées sur la carte des ouvriers',
  'Ungrateful Child': 'Ogives du chef des gobelins détruites',
  'Bust This!': 'Statues du roi gobelin détruites',
  'Keep Your Account Safe!': 'Compte protégé par Supercell ID',
};
