import { useMemo, useRef } from 'react';
import { ClipboardList, Link, RotateCcw } from 'lucide-react';
import { getWar } from '../api/clashApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { decodePlan, encodePlan, MAX_TARGETS, reviewPlan } from '../lib/warPlan.js';
import { copyText, toast } from '../lib/toast.js';
import ExportButtons from './ExportButtons.jsx';

// Plan d'attaque : chaque membre reçoit une ou deux cibles. Le plan est contenu dans l'adresse
// (paramètre « plan »), donc « Copier le lien » suffit à le partager.
export default function WarPlan({ clanTag, plan: planText, onPlan }) {
  const { status, data: war } = useAsync(getWar, clanTag);
  const exportRef = useRef(null);
  const plan = useMemo(() => decodePlan(planText), [planText]);

  if (status !== 'success' || !war.members || !war.opponents?.length || war.state === 'warEnded') return null;

  const review = reviewPlan(plan, war.teamSize);
  const opponent = (position) => war.opponents.find((o) => o.position === position);
  const total = war.teamSize * war.attacksPerMember;

  function setTarget(position, slot, value) {
    const targets = [...(plan[position] ?? [])];
    targets[slot] = value ? Number(value) : null;
    onPlan(encodePlan({ ...plan, [position]: targets.filter(Boolean) }));
  }

  const assignedMembers = war.members.filter((m) => plan[m.position]?.length);

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] p-4">
        <h3 className="section-label">
          <ClipboardList className="size-4 text-accent-400" aria-hidden="true" />
          Plan d'attaque
          <span className="text-zinc-600">
            {review.assigned} / {total}
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-quiet px-3 py-1.5" onClick={() => copyText(window.location.href, 'Lien du plan copié')} disabled={review.assigned === 0}>
            <Link className="size-4" aria-hidden="true" />
            Copier le lien
          </button>
          {review.assigned > 0 && (
            <>
              <ExportButtons
                compact
                targetRef={exportRef}
                filename={`plan-${clanTag.replace('#', '').toLowerCase()}`}
                title="Plan d'attaque"
                subtitle={`${war.clan.name} contre ${war.opponent.name}`}
              />
              <button
                type="button"
                className="btn btn-quiet px-3 py-1.5"
                onClick={() => {
                  onPlan('');
                  toast('Plan effacé');
                }}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Effacer
              </button>
            </>
          )}
        </div>
      </div>

      <p className="border-b border-white/[0.08] px-4 py-3 text-xs text-zinc-500">
        Choisis une ou deux cibles par membre. Le plan est enregistré dans l'adresse de la page : copie le lien
        pour l'envoyer à ton clan.
      </p>

      {(review.doubled.length > 0 || (review.assigned > 0 && review.uncovered.length > 0)) && (
        <div className="flex flex-col gap-1 border-b border-white/[0.08] px-4 py-3 text-sm">
          {review.doubled.length > 0 && (
            <p className="text-accent-400">
              Cibles attribuées plusieurs fois : {review.doubled.map((n) => `n°${n}`).join(', ')}.
            </p>
          )}
          {review.assigned > 0 && review.uncovered.length > 0 && (
            <p className="text-zinc-400">
              Bases ennemies sans attaquant : {review.uncovered.map((n) => `n°${n}`).join(', ')}.
            </p>
          )}
        </div>
      )}

      <ol className="divide-y divide-white/5">
        {war.members.map((m) => (
          <li key={m.tag} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5">
            <span className="w-6 shrink-0 text-sm text-zinc-500 tabular-nums">{m.position}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-zinc-100">{m.name}</span>
              {m.townHallLevel && <span className="text-xs text-zinc-500">HDV {m.townHallLevel}</span>}
            </span>
            <span className="flex w-full gap-2 pl-9 sm:w-auto sm:pl-0">
              {Array.from({ length: MAX_TARGETS }, (_, slot) => (
                <select
                  key={slot}
                  value={plan[m.position]?.[slot] ?? ''}
                  onChange={(e) => setTarget(m.position, slot, e.target.value)}
                  aria-label={`Cible ${slot + 1} de ${m.name}`}
                  className="field min-w-0 flex-1 px-2 py-1.5 text-sm sm:w-44 sm:flex-none"
                >
                  <option value="">Cible {slot + 1}…</option>
                  {war.opponents.map((o) => (
                    <option key={o.position} value={o.position}>
                      n°{o.position} · {o.name}
                      {o.townHallLevel ? ` (HDV ${o.townHallLevel})` : ''}
                    </option>
                  ))}
                </select>
              ))}
            </span>
          </li>
        ))}
      </ol>

      {/* Récapitulatif en texte : c'est lui qui part dans l'image exportée. */}
      {assignedMembers.length > 0 && (
        <div ref={exportRef} className="border-t border-white/[0.08] bg-ink-900 p-4">
          <p className="section-label mb-3">Récapitulatif</p>
          <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {assignedMembers.map((m) => (
              <li key={m.tag} className="flex items-baseline gap-2 text-sm">
                <span className="w-6 shrink-0 text-zinc-500 tabular-nums">{m.position}</span>
                <span className="min-w-0">
                  <span className="font-medium text-white">{m.name}</span>
                  <span className="block text-xs text-zinc-400">
                    {plan[m.position]
                      .map((target) => `n°${target}${opponent(target) ? ` ${opponent(target).name}` : ''}`)
                      .join(' puis ')}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
