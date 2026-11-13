import { useClan } from './hooks/useClan.js';
import ClanSearch from './components/ClanSearch.jsx';
import ClanHeader from './components/ClanHeader.jsx';
import StatCards from './components/StatCards.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import TikTokGenerator from './components/TikTokGenerator.jsx';
import MemberList from './components/MemberList.jsx';

export default function App() {
  const { status, clan, demo, ai, error, load } = useClan();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="text-center">
        <h1 className="title-clash text-4xl sm:text-6xl">Clash Creator AI</h1>
        <p className="mt-2 text-slate-300">
          Les stats de ton clan, transformées en contenu TikTok prêt à poster.
        </p>
      </header>

      <ClanSearch onSearch={load} loading={status === 'loading'} />

      {status === 'error' && (
        <p role="alert" className="panel border-red-500/60 px-4 py-3 text-center text-red-200">
          ⚠️ {error}
        </p>
      )}

      {status === 'idle' && (
        <p className="py-10 text-center text-slate-400">
          Entre un tag de clan (ex. <span className="font-mono text-gold-300">#2PP</span>) pour
          commencer.
        </p>
      )}

      {clan && (
        <main className={`flex flex-col gap-6 ${status === 'loading' ? 'opacity-50' : ''}`}>
          {demo && (
            <p className="rounded-xl border border-gold-500/50 bg-gold-500/10 px-4 py-2 text-center text-sm text-gold-300">
              Mode démo : données fictives. Ajoute <code>COC_API_TOKEN</code> dans <code>.env</code>{' '}
              pour charger de vrais clans.
            </p>
          )}
          <ClanHeader clan={clan} />
          <StatCards members={clan.members} />
          <div className="grid items-start gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Leaderboard clan={clan} />
            </div>
            <div className="lg:col-span-2">
              <TikTokGenerator clan={clan} aiAvailable={ai} />
            </div>
          </div>
          <MemberList members={clan.members} />
        </main>
      )}

      <footer className="pt-4 text-center text-xs text-slate-500">
        Ce contenu n'est pas affilié à, approuvé, sponsorisé ou spécifiquement validé par Supercell,
        et Supercell n'en est pas responsable.
      </footer>
    </div>
  );
}
