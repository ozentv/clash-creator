import { useCallback, useState } from 'react';
import { BookOpen, Copy, ExternalLink, LayoutGrid, Lock, LockOpen, Plus, Swords, Trash2, Users } from 'lucide-react';
import { addLibraryEntry, adminLogin, deleteLibraryEntry, getLibrary, getRoster } from '../api/clashApi.js';
import { compositionUnits, whoCanPlay } from '../lib/army.js';
import { useAsync } from '../hooks/useAsync.js';
import { safeLink } from '../lib/libraryRules.js';
import { copyText, toast } from '../lib/toast.js';
import LibraryForm from './LibraryForm.jsx';
import { baseImageUrl } from '../lib/baseImages.js';
import { unitName } from '../lib/names.js';
import UnitIcon from './UnitIcon.jsx';

function LinkButtons({ link, openLabel }) {
  const url = safeLink(link);
  if (!url) {
    return <p className="text-xs text-zinc-600">Lien du jeu pas encore ajouté.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
        <ExternalLink className="size-4" aria-hidden="true" />
        {openLabel}
      </a>
      <button type="button" className="btn btn-quiet" onClick={() => copyText(url)}>
        <Copy className="size-4" aria-hidden="true" />
        Copier le lien
      </button>
    </div>
  );
}

