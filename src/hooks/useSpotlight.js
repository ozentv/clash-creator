import { useEffect } from 'react';

// Transmet la position du pointeur aux cartes (.card) pour leur halo de survol.
export function useSpotlight() {
  useEffect(() => {
    function onMove(e) {
      const card = e.target.closest?.('.card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);
}
