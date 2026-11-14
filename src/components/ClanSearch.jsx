import { useEffect, useState } from 'react';
import { History, Search, Shield, X } from 'lucide-react';
import { normalizeTag } from '../lib/tag.js';
import { searchClans } from '../api/clashApi.js';

function ResultRow({ clan, onPick }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(clan.tag)}
        className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left hover:bg-white/5"
      >
        {clan.badgeUrl ? (
          <img src={clan.badgeUrl} alt="" className="size-8 shrink-0" />
        ) : (
          <Shield className="size-8 shrink-0 p-1.5 text-zinc-500" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-white">{clan.name}</span>
          <span className="block truncate text-xs text-zinc-500">
            {[
              clan.tag,
              clan.level && `Niveau ${clan.level}`,
              clan.memberCount != null && `${clan.memberCount}/50`,
              clan.location,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </span>
      </button>
    </li>
  );
}

export default function ClanSearch({ onSearch, loading, recent, onForget, currentTag }) {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState(null);
  const [results, setResults] = useState(null); // null = pas de recherche par nom affichée
  const [searching, setSearching] = useState(false);

  // Un clan vient d'être ouvert : on referme la liste de résultats.
  useEffect(() => {
    setResults(null);
    setMessage(null);
  }, [currentTag]);

  async function handleSubmit(e) {
    e.preventDefault();
    const input = value.trim();
    setMessage(null);
    setResults(null);

    if (input.startsWith('#')) {
      const tag = normalizeTag(input);
      if (tag) onSearch(tag);
      else setMessage('Tag invalide. Un tag ne contient que les caractères 0289PYLQGRJCUV.');
      return;
    }
    if (input.length < 3) {
      setMessage('Entre un tag (avec #) ou au moins 3 lettres du nom du clan.');
      return;
    }
    setSearching(true);
    try {
      setResults(await searchClans(input));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSearching(false);
    }
  }

  // Un texte sans # peut aussi être un tag : on propose de l'ouvrir directement.
  const asTag = results && normalizeTag(value);
  const busy = loading || searching;

  return (
    <div className="mx-auto w-full max-w-xl text-left">
      <form onSubmit={handleSubmit}>
        <label htmlFor="clan-search" className="sr-only">
          Nom ou tag du clan
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-ink-950/90 p-1.5 pl-4 backdrop-blur focus-within:border-accent-400/70">
          <Search className="size-5 shrink-0 text-accent-400" aria-hidden="true" />
          <input
            id="clan-search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nom du clan ou #TAG"
            autoComplete="off"
            spellCheck={false}
            aria-describedby={message ? 'clan-search-message' : undefined}
            className="min-w-0 flex-1 bg-transparent py-2 text-base text-white placeholder:text-zinc-500 focus:outline-none"
          />
          <button type="submit" className="btn btn-primary shrink-0" disabled={busy}>
            {busy ? 'Chargement…' : 'Rechercher'}
          </button>
        </div>
      </form>

      {message && (
        <p id="clan-search-message" role="alert" className="mt-2 rounded-lg bg-ink-950/85 px-3 py-1.5 text-sm text-red-300">
          {message}
        </p>
      )}

      {results && (
        <div className="mt-2 overflow-hidden rounded-xl border border-white/15 bg-ink-950/95">
          {results.length === 0 && !asTag ? (
            <p className="px-3 py-3 text-sm text-zinc-400">Aucun clan trouvé pour ce nom.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-white/5 overflow-y-auto">
              {asTag && (
                <li>
                  <button
                    type="button"
                    onClick={() => onSearch(asTag)}
                    className="w-full cursor-pointer px-3 py-2 text-left text-sm text-accent-400 hover:bg-white/5"
                  >
                    Ouvrir le clan avec le tag #{asTag}
                  </button>
                </li>
              )}
              {results.map((clan) => (
                <ResultRow key={clan.tag} clan={clan} onPick={(tag) => onSearch(normalizeTag(tag))} />
              ))}
            </ul>
          )}
        </div>
      )}

      {recent.length > 0 && !results && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="flex items-center gap-1 text-xs text-zinc-300">
            <History className="size-3.5" aria-hidden="true" />
            Récents
          </span>
          {recent.map((clan) => (
            <span
              key={clan.tag}
              className={`flex items-center rounded-md border bg-ink-950/80 text-sm ${
                clan.tag === currentTag ? 'border-accent-400/60 text-accent-400' : 'border-white/15 text-zinc-200'
              }`}
            >
              <button
                type="button"
                onClick={() => onSearch(normalizeTag(clan.tag))}
                className="max-w-40 cursor-pointer truncate py-1 pr-1 pl-2.5 hover:text-white"
              >
                {clan.name}
              </button>
              <button
                type="button"
                onClick={() => onForget(clan.tag)}
                aria-label={`Retirer ${clan.name} des clans récents`}
                className="cursor-pointer py-1 pr-1.5 pl-0.5 text-zinc-500 hover:text-white"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
