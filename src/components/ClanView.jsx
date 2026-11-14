import { GitCompareArrows, Landmark, LayoutDashboard, Swords, Users } from 'lucide-react';
import ClanHeader from './ClanHeader.jsx';
import StatCards from './StatCards.jsx';
import Composition from './Composition.jsx';
import ClanInfo from './ClanInfo.jsx';
import Leaderboard from './Leaderboard.jsx';
import InactiveMembers from './InactiveMembers.jsx';
import MemberList from './MemberList.jsx';
import WarPanel from './WarPanel.jsx';
import LeaguePanel from './LeaguePanel.jsx';
import WarLog from './WarLog.jsx';
import RaidPanel from './RaidPanel.jsx';
import CompareClans from './CompareClans.jsx';

export const TABS = [
  ['apercu', 'Aperçu', LayoutDashboard],
  ['guerres', 'Guerres', Swords],
  ['capitale', 'Capitale', Landmark],
  ['membres', 'Membres', Users],
  ['comparer', 'Comparer', GitCompareArrows],
];

export default function ClanView({ clan, demo, error, refreshing, tab, onTab, onRefresh, onSelectPlayer, recent }) {
  // Flèches gauche/droite pour passer d'un onglet à l'autre.
  function onKeyDown(e) {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const index = TABS.findIndex(([key]) => key === tab);
    const next = TABS[(index + delta + TABS.length) % TABS.length][0];
    onTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  }

  return (
    <main className={`mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 transition-opacity ${refreshing ? 'opacity-60' : ''}`}>
      {error && (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-200">
          {error}
        </p>
      )}
      {demo && (
        <p className="rounded-lg border border-accent-400/25 bg-accent-400/[0.06] px-4 py-2 text-center text-xs text-accent-400">
          Mode démo : données fictives. Ajoute <code className="font-mono">COC_API_TOKEN</code> côté
          serveur pour charger de vrais clans.
        </p>
      )}
      <ClanHeader clan={clan} onRefresh={onRefresh} refreshing={refreshing} />
      <div className="sticky top-14 z-10 -mx-4 border-b border-white/[0.08] bg-ink-950/80 px-4 backdrop-blur-xl">
        <div role="tablist" aria-label="Sections du clan" onKeyDown={onKeyDown} className="flex gap-6 overflow-x-auto">
          {TABS.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`tab-${key}`}
              aria-selected={tab === key}
              aria-controls="tab-panel"
              tabIndex={tab === key ? 0 : -1}
              className="tab"
              onClick={() => onTab(key)}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        key={`${clan.tag}-${tab}`}
        id="tab-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="stagger flex flex-col gap-4"
      >
        {tab === 'apercu' && (
          <>
            <StatCards members={clan.members} />
            <div className="grid items-start gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Leaderboard clan={clan} onSelectPlayer={onSelectPlayer} />
              </div>
              <div className="flex flex-col gap-4">
                <ClanInfo clan={clan} />
                <Composition members={clan.members} />
              </div>
            </div>
            <InactiveMembers members={clan.members} onSelectPlayer={onSelectPlayer} />
          </>
        )}
        {tab === 'guerres' && (
          <>
            <WarPanel clanTag={clan.tag} onSelectPlayer={onSelectPlayer} />
            <LeaguePanel clanTag={clan.tag} onSelectPlayer={onSelectPlayer} />
            <WarLog clanTag={clan.tag} />
          </>
        )}
        {tab === 'capitale' && <RaidPanel clan={clan} onSelectPlayer={onSelectPlayer} />}
        {tab === 'membres' && <MemberList members={clan.members} onSelectPlayer={onSelectPlayer} />}
        {tab === 'comparer' && <CompareClans clan={clan} recent={recent} />}
      </div>
    </main>
  );
}
