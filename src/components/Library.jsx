import { useState } from 'react';
import { BookOpen, Check, Copy, ExternalLink, LayoutGrid, Swords } from 'lucide-react';
import { bases, compositions, safeLink } from '../lib/library.js';
import { baseImageUrl } from '../lib/baseImages.js';
import { unitName } from '../lib/names.js';
import UnitIcon from './UnitIcon.jsx';

function LinkButtons({ link, openLabel }) {
  const [copied, setCopied] = useState(false);
  const url = safeLink(link);
  if (!url) {
    return <p className="text-xs text-zinc-600">Lien du jeu pas encore ajouté.</p>;
  }
  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex flex-wrap gap-2">
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
        <ExternalLink className="size-4" aria-hidden="true" />
        {openLabel}
      </a>
      <button type="button" className="btn btn-quiet" onClick={copy}>
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        {copied ? 'Lien copié' : 'Copier le lien'}
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

function CompositionCard({ item }) {
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
      <div className="mt-auto pt-1">
        <LinkButtons link={item.lien} openLabel="Copier l'armée dans le jeu" />
      </div>
    </article>
  );
}

function BaseCard({ item }) {
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
        </div>
      </div>
    </article>
  );
}

const KINDS = {
  compositions: {
    icon: Swords,
    title: 'Compositions',
    intro: "Des armées prêtes à copier dans le jeu, classées par hôtel de ville.",
    items: compositions,
    Card: CompositionCard,
    empty: 'Aucune composition pour le moment.',
    columns: 'lg:grid-cols-2',
  },
  bases: {
    icon: LayoutGrid,
    title: 'Bases',
    intro: 'Des plans de village à ouvrir dans le jeu, classés par hôtel de ville.',
    items: bases,
    Card: BaseCard,
    empty: 'Aucune base pour le moment.',
    columns: 'sm:grid-cols-2 lg:grid-cols-3',
  },
};

export default function Library({ kind }) {
  const { icon: Icon, title, intro, items, Card, empty, columns } = KINDS[kind];
  const [hall, setHall] = useState(null); // null = tous les hôtels de ville
  const halls = [...new Set(items.map((i) => i.hdv))].sort((a, b) => b - a);
  const shown = hall ? items.filter((i) => i.hdv === hall) : items;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="rise">
        <p className="eyebrow flex items-center gap-2">
          <BookOpen className="size-3.5" aria-hidden="true" />
          Bibliothèque
        </p>
        <h1 className="mt-2 flex items-center gap-3 font-display text-4xl text-white sm:text-5xl">
          <Icon className="size-8 text-accent-400" aria-hidden="true" />
          {title}
        </h1>
        <p className="mt-2 text-zinc-400">{intro}</p>
      </header>

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

      {shown.length === 0 ? (
        <div className="card rise p-10 text-center">
          <Icon className="mx-auto size-10 text-zinc-700" aria-hidden="true" />
          <p className="mt-4 font-display text-xl text-white">{empty}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Les fiches s'ajoutent dans le dossier <code className="font-mono text-zinc-300">src/data</code> du
            dépôt, avec le lien de partage copié depuis le jeu.
          </p>
        </div>
      ) : (
        <div key={hall ?? 'tous'} className={`stagger grid gap-4 ${columns}`}>
          {shown.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
