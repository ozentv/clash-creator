import { useCallback, useRef, useState } from 'react';
import { getClan } from '../api/clashApi.js';

export function useClan() {
  const [state, setState] = useState({
    status: 'idle',
    clan: null,
    demo: false,
    error: null,
  });
  const requestId = useRef(0);

  const load = useCallback(async (tag) => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const { clan, demo } = await getClan(tag);
      if (id === requestId.current) setState({ status: 'success', clan, demo, error: null });
    } catch (err) {
      if (id === requestId.current)
        setState({ status: 'error', clan: null, demo: false, error: err.message });
    }
  }, []);

  return { ...state, load };
}
