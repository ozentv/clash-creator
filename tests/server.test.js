import test from 'node:test';
import assert from 'node:assert/strict';
import { toClanDto, toPlayerDto, toRaidDto, toWarDto, toWarLogDto } from '../server/cocClient.js';
import { buildDemoClan, buildDemoPlayer, buildDemoWar } from '../server/demoData.js';

test('toClanDto tolère les champs absents', () => {
  const clan = toClanDto({ tag: '#2PP', name: 'Test', clanLevel: 3, memberList: [{ tag: '#A', name: 'a', role: 'leader' }] });
  assert.equal(clan.members[0].trophies, 0);
  assert.equal(clan.members[0].townHallLevel, null);
  assert.equal(clan.badgeUrl, null);
  assert.deepEqual(toClanDto({ tag: '#2PP', name: 'Vide' }).members, []);
  const labelled = toClanDto({ tag: '#2PP', name: 'T', labels: [{ name: 'Clan Wars', iconUrls: { small: 'https://x/y.png' } }] });
  assert.deepEqual(labelled.labels, [{ name: 'Clan Wars', iconUrl: 'https://x/y.png' }]);
});

test('toWarDto trie les membres et convertit les dates', () => {
  const war = toWarDto({
    state: 'inWar',
    teamSize: 5,
    endTime: '20261114T101500.000Z',
    clan: {
      tag: '#A',
      name: 'A',
      stars: 3,
      destructionPercentage: 55.5,
      members: [
        { tag: '#P2', name: 'b', mapPosition: 2 },
        { tag: '#P1', name: 'a', mapPosition: 1, attacks: [{ defenderTag: '#O1', stars: 3, destructionPercentage: 100 }] },
      ],
    },
    opponent: { tag: '#B', name: 'B', members: [{ tag: '#O1', mapPosition: 4 }] },
  });
  assert.equal(war.endTime, '2026-11-14T10:15:00.000Z');
  assert.equal(war.attacksPerMember, 2);
  assert.deepEqual(war.members.map((m) => m.name), ['a', 'b']);
  assert.equal(war.members[0].attacks[0].defenderPosition, 4);
  assert.deepEqual(war.members[1].attacks, []);
});

test('toWarDto reconnaît un clan hors guerre', () => {
  assert.deepEqual(toWarDto({ state: 'notInWar', clan: {}, opponent: {} }), { state: 'notInWar' });
});

test('toWarLogDto ignore les entrées de ligue', () => {
  const wars = toWarLogDto({
    items: [
      { result: 'win', endTime: '20261110T101500.000Z', clan: { stars: 40 }, opponent: { name: 'X', stars: 30 } },
      { result: null, clan: { stars: 12 }, opponent: {} },
    ],
  });
  assert.equal(wars.length, 1);
  assert.equal(wars[0].opponentName, 'X');
});

test('toRaidDto additionne les attaques bonus et gère une liste vide', () => {
  const raid = toRaidDto({
    items: [{ state: 'ended', members: [{ tag: '#A', name: 'a', attacks: 5, attackLimit: 5, bonusAttackLimit: 1, capitalResourcesLooted: 9 }] }],
  });
  assert.equal(raid.members[0].attackLimit, 6);
  assert.deepEqual(toRaidDto({ items: [] }), { state: 'none' });
});

test('toPlayerDto ne garde que les héros du village principal', () => {
  const player = toPlayerDto({
    tag: '#P',
    name: 'x',
    heroes: [
      { name: 'Archer Queen', level: 80, maxLevel: 95, village: 'home' },
      { name: 'Battle Machine', level: 30, maxLevel: 35, village: 'builderBase' },
    ],
  });
  assert.deepEqual(player.heroes.map((h) => h.name), ['Archer Queen']);
  assert.equal(player.builderBase, null);
  assert.equal(player.legend, null);
});

test('toPlayerDto répartit troupes, familiers, engins et super troupes', () => {
  const troop = (name, extra = {}) => ({ name, level: 5, maxLevel: 10, village: 'home', ...extra });
  const player = toPlayerDto({
    tag: '#P',
    name: 'x',
    builderHallLevel: 9,
    troops: [
      troop('Barbarian'),
      troop('Super Barbarian', { superTroopIsActive: true }),
      troop('Sneaky Goblin'),
      troop('Wall Wrecker'),
      troop('Unicorn'),
      troop('Raged Barbarian', { village: 'builderBase' }),
    ],
    spells: [{ name: 'Rage Spell', level: 6, maxLevel: 6, village: 'home' }],
    achievements: [{ name: 'Friend in Need', value: 1234 }, { name: 'Bigger Coffers', value: 9 }],
  });
  assert.deepEqual(player.troops.map((u) => u.name), ['Barbarian']);
  assert.deepEqual(player.siegeMachines.map((u) => u.name), ['Wall Wrecker']);
  assert.deepEqual(player.pets.map((u) => u.name), ['Unicorn']);
  assert.deepEqual(player.activeSuperTroops, ['Super Barbarian']);
  assert.equal(player.progress.troops, 50);
  assert.equal(player.progress.spells, 100);
  assert.equal(player.progress.heroes, null);
  assert.deepEqual(player.career, [{ key: 'Friend in Need', value: 1234 }]);
  assert.equal(player.builderBase.hallLevel, 9);
});

test('les données de démo sont cohérentes entre elles', () => {
  const clan = buildDemoClan('2PP');
  const war = buildDemoWar('2PP');
  const tags = new Set(clan.members.map((m) => m.tag));
  assert.equal(tags.size, clan.members.length); // tags uniques
  assert.ok(war.members.every((m) => tags.has(m.tag)));
  assert.equal(buildDemoPlayer(clan.members[0].tag.slice(1)).name, clan.members[0].name);
  assert.equal(buildDemoPlayer('ZZZZ'), null);
});
