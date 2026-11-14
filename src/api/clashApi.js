// Appels vers notre proxy (server/), qui détient le token Clash of Clans.

async function get(path) {
  let res;
  try {
    res = await fetch(path);
  } catch {
    throw new Error('Serveur injoignable. Le backend est-il démarré ?');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `Erreur ${res.status}`);
  return body;
}

const clean = (tag) => encodeURIComponent(tag.replace(/^#/, ''));

export const getClan = (tag) => get(`/api/clan/${clean(tag)}`); // { demo, clan }
export const getWar = (tag) => get(`/api/clan/${clean(tag)}/war`).then((b) => b.war);
export const getPlayer = (tag) => get(`/api/player/${clean(tag)}`).then((b) => b.player);
