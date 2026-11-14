import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { BASE_TYPES } from '../lib/libraryRules.js';
import { SIEGE_CHOICES, SPELL_CHOICES, TROOP_CHOICES, toApiName, unitName } from '../lib/names.js';

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-zinc-400">
    {children}
  </label>
);

// Lignes « unité + quantité », avec suggestions de noms en français.
function UnitRows({ legend, rows, onChange, choices, listId }) {
  const update = (index, patch) => onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  return (
    <fieldset>
      <legend className="mb-1 text-xs font-medium text-zinc-400">{legend}</legend>
      <datalist id={listId}>
        {choices.map((name) => (
          <option key={name} value={unitName(name)} />
        ))}
      </datalist>
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              list={listId}
              value={row.nom}
              onChange={(e) => update(i, { nom: e.target.value })}
              placeholder="Nom"
              aria-label={`${legend} : nom, ligne ${i + 1}`}
              className="field min-w-0 flex-1 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="1"
              max="300"
              value={row.nombre}
              onChange={(e) => update(i, { nombre: e.target.value })}
              placeholder="Qté"
              aria-label={`${legend} : quantité, ligne ${i + 1}`}
              className="field w-20 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              aria-label={`Retirer la ligne ${i + 1}`}
              className="btn btn-quiet px-2.5"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-quiet mt-2 px-3 py-1.5" onClick={() => onChange([...rows, { nom: '', nombre: '' }])}>
        <Plus className="size-4" aria-hidden="true" />
        Ajouter une ligne
      </button>
    </fieldset>
  );
}

const toUnits = (rows) =>
  rows.filter((r) => r.nom.trim()).map((r) => ({ nom: toApiName(r.nom), nombre: Number.parseInt(r.nombre, 10) }));

export default function LibraryForm({ kind, onSubmit, onCancel }) {
  const composition = kind === 'compositions';
  const [fields, setFields] = useState({ nom: '', hdv: '', style: '', type: BASE_TYPES[0], engin: '', note: '', lien: '' });
  const [troops, setTroops] = useState([{ nom: '', nombre: '' }]);
  const [spells, setSpells] = useState([{ nom: '', nombre: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(
        composition
          ? { ...fields, engin: fields.engin && toApiName(fields.engin), troupes: toUnits(troops), sorts: toUnits(spells) }
          : fields,
      );
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card rise flex flex-col gap-4 p-5">
      <h2 className="font-display text-2xl text-white">
        {composition ? 'Nouvelle composition' : 'Nouvelle base'}
      </h2>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Label htmlFor="lib-nom">Nom</Label>
          <input id="lib-nom" required maxLength={60} value={fields.nom} onChange={set('nom')} className="field w-full px-3 py-2 text-sm" />
        </div>
        <div>
          <Label htmlFor="lib-hdv">Hôtel de ville</Label>
          <input id="lib-hdv" type="number" required min="1" max="30" value={fields.hdv} onChange={set('hdv')} className="field w-full px-3 py-2 text-sm" />
        </div>
        {composition ? (
          <div>
            <Label htmlFor="lib-style">Style (facultatif)</Label>
            <input id="lib-style" maxLength={30} value={fields.style} onChange={set('style')} placeholder="Aérien, terrestre…" className="field w-full px-3 py-2 text-sm" />
          </div>
        ) : (
          <div>
            <Label htmlFor="lib-type">Type</Label>
            <select id="lib-type" value={fields.type} onChange={set('type')} className="field w-full px-3 py-2 text-sm">
              {BASE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {composition && (
        <div className="grid gap-4 lg:grid-cols-2">
          <UnitRows legend="Troupes (facultatif si le lien est rempli)" rows={troops} onChange={setTroops} choices={TROOP_CHOICES} listId="lib-troops" />
          <UnitRows legend="Sorts (facultatif)" rows={spells} onChange={setSpells} choices={SPELL_CHOICES} listId="lib-spells" />
          <div>
            <Label htmlFor="lib-engin">Engin de siège (facultatif)</Label>
            <datalist id="lib-sieges">
              {SIEGE_CHOICES.map((name) => (
                <option key={name} value={unitName(name)} />
              ))}
            </datalist>
            <input id="lib-engin" list="lib-sieges" maxLength={40} value={fields.engin} onChange={set('engin')} className="field w-full px-3 py-2 text-sm" />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="lib-lien">
          Lien de partage du jeu{composition ? ' (facultatif si les troupes sont remplies)' : ''}
        </Label>
        <input
          id="lib-lien"
          type="url"
          required={!composition}
          maxLength={600}
          value={fields.lien}
          onChange={set('lien')}
          placeholder="https://link.clashofclans.com/…"
          className="field w-full px-3 py-2 font-mono text-xs"
        />
      </div>
      <div>
        <Label htmlFor="lib-note">Note (facultatif)</Label>
        <textarea id="lib-note" rows={3} maxLength={600} value={fields.note} onChange={set('note')} className="field w-full px-3 py-2 text-sm" />
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-200">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button type="button" className="btn btn-quiet" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}
