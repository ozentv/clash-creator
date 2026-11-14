// Appels vers notre serveur (server/), qui détient le token Clash of Clans.

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

export const getClan = (tag) => get(`/api/clan/${clean(tag)}`); // { demo, clan, fetchedAt }
export const getWar = (tag) => get(`/api/clan/${clean(tag)}/war`).then((b) => b.war);
export const getWarLog = (tag) => get(`/api/clan/${clean(tag)}/warlog`); // { private, wars }
export const getLeague = (tag) => get(`/api/clan/${clean(tag)}/league`).then((b) => b.league);
export const getRaid = (tag) => get(`/api/clan/${clean(tag)}/raids`).then((b) => b.raid);
export const getPlayer = (tag) =>
  get(`/api/player/${clean(tag)}`).then((b) => ({ ...b.player, fetchedAt: b.fetchedAt }));
export const searchClans = (name) =>
  get(`/api/clans/search?name=${encodeURIComponent(name)}`).then((b) => b.clans);

// ---------- Bibliothèque ----------

export const getLibrary = () => get('/api/library'); // { compositions, bases, editable, warning }

async function admin(method, path, password, body) {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: { Authorization: `Bearer ${password}`, ...(body && { 'Content-Type': 'application/json' }) },
      body: body && JSON.stringify(body),
    });
  } catch {
    throw new Error('Serveur injoignable.');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `Erreur ${res.status}`);
  }
}

export const adminLogin = (password) => admin('POST', '/api/admin/login', password);
export const addLibraryEntry = (kind, entry, password) => admin('POST', `/api/library/${kind}`, password, entry);
export const deleteLibraryEntry = (id, password) =>
  admin('DELETE', `/api/library/${encodeURIComponent(id)}`, password);

// ---------- Historique, effectif, classements ----------

export const getClanHistory = (tag) => get(`/api/clan/${clean(tag)}/history`); // { enabled, days, movements }
export const getPlayerHistory = (tag) => get(`/api/player/${clean(tag)}/history`); // { enabled, days }
export const getRoster = (tag) => get(`/api/clan/${clean(tag)}/roster`).then((b) => b.roster);
export const getLocations = () => get('/api/rankings/locations').then((b) => b.locations);
export const getRanking = (location, kind) =>
  get(`/api/rankings/${encodeURIComponent(location)}/${kind}`).then((b) => b.ranking);
export const getWarStats = (tag) => get(`/api/clan/${clean(tag)}/war-stats`); // { enabled, wars, members }
