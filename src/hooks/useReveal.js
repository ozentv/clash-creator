import { useEffect, useRef } from 'react';

// Ajoute la classe is-visible aux éléments .reveal du conteneur quand ils entrent à l'écran.
export function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const items = ref.current.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return ref;
}
