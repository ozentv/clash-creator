import { useCallback, useRef, useState } from 'react';
import { getClan } from '../api/clashApi.js';

const EMPTY = { status: 'idle', clan: null, demo: false, error: null };

export function useClan() {
  const [state, setState] = useState(EMPTY);
  const requestId = useRef(0);

  const load = useCallback(async (tag) => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const { clan, demo } = await getClan(tag);
      if (id === requestId.current) setState({ status: 'success', clan, demo, error: null });
    } catch (err) {
      // On garde le clan déjà affiché : l'erreur concerne la nouvelle recherche.
      if (id === requestId.current) setState((s) => ({ ...s, status: 'error', error: err.message }));
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    setState(EMPTY);
  }, []);

  return { ...state, load, reset };
}
