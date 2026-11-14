import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCountdown, upcomingEvents } from '../src/lib/events.js';
import { decodePlan, encodePlan, reviewPlan } from '../src/lib/warPlan.js';
import { assessMember, remainingUpgrades, whoCanPlay } from '../src/lib/army.js';
import { summarize, toSnapshot } from '../server/historyStore.js';
import { toRankingDto, toRosterEntry } from '../server/cocClient.js';

const at = (iso) => Date.parse(iso);
const event = (now, key) => upcomingEvents(at(now)).find((e) => e.key === key);
const iso = (ms) => new Date(ms).toISOString();

test('week-end de raid : du vendredi 7 h au lundi 7 h UTC', () => {
  // mercredi 11 nov. 2026
  assert.deepEqual([event('2026-11-11T12:00:00Z', 'raid').active, iso(event('2026-11-11T12:00:00Z', 'raid').at)], [false, '2026-11-13T07:00:00.000Z']);
  // samedi : en cours, fin lundi
  assert.deepEqual([event('2026-11-14T12:00:00Z', 'raid').active, iso(event('2026-11-14T12:00:00Z', 'raid').at)], [true, '2026-11-16T07:00:00.000Z']);
  // vendredi avant 7 h : pas encore commencé
  assert.equal(event('2026-11-13T06:00:00Z', 'raid').active, false);
  // lundi après 7 h : prochain vendredi
  assert.equal(iso(event('2026-11-16T08:00:00Z', 'raid').at), '2026-11-20T07:00:00.000Z');
});

test('jeux de clan et ligue de clans suivent le calendrier mensuel', () => {
  assert.deepEqual([event('2026-11-14T00:00:00Z', 'games').active, iso(event('2026-11-14T00:00:00Z', 'games').at)], [false, '2026-11-22T08:00:00.000Z']);
  assert.equal(event('2026-11-25T00:00:00Z', 'games').active, true);
  assert.equal(iso(event('2026-11-29T00:00:00Z', 'games').at), '2026-12-22T08:00:00.000Z');
  assert.equal(event('2026-11-05T00:00:00Z', 'league').active, true);
  assert.equal(iso(event('2026-11-14T00:00:00Z', 'league').at), '2026-12-01T08:00:00.000Z');
  assert.equal(iso(event('2026-12-20T00:00:00Z', 'league').at), '2027-01-01T08:00:00.000Z'); // passage d'année
});

test('fin de saison : dernier lundi du mois à 5 h UTC', () => {
  assert.equal(iso(event('2026-11-14T00:00:00Z', 'season').at), '2026-11-30T05:00:00.000Z');
  assert.equal(iso(event('2026-11-30T06:00:00Z', 'season').at), '2026-12-28T05:00:00.000Z');
});

test('formatCountdown', () => {
  assert.equal(formatCountdown(3 * 86_400_000 + 7 * 3_600_000), '3 j 07 h');
  assert.equal(formatCountdown(5 * 3_600_000 + 12 * 60_000), '5 h 12');
  assert.equal(formatCountdown(34 * 60_000), '34 min');
  assert.equal(formatCountdown(-5), '0 min');
});

test('le plan de guerre se code dans une adresse et se relit', () => {
  const plan = { 2: [1], 1: [3, 4], 5: [] };
  assert.equal(encodePlan(plan), '1-3.4_2-1');
  assert.deepEqual(decodePlan('1-3.4_2-1'), { 1: [3, 4], 2: [1] });
  assert.deepEqual(decodePlan('1-3.4.5_abc_99-1_2-0_<script>'), { 1: [3, 4] }); // trois cibles, positions invalides, texte étranger
  assert.deepEqual(decodePlan(null), {});
});

test('reviewPlan repère les doublons et les bases non couvertes', () => {
  assert.deepEqual(reviewPlan({ 1: [1, 2], 2: [2], 3: [4] }, 5), { assigned: 4, doubled: [2], uncovered: [3, 5] });
});

