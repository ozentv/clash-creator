// Appels vers notre proxy (server/), qui détient le token Clash of Clans.
export async function getClan(tag) {
  let res;
  try {
    res = await fetch(`/api/clan/${encodeURIComponent(tag)}`);
  } catch {
    throw new Error('Serveur injoignable. Le backend est-il démarré ?');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `Erreur ${res.status}`);
  return body; // { demo: boolean, ai: boolean, clan }
}

export async function generateAiScript(clan, style) {
  let res;
  try {
    res = await fetch('/api/tiktok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clan, style }),
    });
  } catch {
    throw new Error('Serveur injoignable.');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `Erreur ${res.status}`);
  return body.text;
}
