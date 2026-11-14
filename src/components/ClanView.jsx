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
import Tabs from './Tabs.jsx';
import DemoBanner from './DemoBanner.jsx';

export const TABS = [
  ['apercu', 'Aperçu', LayoutDashboard],
  ['guerres', 'Guerres', Swords],
  ['capitale', 'Capitale', Landmark],
  ['membres', 'Membres', Users],
  ['comparer', 'Comparer', GitCompareArrows],
];

export default function ClanView({ clan, demo, error, refreshing, tab, onTab, onRefresh, onSelectPlayer, recent }) {
  return (
    <main className={`mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 transition-opacity ${refreshing ? 'opacity-60' : ''}`}>
      {error && (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-200">
          {error}
        </p>
      )}
      {demo && <DemoBanner />}
      <ClanHeader clan={clan} onRefresh={onRefresh} refreshing={refreshing} />
      <Tabs tabs={TABS} current={tab} onChange={onTab} label="Sections du clan" idPrefix="tab" />

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
