import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatAgo } from '../lib/format.js';

// « Mis à jour il y a 3 min », recalculé toutes les 30 secondes.
export default function Freshness({ at }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [at]);

  if (!at) return null;
  const date = new Date(at);
  return (
    <p className="flex items-center gap-1.5 text-xs text-zinc-500" data-no-export>
      <Clock className="size-3.5" aria-hidden="true" />
      <time dateTime={at} title={date.toLocaleString('fr-FR')}>
        Mis à jour {formatAgo(now - date.getTime())}
      </time>
    </p>
  );
}
