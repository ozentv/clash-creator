import { useCallback, useEffect } from 'react';
import { LayoutGrid, ShieldCheck, Swords } from 'lucide-react';
import { useClan } from './hooks/useClan.js';
import { useRecentClans } from './hooks/useRecentClans.js';
import { useRoute } from './hooks/useRoute.js';
import { useSpotlight } from './hooks/useSpotlight.js';
import { normalizeTag } from './lib/tag.js';
import Backdrop from './components/Backdrop.jsx';
import ClanSearch from './components/ClanSearch.jsx';
import Landing from './components/Landing.jsx';
import ClanSkeleton from './components/ClanSkeleton.jsx';
import ClanView from './components/ClanView.jsx';
import PlayerPage from './components/PlayerPage.jsx';
import Library from './components/Library.jsx';

const DEFAULT_TITLE = document.title;
const NAV = [
  ['compositions', 'Compositions', Swords],
  ['bases', 'Bases', LayoutGrid],
];

export default function App() {
  const { route, navigate } = useRoute();
  const { status, clan, demo, error, load, reset } = useClan();
  const { recent, remember, forget } = useRecentClans();
  useSpotlight();

  // Le clan de l'adresse est chargé et conservé pendant la visite des autres pages.
  const loadedTag = clan ? normalizeTag(clan.tag) : null;
  useEffect(() => {
    if (route.clan && route.clan !== loadedTag) load(route.clan);
    if (!route.clan && loadedTag) reset();
    // loadedTag est volontairement absent : on ne recharge que si l'adresse change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.clan, load, reset]);

  useEffect(() => {
    if (clan) remember(clan);
  }, [clan, remember]);

  useEffect(() => {
    const titles = { compositions: 'Compositions', bases: 'Bases', player: `Joueur #${route.player}` };
    const name = route.page === 'clan' ? clan?.name : titles[route.page];
    document.title = name ? `${name} · Clash Creator` : DEFAULT_TITLE;
  }, [route.page, route.player, clan]);

  const openClan = useCallback(
    (tag) => navigate({ clan: normalizeTag(tag), tab: 'apercu', player: null, library: null }),
    [navigate],
  );
  const openPlayer = useCallback(
    (tag) => navigate({ player: normalizeTag(tag), view: 'profil' }),
    [navigate],
  );
  const goHome = useCallback(() => navigate({ clan: null, player: null, library: null }), [navigate]);

  const loading = status === 'loading';
  const clanError = status === 'error' ? error : null;
  // Le clan affiché correspond-il à celui de l'adresse ? (faux pendant un changement de clan)
  const clanReady = clan && loadedTag === route.clan;

  let page;
  if (route.page === 'player') {
    page = (
      <PlayerPage
        key={route.player}
        tag={route.player}
        view={route.view}
        onView={(view) => navigate({ view }, { replace: true })}
        clan={clanReady ? clan : null}
        onOpenClan={openClan}
        onBack={() => navigate({ player: null })}
      />
    );
  } else if (route.page === 'compositions' || route.page === 'bases') {
    page = <Library key={route.page} kind={route.page} />;
  } else if (route.page === 'clan' && clan && !(clanError && !clanReady)) {
    page = (
      <ClanView
        clan={clan}
        demo={demo}
        error={clanError}
        refreshing={loading}
        tab={route.tab}
        onTab={(tab) => navigate({ tab }, { replace: true })}
        onRefresh={() => load(route.clan)}
        onSelectPlayer={openPlayer}
        recent={recent}
      />
    );
  } else if (route.page === 'clan' && loading) {
    page = <ClanSkeleton />;
  } else {
    page = (
      <Landing
        onSearch={openClan}
        onPlayer={openPlayer}
        loading={loading}
        error={route.page === 'clan' ? clanError : null}
        recent={recent}
        onForget={forget}
      />
    );
  }
  const onLanding = page.type === Landing;

  return (
    <>
      <Backdrop />
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-ink-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-5">
          <button
            type="button"
            onClick={goHome}
            aria-label="Clash Creator, retour à l'accueil"
            className="group flex shrink-0 cursor-pointer items-center gap-2 font-display text-lg text-white"
          >
            <ShieldCheck
              className="size-6 text-accent-400 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
              aria-hidden="true"
            />
            <span className={onLanding ? '' : 'hidden md:inline'}>
              Clash<span className="text-accent-400">Creator</span>
            </span>
          </button>
          <nav aria-label="Bibliothèque" className="flex shrink-0 items-center gap-1 sm:gap-4">
            {NAV.map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => navigate({ library: key, player: null })}
                aria-current={route.page === key ? 'page' : undefined}
                aria-label={label}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md p-1.5 text-sm transition-colors hover:text-white ${
                  route.page === key ? 'text-accent-400' : 'text-zinc-400'
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className={onLanding ? '' : 'hidden sm:inline'}>{label}</span>
              </button>
            ))}
          </nav>
          {!onLanding && (
            <div className="ml-auto flex min-w-0 flex-1 justify-end">
              <ClanSearch
                onSearch={openClan}
                onPlayer={openPlayer}
                loading={loading}
                currentTag={`${route.page}-${route.clan}-${route.player}`}
                variant="compact"
                hotkey
              />
            </div>
          )}
        </div>
      </header>

      {page}

      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-sm text-zinc-400">
            Clash<span className="text-accent-400">Creator</span>
          </p>
          <p className="max-w-2xl sm:text-right">
            Ce contenu n'est pas affilié à, approuvé, sponsorisé ou spécifiquement validé par
            Supercell, et Supercell n'en est pas responsable.
          </p>
        </div>
      </footer>
    </>
  );
}
