// Calendrier des événements récurrents du jeu, calculé à partir de leurs horaires habituels (UTC).
// Supercell peut décaler une date à l'occasion : ce sont des repères, pas une source officielle.

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const utc = (year, month, day, hour) => Date.UTC(year, month, day, hour);

// Événement mensuel : du jour `from` au jour `to`, à 8 h UTC.
function monthly(now, from, to) {
  const d = new Date(now);
  for (let offset = 0; offset < 2; offset++) {
    const start = utc(d.getUTCFullYear(), d.getUTCMonth() + offset, from, 8);
    const end = utc(d.getUTCFullYear(), d.getUTCMonth() + offset, to, 8);
    if (now < end) return { start, end };
  }
}

// Week-end de raid : du vendredi 7 h UTC au lundi 7 h UTC.
function raidWeekend(now) {
  const d = new Date(now);
  const sinceFriday = (d.getUTCDay() + 2) % 7; // vendredi = 0
  let start = utc(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - sinceFriday, 7);
  if (start > now) start -= 7 * DAY;
  if (now >= start + 3 * DAY) start += 7 * DAY;
  return { start, end: start + 3 * DAY };
}

// Fin de saison des trophées : dernier lundi du mois, 5 h UTC.
function seasonEnd(now) {
  const d = new Date(now);
  for (let offset = 0; offset < 2; offset++) {
    const lastDay = new Date(utc(d.getUTCFullYear(), d.getUTCMonth() + offset + 1, 0, 5));
    const end = lastDay.getTime() - ((lastDay.getUTCDay() + 6) % 7) * DAY;
    if (now < end) return end;
  }
}

// Renvoie les quatre événements avec leur prochaine échéance : `active` indique s'il est en cours,
// `at` est sa fin s'il est en cours, son début sinon.
export function upcomingEvents(now = Date.now()) {
  const timed = (key, label, { start, end }) => {
    const active = now >= start;
    return { key, label, active, at: active ? end : start };
  };
  return [
    timed('raid', 'Week-end de raid', raidWeekend(now)),
    timed('games', 'Jeux de clan', monthly(now, 22, 28)),
    timed('league', 'Ligue de guerre de clans', monthly(now, 1, 11)),
    { key: 'season', label: 'Fin de saison', active: false, at: seasonEnd(now) },
  ];
}

// "3 j 07 h", "5 h 12", "34 min"
export function formatCountdown(ms) {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days} j ${String(hours).padStart(2, '0')} h`;
  if (hours > 0) return `${hours} h ${String(minutes % 60).padStart(2, '0')}`;
  return `${minutes} min`;
}
