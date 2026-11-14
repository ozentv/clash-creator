import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTag } from '../src/lib/tag.js';
import { computeStats, findInactiveMembers, rankMembers } from '../src/lib/rankings.js';
import { formatDuration } from '../src/lib/format.js';

const member = (name, trophies, donations, donationsReceived = 0, extra = {}) => ({
  tag: `#${name}`,
  name,
  role: 'member',
  expLevel: 100,
  townHallLevel: 12,
  trophies,
  donations,
  donationsReceived,
  ...extra,
});

test('normalizeTag nettoie et valide les tags', () => {
  assert.equal(normalizeTag('#2pp'), '2PP');
  assert.equal(normalizeTag(' 2ppo '), '2PP0'); // la lettre O devient le chiffre 0
  assert.equal(normalizeTag('#ABC'), null); // caractères interdits
  assert.equal(normalizeTag('#2P'), null); // trop court
  assert.equal(normalizeTag(''), null);
});

test('rankMembers trie par valeur décroissante et numérote', () => {
  const ranked = rankMembers([member('a', 100, 5), member('b', 300, 1), member('c', 200, 9)], 'trophies');
  assert.deepEqual(ranked.map((m) => [m.name, m.rank]), [['b', 1], ['c', 2], ['a', 3]]);
});

test('le classement « bilan dons » soustrait les dons reçus', () => {
  const ranked = rankMembers([member('a', 0, 100, 400), member('b', 0, 50, 10)], 'balance');
  assert.deepEqual(ranked.map((m) => [m.name, m.score]), [['b', 40], ['a', -300]]);
});

test('computeStats calcule totaux, moyennes et meilleur donateur', () => {
  const stats = computeStats([member('a', 1000, 10), member('b', 2000, 30)]);
  assert.equal(stats.count, 2);
  assert.equal(stats.totalTrophies, 3000);
  assert.equal(stats.avgTrophies, 1500);
  assert.equal(stats.avgDonations, 20);
  assert.equal(stats.topDonor.name, 'b');
  assert.equal(computeStats([]).avgTrophies, 0);
});

test('findInactiveMembers repère les membres sans dons', () => {
  const members = [
    member('actif', 3000, 800, 300),
    member('actif2', 3000, 900, 300),
    member('fantome', 2900, 0, 0),
    member('radin', 1000, 10, 500),
    member('fort', 5000, 10, 500), // peu de dons mais trophées au-dessus de la moyenne
  ];
  assert.deepEqual(findInactiveMembers(members).map((m) => m.name), ['fantome', 'radin']);
});

test('findInactiveMembers ne signale personne en début de saison', () => {
  assert.deepEqual(findInactiveMembers([member('a', 1000, 0), member('b', 2000, 0)]), []);
});

test('formatDuration affiche heures et minutes', () => {
  assert.equal(formatDuration(5 * 3_600_000 + 12 * 60_000), '5 h 12');
  assert.equal(formatDuration(34 * 60_000), '34 min');
  assert.equal(formatDuration(-90 * 60_000), '1 h 30');
});
