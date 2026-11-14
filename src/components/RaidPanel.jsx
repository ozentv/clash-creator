import { useRef } from 'react';
import { Landmark } from 'lucide-react';
import { getRaid } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { formatDate, formatNumber } from '../lib/format.js';
import AsyncSection from './AsyncSection.jsx';
import ExportButtons from './ExportButtons.jsx';

function Figure({ label, value }) {
  return (
    <div className="bg-ink-900 px-4 py-3">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="text-xl font-bold text-white tabular-nums">{value}</dd>
    </div>
  );
}

export default function RaidPanel({ clan, onSelectPlayer }) {
  const state = useAsync(getRaid, clan.tag);
  const exportRef = useRef(null);

  return (
    <AsyncSection icon={Landmark} title="Raids de la capitale" state={state}>
      {(raid) => {
        if (raid.state === 'none') {
          return <p className="p-4 text-sm text-zinc-400">Aucun week-end de raid enregistré pour ce clan.</p>;
        }
        const raiders = new Set(raid.members.map((m) => m.tag));
        const absent = clan.members.filter((m) => !raiders.has(m.tag));
        return (
          <div ref={exportRef} className="bg-ink-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] p-4">
              <p className="text-sm text-zinc-300">
                <span className="mr-2 rounded-md bg-accent-400/10 px-2 py-0.5 text-xs font-semibold text-accent-400">
                  {raid.state === 'ongoing' ? 'Week-end en cours' : 'Dernier week-end'}
                </span>
                du {formatDate(raid.startTime)} au {formatDate(raid.endTime)}
              </p>
              <ExportButtons
                compact
                targetRef={exportRef}
                filename={`raids-${clan.tag.replace('#', '').toLowerCase()}`}
                title="Raids de la capitale"
                subtitle={clan.name}
              />
            </div>
            <dl className="grid grid-cols-2 gap-px border-b border-white/[0.08] bg-white/5 lg:grid-cols-3">
              <Figure label="Or de capitale pillé" value={formatNumber(raid.totalLoot)} />
              <Figure label="Attaques utilisées" value={formatNumber(raid.totalAttacks)} />
              <Figure label="Raids terminés" value={raid.raidsCompleted} />
              <Figure label="Districts détruits" value={raid.districtsDestroyed} />
              <Figure label="Participants" value={`${raid.members.length} / ${clan.members.length}`} />
              <Figure
                label="Or moyen par attaque"
                value={raid.totalAttacks ? formatNumber(Math.round(raid.totalLoot / raid.totalAttacks)) : '—'}
              />
            </dl>

            {absent.length > 0 && (
              <div className="border-b border-white/[0.08] p-4">
                <h4 className="mb-2 text-sm font-semibold text-white">
                  Membres actuels sans attaque
                  <span className="ml-2 text-zinc-500">{absent.length}</span>
                </h4>
                <ul className="flex flex-wrap gap-2">
                  {absent.map((m) => (
                    <li key={m.tag}>
                      <button
                        type="button"
                        onClick={() => onSelectPlayer(m.tag)}
                        className="cursor-pointer rounded-md border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-sm text-red-200 hover:border-red-400/60"
                      >
                        {m.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="overflow-x-auto" data-story-skip>
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead className="text-xs text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Joueur</th>
                    <th className="px-4 py-2.5 text-right font-medium">Attaques</th>
                    <th className="px-4 py-2.5 text-right font-medium">Or pillé</th>
                    <th className="px-4 py-2.5 text-right font-medium">Par attaque</th>
                  </tr>
                </thead>
                <tbody>
                  {raid.members.map((m) => (
                    <tr key={m.tag} className="row-hover border-t border-white/5">
                      <td className="px-4 py-2">
                        <button type="button" onClick={() => onSelectPlayer(m.tag)} className="player-link">
                          {m.name}
                        </button>
                      </td>
                      <td
                        className={`px-4 py-2 text-right tabular-nums ${
                          m.attacks < m.attackLimit ? 'text-red-300' : 'text-zinc-300'
                        }`}
                      >
                        {m.attacks} / {m.attackLimit}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-white tabular-nums">
                        {formatNumber(m.loot)}
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-400 tabular-nums">
                        {m.attacks ? formatNumber(Math.round(m.loot / m.attacks)) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }}
    </AsyncSection>
  );
}
