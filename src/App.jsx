import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useClan } from './hooks/useClan.js';
import { useRecentClans } from './hooks/useRecentClans.js';
import { useSpotlight } from './hooks/useSpotlight.js';
import { normalizeTag } from './lib/tag.js';
import Backdrop from './components/Backdrop.jsx';
import ClanSearch from './components/ClanSearch.jsx';
import Landing from './components/Landing.jsx';
import ClanSkeleton from './components/ClanSkeleton.jsx';
import ClanView, { TABS } from './components/ClanView.jsx';
import PlayerDialog from './components/PlayerDialog.jsx';

const DEFAULT_TITLE = document.title;
const isTab = (key) => TABS.some(([k]) => k === key);

// L'adresse reflète le clan, l'onglet et la fiche joueur affichés : ?clan=TAG&tab=guerres&joueur=TAG
function readUrl() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  const player = normalizeTag(params.get('joueur') ?? '');
  return {
    tag: normalizeTag(params.get('clan') ?? ''),
    tab: isTab(tab) ? tab : 'apercu',
    player: player && `#${player}`,
  };
}

function writeUrl(clan, tab, playerTag) {
  const url = new URL(window.location.href);
  url.search = '';
  if (clan) {
    url.searchParams.set('clan', clan.tag.replace('#', ''));
    if (tab !== 'apercu') url.searchParams.set('tab', tab);
  }
  if (playerTag) url.searchParams.set('joueur', playerTag.replace('#', ''));
  window.history.replaceState(null, '', url);
}

export default function App() {
  const { status, clan, demo, error, load, reset } = useClan();
  const { recent, remember, forget } = useRecentClans();
  const [tab, setTab] = useState(() => readUrl().tab);
  const [playerTag, setPlayerTag] = useState(() => readUrl().player);
  useSpotlight();

  useEffect(() => {
    const { tag } = readUrl();
    if (tag) load(tag);
  }, [load]);

  useEffect(() => {
    if (clan) remember(clan);
  }, [clan, remember]);

  useEffect(() => {
    writeUrl(clan, tab, playerTag);
    document.title = clan ? `${clan.name} · Clash Creator` : DEFAULT_TITLE;
  }, [clan, tab, playerTag]);

  const goHome = useCallback(() => {
    reset();
    setTab('apercu');
    window.scrollTo({ top: 0 });
  }, [reset]);

  const search = useCallback(
    (tag) => {
      window.scrollTo({ top: 0 });
      load(tag);
    },
    [load],
  );

  const loading = status === 'loading';

  return (
    <>
      <Backdrop />
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-ink-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
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
            <span className={clan ? 'hidden sm:inline' : ''}>
              Clash<span className="text-accent-400">Creator</span>
            </span>
          </button>
          {clan && (
            <ClanSearch
              onSearch={search}
              onPlayer={setPlayerTag}
              loading={loading}
              currentTag={clan.tag}
              variant="compact"
              hotkey
            />
          )}
        </div>
      </header>

      {clan ? (
        <ClanView
          clan={clan}
          demo={demo}
          error={status === 'error' ? error : null}
          refreshing={loading}
          tab={tab}
          onTab={setTab}
          onRefresh={() => load(normalizeTag(clan.tag))}
          onSelectPlayer={setPlayerTag}
          recent={recent}
        />
      ) : loading ? (
        <ClanSkeleton />
      ) : (
        <Landing
          onSearch={search}
          onPlayer={setPlayerTag}
          loading={loading}
          error={status === 'error' ? error : null}
          recent={recent}
          onForget={forget}
        />
      )}

      <PlayerDialog
        tag={playerTag}
        onClose={() => setPlayerTag(null)}
        members={clan?.members}
        currentClanTag={clan?.tag ?? null}
        onOpenClan={(tag) => {
          setPlayerTag(null);
          search(normalizeTag(tag));
        }}
      />

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
