import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { safeLink, validateLibrary } from '../src/lib/library.js';

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
