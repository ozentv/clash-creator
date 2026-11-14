import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cleanEntry, safeLink, validateLibrary } from '../src/lib/libraryRules.js';

const read = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url)));

test('compositions.json est valide', () => {
  assert.deepEqual(validateLibrary(read('compositions.json'), 'composition'), []);
});

test('bases.json est valide', () => {
  assert.deepEqual(validateLibrary(read('bases.json'), 'base'), []);
});

test('safeLink refuse tout lien hors du domaine du jeu', () => {
  assert.equal(safeLink('https://link.clashofclans.com/fr?action=CopyArmy&army=u1x0'), 'https://link.clashofclans.com/fr?action=CopyArmy&army=u1x0');
  assert.equal(safeLink('https://exemple.com/'), null);
  assert.equal(safeLink('javascript:alert(1)'), null);
  assert.equal(safeLink(''), null);
});

test('validateLibrary signale les erreurs de saisie', () => {
  const problems = validateLibrary(
    [
      { id: 'a', nom: 'A', hdv: 12, troupes: [{ nom: 'Dragon', nombre: 8 }] },
      { id: 'a', nom: '', hdv: 0, troupes: [], lien: 'https://exemple.com' },
    ],
    'composition',
  );
  assert.equal(problems.length, 5); // id en double, nom, hdv, lien, troupes
  assert.deepEqual(validateLibrary([{ id: 'b', nom: 'B', hdv: 15, type: 'Autre' }], 'base').length, 1);
});

test('cleanEntry nettoie une composition saisie dans le formulaire', () => {
  const { entry, problems } = cleanEntry(
    'composition',
    {
      nom: '  Électro-dragons  ',
      hdv: '12',
      troupes: [{ nom: 'Electro Dragon', nombre: '8' }, { nom: '', nombre: 3 }],
      sorts: [],
      lien: 'https://link.clashofclans.com/fr?action=CopyArmy&army=u8x59',
      inconnu: 'ignoré',
    },
    'abcd',
  );
  assert.deepEqual(problems, []);
  assert.equal(entry.id, 'electro-dragons-hdv12-abcd');
  assert.equal(entry.hdv, 12);
  assert.deepEqual(entry.troupes, [{ nom: 'Electro Dragon', nombre: 8 }]);
  assert.equal('inconnu' in entry, false);
});

test('cleanEntry refuse une fiche incomplète ou un lien étranger', () => {
  assert.ok(cleanEntry('composition', { nom: 'X', hdv: 12, troupes: [] }).problems.length > 0);
  assert.ok(cleanEntry('composition', { nom: 'X', hdv: 12, troupes: [{ nom: 'Dragon', nombre: 0 }] }).problems.length > 0);
  assert.ok(cleanEntry('base', { nom: 'B', hdv: 15, type: 'Guerre' }).problems.includes('le lien de la base est obligatoire'));
  assert.ok(cleanEntry('base', { nom: 'B', hdv: 15, type: 'Guerre', lien: 'https://exemple.com' }).problems.length > 0);
  assert.deepEqual(
    cleanEntry('base', { nom: 'B', hdv: 15, type: 'Guerre', lien: 'https://link.clashofclans.com/fr?action=OpenLayout&id=x' }).problems,
    [],
  );
});

test('une composition peut se limiter à un nom et au lien du jeu', () => {
  const lien = 'https://link.clashofclans.com/fr?action=CopyArmy&army=u8x59';
  assert.deepEqual(cleanEntry('composition', { nom: 'Rapide', hdv: 14, lien }).problems, []);
  assert.deepEqual(cleanEntry('composition', { nom: 'Rapide', hdv: 14 }).problems, ['ajoute des troupes ou le lien du jeu']);
});
