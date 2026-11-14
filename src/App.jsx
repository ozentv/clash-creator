import { useEffect, useState } from 'react';
import { useClan } from './hooks/useClan.js';
import { useRecentClans } from './hooks/useRecentClans.js';
import { normalizeTag } from './lib/tag.js';
import HeroArt from './components/HeroArt.jsx';
import ClanSearch from './components/ClanSearch.jsx';
import ClanHeader from './components/ClanHeader.jsx';
import StatCards from './components/StatCards.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import MemberList from './components/MemberList.jsx';
import WarPanel from './components/WarPanel.jsx';
import InactiveMembers from './components/InactiveMembers.jsx';
import PlayerDialog from './components/PlayerDialog.jsx';
import WarLog from './components/WarLog.jsx';
import LeaguePanel from './components/LeaguePanel.jsx';
import RaidPanel from './components/RaidPanel.jsx';
import CompareClans from './components/CompareClans.jsx';

const TABS = [
  ['apercu', 'Aperçu'],
  ['guerres', 'Guerres'],
  ['capitale', 'Capitale'],
  ['membres', 'Membres'],
  ['comparer', 'Comparer'],
];

export default function App() {
  const { status, clan, demo, error, load } = useClan();
  const [playerTag, setPlayerTag] = useState(null);
  const [tab, setTab] = useState('apercu');
  const { recent, remember, forget } = useRecentClans();

  // Lien partageable : ?clan=TAG ouvre directement le clan.
  useEffect(() => {
    const tag = normalizeTag(new URLSearchParams(window.location.search).get('clan') ?? '');
    if (tag) load(tag);
  }, [load]);

  useEffect(() => {
    if (!clan) return;
    remember(clan);
    const url = new URL(window.location.href);
    url.searchParams.set('clan', clan.tag.replace('#', ''));
    window.history.replaceState(null, '', url);
    document.title = `${clan.name} · Clash Creator`;
  }, [clan, remember]);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-white/10 bg-ink-950/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <a href="#" className="font-display text-xl text-white">
            Clash<span className="text-accent-400">Creator</span>
          </a>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        <section className="relative overflow-hidden rounded-2xl border border-white/10">
          <HeroArt />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/25 via-ink-950/40 to-ink-950/85" />
          <div className={`relative px-4 text-center ${clan ? 'py-8' : 'py-14 sm:py-20'}`}>
            <h1 className="font-display text-3xl text-white sm:text-5xl">
              Analyse ton clan <span className="text-accent-400">en un clic</span>
            </h1>
            <p className="mt-2 mb-6 text-sm text-zinc-300">
              Guerres, ligue, raids de capitale, classements et fiches joueurs.
            </p>
            <ClanSearch
              onSearch={load}
              loading={status === 'loading'}
              recent={recent}
              onForget={forget}
              currentTag={clan?.tag ?? null}
            />
          </div>
        </section>

        {status === 'error' && (
          <p role="alert" className="card border-red-400/40 px-4 py-3 text-center text-sm text-red-200">
            {error}
          </p>
        )}

        {clan && (
          <main className={`flex flex-col gap-4 ${status === 'loading' ? 'opacity-50' : ''}`}>
            {demo && (
              <p className="rounded-lg border border-accent-400/30 bg-accent-400/5 px-4 py-2 text-center text-xs text-accent-400">
                Mode démo : données fictives. Ajoute <code>COC_API_TOKEN</code> dans{' '}
                <code>.env</code> pour charger de vrais clans.
              </p>
            )}
            <ClanHeader clan={clan} />
            <div role="tablist" aria-label="Sections du clan" className="flex gap-2 overflow-x-auto pb-1">
              {TABS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`tab-${key}`}
                  aria-selected={tab === key}
                  aria-controls="tab-panel"
                  className="btn btn-quiet shrink-0"
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="flex flex-col gap-4">
              {tab === 'apercu' && (
                <>
                  <StatCards members={clan.members} />
                  <Leaderboard clan={clan} onSelectPlayer={setPlayerTag} />
                  <InactiveMembers members={clan.members} onSelectPlayer={setPlayerTag} />
                </>
              )}
              {tab === 'guerres' && (
                <>
                  <WarPanel clanTag={clan.tag} onSelectPlayer={setPlayerTag} />
                  <LeaguePanel clanTag={clan.tag} onSelectPlayer={setPlayerTag} />
                  <WarLog clanTag={clan.tag} />
                </>
              )}
              {tab === 'capitale' && <RaidPanel clan={clan} onSelectPlayer={setPlayerTag} />}
              {tab === 'membres' && <MemberList members={clan.members} onSelectPlayer={setPlayerTag} />}
              {tab === 'comparer' && <CompareClans clan={clan} recent={recent} />}
            </div>
          </main>
        )}

        <PlayerDialog tag={playerTag} onClose={() => setPlayerTag(null)} />

        <footer className="pt-4 pb-2 text-center text-xs text-zinc-600">
          Ce contenu n'est pas affilié à, approuvé, sponsorisé ou spécifiquement validé par
          Supercell, et Supercell n'en est pas responsable.
        </footer>
      </div>
    </>
  );
}
