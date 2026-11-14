import { useCallback, useState } from 'react';

// Clans consultés récemment, mémorisés dans le navigateur de l'utilisateur.
const KEY = 'clash-creator:recent-clans';
const MAX = 8;

function read() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(list) ? list.filter((c) => c?.tag && c?.name) : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Stockage indisponible (navigation privée) : la liste reste en mémoire.
  }
}

export function useRecentClans() {
  const [recent, setRecent] = useState(read);

  const remember = useCallback((clan) => {
    setRecent((list) => {
      const next = [
        { tag: clan.tag, name: clan.name },
        ...list.filter((c) => c.tag !== clan.tag),
      ].slice(0, MAX);
      write(next);
      return next;
    });
  }, []);

  const forget = useCallback((tag) => {
    setRecent((list) => {
      const next = list.filter((c) => c.tag !== tag);
      write(next);
      return next;
    });
  }, []);

  return { recent, remember, forget };
}
