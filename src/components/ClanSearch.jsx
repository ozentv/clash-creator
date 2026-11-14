import { useEffect, useRef, useState } from 'react';
import { Search, Shield, User } from 'lucide-react';
import { normalizeTag } from '../lib/tag.js';
import { searchClans } from '../api/clashApi.js';

function ResultRow({ clan, onPick }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(clan.tag)}
        className="row-hover flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left"
      >
        {clan.badgeUrl ? (
          <img src={clan.badgeUrl} alt="" className="size-9 shrink-0" />
        ) : (
          <Shield className="size-9 shrink-0 p-2 text-zinc-600" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-white">{clan.name}</span>
          <span className="block truncate font-mono text-[11px] text-zinc-500">
            {[
              clan.tag,
              clan.level && `Niv. ${clan.level}`,
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

// variant "hero" : grande barre de la page d'accueil ; "compact" : barre de l'en-tête.
export default function ClanSearch({ onSearch, onPlayer, loading, currentTag, variant = 'hero', hotkey = false }) {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState('clan'); // clan | player
  const [message, setMessage] = useState(null);
  const [results, setResults] = useState(null); // null = liste fermée
  const [searching, setSearching] = useState(false);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const hero = variant === 'hero';

  // Un clan vient d'être ouvert : on referme la liste et on vide le champ.
  useEffect(() => {
    setResults(null);
    setMessage(null);
    if (currentTag) setValue('');
  }, [currentTag]);

  // Touche « / » pour chercher, Échap ou clic extérieur pour fermer la liste.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setResults(null);
        setMessage(null);
      }
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '');
      if (hotkey && e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    function onClick(e) {
      if (!rootRef.current?.contains(e.target)) {
        setResults(null);
        setMessage(null);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onClick);
    };
  }, [hotkey]);

  async function handleSubmit(e) {
    e.preventDefault();
    const input = value.trim();
    setMessage(null);
    setResults(null);

    // Le jeu ne permet de retrouver un joueur que par son tag.
    if (mode === 'player') {
      const tag = normalizeTag(input);
      if (tag) {
        onPlayer(`#${tag}`);
        setValue('');
      } else {
        setMessage('Tag de joueur invalide. Il se trouve sous le pseudo, sur le profil du joueur en jeu.');
      }
      return;
    }

    if (input.startsWith('#')) {
      const tag = normalizeTag(input);
      if (tag) onSearch(tag);
      else setMessage('Tag invalide : un tag ne contient que les caractères 0289PYLQGRJCUV.');
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
  const inputId = `clan-search-${variant}`;
  const player = mode === 'player';
  const Icon = player ? User : Search;

  function switchMode(next) {
    setMode(next);
    setMessage(null);
    setResults(null);
    inputRef.current?.focus();
  }

  const bar = (
    <div
      className={`flex items-center gap-2 rounded-[0.9rem] bg-ink-950 ${
        hero ? 'p-2 pl-5' : 'border border-white/10 p-1 pl-3 focus-within:border-accent-400/60'
      }`}
    >
      {hero ? (
        <Icon className="size-5 shrink-0 text-accent-400" aria-hidden="true" />
      ) : (
        <button
          type="button"
          onClick={() => switchMode(player ? 'clan' : 'player')}
          aria-label={`Recherche de ${player ? 'joueur' : 'clan'}. Passer à la recherche de ${player ? 'clan' : 'joueur'}`}
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1 text-xs font-medium text-accent-400 hover:bg-white/10"
        >
          <Icon className="size-3.5" aria-hidden="true" />
          {player ? 'Joueur' : 'Clan'}
        </button>
      )}
      <input
        ref={inputRef}
        id={inputId}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={player ? '#TAG du joueur' : hero ? 'Nom du clan ou #TAG' : 'Nom ou #TAG…'}
        autoComplete="off"
        spellCheck={false}
        aria-describedby={message ? `${inputId}-message` : undefined}
        className={`min-w-0 flex-1 bg-transparent text-white placeholder:text-zinc-600 focus:outline-none ${
          hero ? 'py-2.5 text-lg' : 'py-1.5 text-sm'
        }`}
      />
      {hero && !value && (
        <kbd className="hidden rounded border border-white/15 px-1.5 font-mono text-xs text-zinc-500 sm:block">
          /
        </kbd>
      )}
      <button
        type="submit"
        className={`btn btn-primary shrink-0 ${hero ? 'px-5 py-2.5 text-base' : 'px-3 py-1.5'}`}
        disabled={busy}
      >
        {busy ? 'Recherche…' : hero ? (player ? 'Voir le joueur' : 'Analyser') : 'OK'}
      </button>
    </div>
  );

  return (
    <div ref={rootRef} className={`relative w-full min-w-0 text-left ${hero ? 'mx-auto max-w-2xl' : 'max-w-md'}`}>
      {hero && (
        <div role="group" aria-label="Type de recherche" className="mb-3 flex justify-center gap-2">
          {[
            ['clan', 'Clan', Search],
            ['player', 'Joueur', User],
          ].map(([key, label, ModeIcon]) => (
            <button
              key={key}
              type="button"
              className="btn btn-quiet px-3 py-1.5"
              aria-pressed={mode === key}
              onClick={() => switchMode(key)}
            >
              <ModeIcon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor={inputId} className="sr-only">
          {player ? 'Tag du joueur' : 'Nom ou tag du clan'}
        </label>
        {hero ? <div className="glow-frame">{bar}</div> : bar}
      </form>

      {(message || results) && (
        <div className="rise absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-white/15 bg-ink-900 shadow-2xl shadow-black">
          {message && (
            <p id={`${inputId}-message`} role="alert" className="px-4 py-3 text-sm text-red-300">
              {message}
            </p>
          )}
          {results &&
            (results.length === 0 && !asTag ? (
              <p className="px-4 py-3 text-sm text-zinc-400">Aucun clan trouvé pour ce nom.</p>
            ) : (
              <ul className="max-h-80 divide-y divide-white/5 overflow-y-auto">
                {asTag && (
                  <li>
                    <button
                      type="button"
                      onClick={() => onSearch(asTag)}
                      className="row-hover w-full cursor-pointer px-4 py-2.5 text-left text-sm text-accent-400"
                    >
                      Ouvrir le clan avec le tag #{asTag}
                    </button>
                  </li>
                )}
                {results.map((clan) => (
                  <ResultRow key={clan.tag} clan={clan} onPick={(tag) => onSearch(normalizeTag(tag))} />
                ))}
              </ul>
            ))}
        </div>
      )}
    </div>
  );
}
