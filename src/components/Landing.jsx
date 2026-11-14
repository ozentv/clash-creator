import {
  Download,
  GitCompareArrows,
  History,
  Landmark,
  Link as LinkIcon,
  Medal,
  Search,
  Swords,
  Trophy,
  UserX,
  X,
} from 'lucide-react';
import { useReveal } from '../hooks/useReveal.js';
import { normalizeTag } from '../lib/tag.js';
import ClanSearch from './ClanSearch.jsx';

const FEATURES = [
  [Swords, 'Guerre en direct', 'Score, temps restant et attaques que chaque membre doit encore faire.'],
  [Medal, 'Ligue de clans', 'Résultat de chaque manche et étoiles gagnées par joueur sur la semaine.'],
  [Landmark, 'Raids de capitale', "Or pillé, attaques utilisées et membres qui n'ont pas participé."],
  [Trophy, 'Cinq classements', 'Trophées, dons, bilan des dons, niveau et hôtel de ville, exportables en image.'],
  [UserX, 'Membres à surveiller', 'Les joueurs qui ne donnent plus et décrochent, repérés automatiquement.'],
  [GitCompareArrows, 'Comparaison', 'Deux clans côte à côte, chiffre par chiffre.'],
];

const STEPS = [
  [Search, 'Cherche', 'Un clan par son nom ou son tag, ou directement un joueur par son tag.'],
  [History, 'Explore', "Cinq onglets : aperçu, guerres, capitale, membres et comparaison."],
  [LinkIcon, 'Partage', 'Un lien direct vers ton clan, ou un classement exporté en image.'],
];

export default function Landing({ onSearch, onPlayer, loading, error, recent, onForget }) {
  const ref = useReveal();

  return (
    <div ref={ref}>
      <section className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="eyebrow rise flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent-400" />
          </span>
          Analyse de clan · Clash of Clans
        </p>
        <h1 className="rise mt-6 font-display text-5xl leading-[0.95] text-white [animation-delay:80ms] sm:text-7xl lg:text-8xl">
          Tout ton clan.
          <br />
          <span className="text-shine">En un coup d'œil.</span>
        </h1>
        <p className="rise mx-auto mt-6 max-w-xl text-base text-zinc-400 [animation-delay:160ms] sm:text-lg">
          Guerres, ligue, raids de capitale, classements et activité de chaque membre, à partir
          d'un simple tag.
        </p>

        <div className="rise mt-10 w-full [animation-delay:240ms]">
          <ClanSearch onSearch={onSearch} onPlayer={onPlayer} loading={loading} currentTag={null} variant="hero" hotkey />
          {error && (
            <p role="alert" className="mx-auto mt-4 max-w-2xl rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-200">
              {error}
            </p>
          )}
          {recent.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="eyebrow">Récents</span>
              {recent.map((clan) => (
                <span key={clan.tag} className="flex items-center rounded-md border border-white/10 bg-white/[0.03] text-sm text-zinc-300">
                  <button
                    type="button"
                    onClick={() => onSearch(normalizeTag(clan.tag))}
                    className="max-w-44 cursor-pointer truncate py-1 pr-1 pl-2.5 hover:text-white"
                  >
                    {clan.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => onForget(clan.tag)}
                    aria-label={`Retirer ${clan.name} des clans récents`}
                    className="cursor-pointer py-1 pr-1.5 pl-0.5 text-zinc-600 hover:text-white"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <p className="eyebrow reveal text-center">Ce que tu obtiens</p>
        <h2 className="reveal mt-3 text-center font-display text-3xl text-white sm:text-4xl">
          Les chiffres qu'un chef de clan regarde vraiment
        </h2>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([Icon, title, text], i) => (
            <article
              key={title}
              className="card card-lift reveal p-6"
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <span className="grid size-10 place-items-center rounded-lg border border-accent-400/25 bg-accent-400/10 text-accent-400">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-28">
        <p className="eyebrow reveal text-center">Comment ça marche</p>
        <ol className="mt-8 grid gap-3 md:grid-cols-3">
          {STEPS.map(([Icon, title, text], i) => (
            <li key={title} className="reveal relative border-t border-white/10 pt-6" style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="font-mono text-xs text-accent-400">0{i + 1}</span>
              <h3 className="mt-2 flex items-center gap-2 font-display text-xl text-white">
                <Icon className="size-5 text-zinc-500" aria-hidden="true" />
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
            </li>
          ))}
        </ol>
        <p className="reveal mt-12 flex items-center justify-center gap-2 text-sm text-zinc-500">
          <Download className="size-4" aria-hidden="true" />
          Gratuit, sans compte, sans installation.
        </p>
      </section>
    </div>
  );
}
