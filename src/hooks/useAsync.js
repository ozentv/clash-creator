import { useEffect, useState } from 'react';

// Charge une ressource à chaque changement de `key` (null = rien à charger).
export function useAsync(load, key) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null });

  useEffect(() => {
    if (key == null) {
      setState({ status: 'idle', data: null, error: null });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading', data: null, error: null });
    load(key).then(
      (data) => !cancelled && setState({ status: 'success', data, error: null }),
      (err) => !cancelled && setState({ status: 'error', data: null, error: err.message }),
    );
    return () => {
      cancelled = true;
    };
  }, [load, key]);

  return state;
}
