import { useEffect, useState } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { subscribe } from '../lib/toast.js';

export default function Toaster() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => subscribe(setToasts), []);

  return (
    <div
      role="status"
      aria-live="polite"
      data-no-export
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => {
        const Icon = t.error ? CircleAlert : CircleCheck;
        return (
          <p
            key={t.id}
            className="rise flex items-center gap-2 rounded-full border border-white/15 bg-ink-800 px-4 py-2.5 text-sm font-medium text-white shadow-2xl shadow-black"
          >
            <Icon className={`size-4 ${t.error ? 'text-red-400' : 'text-accent-400'}`} aria-hidden="true" />
            {t.message}
          </p>
        );
      })}
    </div>
  );
}
