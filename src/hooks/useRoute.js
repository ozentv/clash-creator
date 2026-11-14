import { useCallback, useEffect, useState } from 'react';
import { normalizeTag } from '../lib/tag.js';

// Routeur minimal fondé sur l'adresse : ?clan=TAG&tab=guerres, ?joueur=TAG&vue=armee,
// ?page=compositions, ?page=classements&type=joueurs&pays=32000087. Le bouton « précédent » du navigateur fonctionne.
export const CLAN_TABS = ['apercu', 'guerres', 'capitale', 'membres', 'evolution', 'comparer'];
export const PLAYER_VIEWS = ['profil', 'armee', 'ameliorer', 'carriere', 'succes', 'comparer'];
const PAGES = ['compositions', 'bases', 'classements'];
const RANKING_KINDS = ['clans', 'joueurs'];

const oneOf = (list, value) => (list.includes(value) ? value : list[0]);

function parse() {
  const params = new URLSearchParams(window.location.search);
  const clan = normalizeTag(params.get('clan') ?? '');
  const player = normalizeTag(params.get('joueur') ?? '');
  const library = PAGES.includes(params.get('page')) ? params.get('page') : null;
  return {
    clan, // tag sans #, ou null
    tab: oneOf(CLAN_TABS, params.get('tab')),
    player,
    view: oneOf(PLAYER_VIEWS, params.get('vue')),
    library,
    plan: params.get('plan') ?? '', // plan d'attaque de guerre (voir lib/warPlan.js)
    rankingKind: oneOf(RANKING_KINDS, params.get('type')),
    rankingLocation: /^(global|\d{6,10})$/.test(params.get('pays') ?? '') ? params.get('pays') : null,
    page: player ? 'player' : library ? library : clan ? 'clan' : 'home',
  };
}

function toUrl(route) {
  const url = new URL(window.location.href);
  url.search = '';
  const set = (key, value) => value && url.searchParams.set(key, value);
  set('clan', route.clan);
  if (route.clan && route.tab !== CLAN_TABS[0]) set('tab', route.tab);
  set('joueur', route.player);
  if (route.player && route.view !== PLAYER_VIEWS[0]) set('vue', route.view);
  if (!route.player) set('page', route.library);
  if (route.clan && !route.player && !route.library && route.tab === 'guerres') set('plan', route.plan);
  if (!route.player && route.library === 'classements') {
    if (route.rankingKind !== RANKING_KINDS[0]) set('type', route.rankingKind);
    set('pays', route.rankingLocation);
  }
  return url;
}

export function useRoute() {
  const [route, setRoute] = useState(parse);

  useEffect(() => {
    const onPop = () => setRoute(parse());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // navigate({ player: 'TAG' }) fusionne avec la route courante.
  // replace: true pour un simple changement d'onglet (pas d'entrée d'historique).
  const navigate = useCallback((patch, { replace = false } = {}) => {
    const url = toUrl({ ...parse(), ...patch });
    window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
    setRoute(parse());
    if (!replace) window.scrollTo({ top: 0 });
  }, []);

  return { route, navigate };
}
