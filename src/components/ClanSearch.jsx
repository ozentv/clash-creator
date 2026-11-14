import { useState } from 'react';
import { Search } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl">
      <label htmlFor="clan-tag" className="sr-only">
        Tag du clan
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-ink-950/90 p-1.5 pl-4 backdrop-blur focus-within:border-accent-400/70">
        <Search className="size-5 shrink-0 text-accent-400" aria-hidden="true" />
        <input
          id="clan-tag"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tag du clan, ex. #2PP0JCCL"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={invalid}
          aria-describedby={invalid ? 'clan-tag-error' : undefined}
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-white uppercase placeholder:text-zinc-500 placeholder:normal-case focus:outline-none"
        />
        <button type="submit" className="btn btn-primary shrink-0" disabled={loading}>
          {loading ? 'Chargement…' : 'Analyser'}
        </button>
      </div>
      {invalid && (
        <p id="clan-tag-error" className="mt-2 rounded-lg bg-ink-950/80 px-3 py-1.5 text-sm text-red-300">
          Tag invalide. Un tag ne contient que les caractères 0289PYLQGRJCUV (ex. #2PP0JCCL).
        </p>
      )}
    </form>
  );
}