function Units({ title, units, category }) {
  if (!units?.length) return null;
  return (
    <div>
      <p className="eyebrow mb-2">{title}</p>
      <ul className="flex flex-wrap gap-2">
        {units.map((u) => (
          <li key={u.nom} className="flex items-center gap-2 rounded-lg border border-white/[0.08] py-1 pr-2.5 pl-1 text-sm text-zinc-200">
            <UnitIcon name={u.nom} category={category} />
            <span>{unitName(u.nom)}</span>
            {u.nombre != null && <span className="font-semibold text-accent-400 tabular-nums">×{u.nombre}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExampleBadge() {
  return (
    <span className="rounded-md border border-dashed border-zinc-600 px-2 py-0.5 text-[11px] text-zinc-400">
      Exemple à remplacer
    </span>
  );
}

// Bouton de suppression en deux temps, visible en mode gestion sur les fiches ajoutées depuis le site.
function DeleteButton({ onDelete }) {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState(null);
  async function handle() {
    if (!armed) return setArmed(true);
    try {
      await onDelete();
    } catch (err) {
      setError(err.message);
      setArmed(false);
    }
  }
  return (
    <div className="mt-3">
      <button type="button" onClick={handle} onBlur={() => setArmed(false)} className="btn btn-quiet px-3 py-1.5 text-red-300 hover:text-red-200">
        <Trash2 className="size-4" aria-hidden="true" />
        {armed ? 'Confirmer la suppression' : 'Supprimer'}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

// « Qui peut la jouer ? » : membres du clan ouvert qui ont l'hôtel de ville requis et toutes
// les unités de la composition débloquées. L'effectif est chargé au premier clic.
function WhoCanPlay({ item, clan, roster, onLoad }) {
  if (compositionUnits(item).length === 0) {
    return <p className="text-xs text-zinc-600">Ajoute la liste des troupes pour savoir qui peut la jouer.</p>;
  }
  if (roster.status === 'idle') {
    return (
      <button type="button" className="btn btn-quiet self-start px-3 py-1.5" onClick={onLoad}>
        <Users className="size-4" aria-hidden="true" />
        Qui peut la jouer dans {clan.name} ?
      </button>
    );
  }
  if (roster.status === 'loading') {
    return (
      <p role="status" className="text-xs text-zinc-400">
        Lecture des niveaux de chaque membre…
      </p>
    );
  }
  if (roster.status === 'error') {
    return (
      <p role="alert" className="text-xs text-red-300">
        {roster.error}
      </p>
    );
  }
  const players = whoCanPlay(item, roster.data);
  return (
    <div>
      <p className="eyebrow mb-2">
        Peuvent la jouer dans {clan.name} · {players.length} / {roster.data.length}
      </p>
      {players.length === 0 ? (
        <p className="text-sm text-zinc-400">Aucun membre n'a l'hôtel de ville et toutes les unités nécessaires.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {players.map((p) => (
            <li key={p.tag} className="rounded-md border border-white/[0.08] px-2 py-0.5 text-xs text-zinc-200">
              {p.name} <span className="text-zinc-500 tabular-nums">{p.readiness} %</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-zinc-600">
        Le pourcentage est le niveau moyen des unités de la composition, par rapport au maximum du jeu.
      </p>
    </div>
  );
}

function CompositionCard({ item, onDelete, clan, roster, onLoadRoster }) {
  return (
    <article className="card flex flex-col gap-4 p-5">
      <header>
        <p className="flex flex-wrap items-center gap-2">
          <span className="tag-chip">HDV {item.hdv}</span>
          {item.style && <span className="tag-chip">{item.style}</span>}
          {item.exemple && <ExampleBadge />}
        </p>
        <h3 className="mt-2 font-display text-2xl text-white">{item.nom}</h3>
      </header>
      <Units title="Troupes" units={item.troupes} category="troop" />
      <Units title="Sorts" units={item.sorts} category="spell" />
      {item.engin && <Units title="Engin de siège" units={[{ nom: item.engin }]} category="siege" />}
      {item.note && <p className="text-sm leading-relaxed text-zinc-400">{item.note}</p>}
      {clan && <WhoCanPlay item={item} clan={clan} roster={roster} onLoad={onLoadRoster} />}
      <div className="mt-auto pt-1">
        <LinkButtons link={item.lien} openLabel="Copier l'armée dans le jeu" />
        {onDelete && <DeleteButton onDelete={onDelete} />}
      </div>
    </article>
  );
}

function BaseCard({ item, onDelete }) {
  const image = baseImageUrl(item.image);
  return (
    <article className="card flex flex-col overflow-hidden">
      {image ? (
        <img src={image} alt={`Plan de la base ${item.nom}`} loading="lazy" className="aspect-video w-full object-cover" />
      ) : (
        <div className="grid aspect-video w-full place-items-center bg-white/[0.02] text-zinc-700">
          <LayoutGrid className="size-10" aria-hidden="true" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="flex flex-wrap items-center gap-2">
          <span className="tag-chip">HDV {item.hdv}</span>
          <span className="tag-chip">{item.type}</span>
          {item.exemple && <ExampleBadge />}
        </p>
        <h3 className="font-display text-2xl text-white">{item.nom}</h3>
        {item.note && <p className="text-sm leading-relaxed text-zinc-400">{item.note}</p>}
        <div className="mt-auto pt-1">
          <LinkButtons link={item.lien} openLabel="Ouvrir la base dans le jeu" />
          {onDelete && <DeleteButton onDelete={onDelete} />}
        </div>
      </div>
    </article>
  );
}

const KINDS = {
  compositions: {
    icon: Swords,
    title: 'Compositions',
    intro: 'Des armées prêtes à copier dans le jeu, classées par hôtel de ville.',
    Card: CompositionCard,
    empty: 'Aucune composition pour le moment.',
    add: 'Ajouter une composition',
    columns: 'lg:grid-cols-2',
  },
  bases: {
    icon: LayoutGrid,
    title: 'Bases',
    intro: 'Des plans de village à ouvrir dans le jeu, classés par hôtel de ville.',
    Card: BaseCard,
    empty: 'Aucune base pour le moment.',
    add: 'Ajouter une base',
    columns: 'sm:grid-cols-2 lg:grid-cols-3',
  },
};

const SESSION_KEY = 'clash-creator:admin';
function storedPassword() {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

// Mode gestion : le mot de passe est vérifié par le serveur à chaque ajout ou suppression.
function AdminBar({ password, onUnlock, onLock, onAdd, addLabel }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      await adminLogin(value);
      onUnlock(value);
      toast('Mode gestion activé');
      setOpen(false);
      setValue('');
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }

  if (password) {
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={onAdd}>
          <Plus className="size-4" aria-hidden="true" />
          {addLabel}
        </button>
        <button type="button" className="btn btn-quiet" onClick={onLock}>
          <LockOpen className="size-4" aria-hidden="true" />
          Quitter la gestion
        </button>
      </div>
    );
  }
  if (!open) {
    return (
      <button type="button" className="btn btn-quiet self-start" onClick={() => setOpen(true)}>
        <Lock className="size-4" aria-hidden="true" />
        Gérer
      </button>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-2">
      <div>
        <label htmlFor="admin-password" className="sr-only">
          Mot de passe de gestion
        </label>
        <input
          id="admin-password"
          type="password"
          autoFocus
          required
          autoComplete="current-password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Mot de passe"
          className="field px-3 py-2 text-sm"
        />
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-300">
            {error}
          </p>
        )}
      </div>
      <button type="submit" className="btn btn-primary" disabled={checking}>
        {checking ? 'Vérification…' : 'Entrer'}
      </button>
      <button type="button" className="btn btn-quiet" onClick={() => setOpen(false)}>
        Annuler
      </button>
    </form>
  );
}

export default function Library({ kind, clan }) {
  const { icon: Icon, title, intro, Card, empty, add, columns } = KINDS[kind];
  const [version, setVersion] = useState(0); // incrémenté pour recharger après un ajout ou une suppression
  const load = useCallback(() => getLibrary(), []);
  const { status, data, error } = useAsync(load, version);
  const [hall, setHall] = useState(null); // null = tous les hôtels de ville
  const [password, setPassword] = useState(storedPassword);
  const [adding, setAdding] = useState(false);
  const [rosterTag, setRosterTag] = useState(null); // défini au premier clic sur « Qui peut la jouer ? »
  const roster = useAsync(getRoster, rosterTag);

  const items = data?.[kind] ?? [];
  const halls = [...new Set(items.map((i) => i.hdv))].sort((a, b) => b - a);
  const shown = hall ? items.filter((i) => i.hdv === hall) : items;

  function unlock(value) {
    setPassword(value);
    try {
      sessionStorage.setItem(SESSION_KEY, value);
    } catch {
      // Stockage indisponible : le mode gestion dure jusqu'au rechargement de la page.
    }
  }
  function lock() {
    setPassword(null);
    setAdding(false);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // rien à effacer
    }
  }
  async function submit(entry) {
    await addLibraryEntry(kind, entry, password);
    setAdding(false);
    setHall(null);
    setVersion((v) => v + 1);
    toast('Fiche enregistrée');
  }
  async function remove(id) {
    await deleteLibraryEntry(id, password);
    setVersion((v) => v + 1);
    toast('Fiche supprimée');
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <BookOpen className="size-3.5" aria-hidden="true" />
            Bibliothèque
          </p>
          <h1 className="mt-2 flex items-center gap-3 font-display text-4xl text-white sm:text-5xl">
            <Icon className="size-8 text-accent-400" aria-hidden="true" />
            {title}
          </h1>
          <p className="mt-2 text-zinc-400">{intro}</p>
          {kind === 'compositions' && !clan && (
            <p className="mt-1 text-xs text-zinc-600">
              Ouvre d'abord un clan pour voir quels membres peuvent jouer chaque composition.
            </p>
          )}
        </div>
        {data?.editable && (
          <AdminBar password={password} onUnlock={unlock} onLock={lock} onAdd={() => setAdding(true)} addLabel={add} />
        )}
      </header>

      {adding && password && <LibraryForm kind={kind} onSubmit={submit} onCancel={() => setAdding(false)} />}

      {data?.warning && (
        <p role="status" className="rounded-lg border border-accent-400/25 bg-accent-400/[0.06] px-4 py-2 text-sm text-accent-400">
          {data.warning}
        </p>
      )}

      {halls.length > 1 && (
        <div role="group" aria-label="Filtrer par hôtel de ville" className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-quiet px-3 py-1.5" aria-pressed={hall === null} onClick={() => setHall(null)}>
            Tous
          </button>
          {halls.map((h) => (
            <button key={h} type="button" className="btn btn-quiet px-3 py-1.5" aria-pressed={hall === h} onClick={() => setHall(h)}>
              HDV {h}
            </button>
          ))}
        </div>
      )}

      {status === 'loading' && !data && (
        <div role="status" aria-label="Chargement" className={`grid gap-4 ${columns}`}>
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      )}
      {status === 'error' && (
        <p role="alert" className="card p-6 text-center text-sm text-red-300">
          {error}
        </p>
      )}
      {status === 'success' &&
        (shown.length === 0 ? (
          <div className="card rise p-10 text-center">
            <Icon className="mx-auto size-10 text-zinc-700" aria-hidden="true" />
            <p className="mt-4 font-display text-xl text-white">{empty}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              {data.editable
                ? 'Clique sur « Gérer » pour ajouter la première fiche avec le lien de partage copié depuis le jeu.'
                : 'Les fiches s\'ajoutent dans le dossier src/data du dépôt, avec le lien de partage copié depuis le jeu.'}
            </p>
          </div>
        ) : (
          <div key={hall ?? 'tous'} className={`stagger grid gap-4 ${columns}`}>
            {shown.map((item) => (
              <Card
                key={item.id}
                item={item}
                onDelete={password && item.source === 'site' ? () => remove(item.id) : null}
                clan={clan}
                roster={roster}
                onLoadRoster={() => setRosterTag(clan.tag)}
              />
            ))}
          </div>
        ))}
    </main>
  );
}
