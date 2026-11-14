import { useEffect, useState } from 'react';
import { CalendarClock, Gamepad2, Landmark, Medal, Trophy } from 'lucide-react';
import { formatCountdown, upcomingEvents } from '../lib/events.js';

const ICONS = { raid: Landmark, games: Gamepad2, league: Medal, season: Trophy };

// Bandeau des événements du jeu, d'après leurs horaires habituels. Recalculé chaque minute.
export default function EventsBar() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border-b border-white/[0.08] bg-ink-950/60" data-no-export>
      <ul
        aria-label="Événements du jeu (horaires habituels)"
        className="mx-auto flex max-w-6xl items-center gap-x-6 overflow-x-auto px-4 py-2 text-xs whitespace-nowrap"
      >
        <li className="flex shrink-0 items-center text-zinc-600" title="Horaires habituels du jeu ; une date peut être décalée par l'éditeur.">
          <CalendarClock className="size-3.5" aria-hidden="true" />
        </li>
        {upcomingEvents(now).map((event) => {
          const Icon = ICONS[event.key];
          return (
            <li key={event.key} className="flex shrink-0 items-center gap-1.5">
              <Icon className={`size-3.5 ${event.active ? 'text-accent-400' : 'text-zinc-500'}`} aria-hidden="true" />
              <span className="font-medium text-zinc-300">{event.label}</span>
              {event.active ? (
                <span className="text-accent-400">en cours · fin dans {formatCountdown(event.at - now)}</span>
              ) : (
                <span className="font-mono text-zinc-500">{event.key === 'season' ? '' : 'dans '}{formatCountdown(event.at - now)}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
