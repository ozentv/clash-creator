import { useState } from 'react';
import { normalizeTag } from '../lib/tag.js';

export default function ClanSearch({ onSearch, loading }) {
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const tag = normalizeTag(value);
    setInvalid(!tag);
    if (tag) onSearch(tag);
  }

  return (
    <form onSubmit={handleSubmit} className="panel mx-auto w-full max-w-xl p-4">
      <label htmlFor="clan-tag" className="mb-2 block font-display text-lg text-gold-300">
        Tag du clan
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="clan-tag"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#2PP0JCCL"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={invalid}
          aria-describedby={invalid ? 'clan-tag-error' : undefined}
          className="min-w-0 flex-1 rounded-xl border-2 border-night-700 bg-night-950 px-4 py-2.5 font-mono text-lg uppercase tracking-wider text-white placeholder:normal-case placeholder:text-slate-600 focus:border-gold-400 focus:outline-none"
        />
        <button type="submit" className="btn btn-green px-6 py-2.5 text-lg" disabled={loading}>
          {loading ? 'Chargement…' : '⚔️ Analyser'}
        </button>
      </div>
      {invalid && (
        <p id="clan-tag-error" className="mt-2 text-sm text-red-300">
          Tag invalide. Un tag ne contient que les caractères 0289PYLQGRJCUV (ex. #2PP0JCCL).
        </p>
      )}
    </form>
  );
}