const composition = { hdv: 12, troupes: [{ nom: 'Dragon', nombre: 8 }], sorts: [{ nom: 'Rage Spell', nombre: 3 }], engin: 'Battle Blimp' };
const lv = (level, maxLevel) => ({ level, maxLevel });

test('assessMember : hôtel de ville et unités débloquées', () => {
  const ready = { name: 'a', townHallLevel: 13, levels: { Dragon: lv(8, 10), 'Rage Spell': lv(6, 6), 'Battle Blimp': lv(2, 4) } };
  assert.deepEqual(assessMember(composition, ready), { eligible: true, hallOk: true, missing: [], readiness: 77 });
  const lowHall = { ...ready, townHallLevel: 11 };
  assert.equal(assessMember(composition, lowHall).eligible, false);
  const noSiege = { name: 'b', townHallLevel: 14, levels: { Dragon: lv(10, 10), 'Rage Spell': lv(6, 6) } };
  assert.deepEqual(assessMember(composition, noSiege).missing, ['Battle Blimp']);
  assert.deepEqual(whoCanPlay(composition, [noSiege, ready]).map((m) => m.name), ['a']);
  // une composition sans liste de troupes ne peut pas être évaluée
  assert.equal(assessMember({ hdv: 10 }, ready).eligible, false);
});

test('remainingUpgrades classe les unités par écart au niveau maximum', () => {
  const result = remainingUpgrades({
    heroes: [{ name: 'Archer Queen', level: 80, maxLevel: 100 }, { name: 'Barbarian King', level: 100, maxLevel: 100 }],
    troops: [{ name: 'Dragon', level: 9, maxLevel: 12 }, { name: 'Golem', level: 5, maxLevel: 14 }],
    spells: [],
  });
  assert.deepEqual(result.groups.map((g) => g.key), ['heroes', 'troops']);
  assert.deepEqual(result.groups[1].units.map((u) => [u.name, u.gap]), [['Golem', 9], ['Dragon', 3]]);
  assert.deepEqual([result.levels, result.units], [32, 3]);
});

test("l'historique résume les relevés et détecte arrivées et départs", () => {
  const member = (tag) => ({ tag, name: tag, trophies: 100, donations: 5, townHallLevel: 10, expLevel: 50 });
  const snap = (...tags) => toSnapshot({ name: 'C', level: 1, points: 2, warWins: 3, members: tags.map(member) });
  assert.equal(snap('#A', '#B').totalTrophies, 200);
  const { days, movements } = summarize([
    { day: '2026-11-01', data: snap('#A', '#B') },
    { day: '2026-11-02', data: snap('#A', '#B') },
    { day: '2026-11-03', data: snap('#B', '#C') },
  ]);
  assert.deepEqual(days.map((d) => d.memberCount), [2, 2, 2]);
  assert.deepEqual(movements, [{ day: '2026-11-03', joined: [{ tag: '#C', name: '#C' }], left: [{ tag: '#A', name: '#A' }] }]);
});

test('classements et effectif : conversion des réponses', () => {
  assert.deepEqual(toRankingDto({ items: [{ rank: 1, previousRank: 3, tag: '#C', name: 'Clan', clanLevel: 20, members: 50, clanPoints: 60000 }] }, 'clans')[0].points, 60000);
  assert.equal(toRankingDto({ items: [{ rank: 1, tag: '#P', name: 'P', trophies: 6000, clan: { name: 'Clan', tag: '#C' } }] }, 'players')[0].clanName, 'Clan');
  const entry = toRosterEntry({ tag: '#P', name: 'P', townHallLevel: 13, troops: [{ name: 'Dragon', level: 8, maxLevel: 12, village: 'home' }, { name: 'Bomber', level: 3, maxLevel: 20, village: 'builderBase' }] });
  assert.deepEqual(entry.levels, { Dragon: { level: 8, maxLevel: 12 } });
});
