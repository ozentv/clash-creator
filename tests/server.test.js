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
