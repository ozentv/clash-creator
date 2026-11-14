import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import {
  fetchClan,
  fetchCurrentWar,
  fetchPlayer,
  fetchWarLog,
  fetchRaidSeasons,
  loadLeague,
  searchClans,
  toClanDto,
  toWarDto,
  toPlayerDto,
  toWarLogDto,
  toRaidDto,
  toClanSummaryDto,
  CocApiError,
} from './cocClient.js';
import {
  buildDemoClan,
  buildDemoWar,
  buildDemoPlayer,
  buildDemoSearch,
  buildDemoWarLog,
  buildDemoLeague,
  buildDemoRaids,
} from './demoData.js';

const PORT = process.env.PORT ?? 3001;
const TOKEN = process.env.COC_API_TOKEN?.trim();
const DEMO = !TOKEN;
const TAG_PATTERN = /^[0289PYLQGRJCUV]{3,12}$/;

const app = express();
app.set('trust proxy', 1); // derrière le proxy de l'hébergeur : req.ip = adresse du visiteur
app.disable('x-powered-by');
app.use(compression());

// En-têtes de sécurité.
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy':
      "default-src 'self'; img-src 'self' data: blob: https://api-assets.clashofclans.com; " +
      "style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'",
  });
  next();
});

// Limite de débit par adresse IP sur l'API, pour protéger le quota de la clé Clash of Clans.
const RATE_LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE) || 120;
const hits = new Map();
setInterval(() => hits.clear(), 60_000).unref();
app.use('/api', (req, res, next) => {
  const count = (hits.get(req.ip) ?? 0) + 1;
  hits.set(req.ip, count);
  if (count > RATE_LIMIT) {
    return res.status(429).json({ error: 'Trop de requêtes. Réessaie dans une minute.' });
  }
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', (req, res) => res.json({ ok: true, demo: DEMO }));

// Valide le tag, exécute le handler et traduit les erreurs en réponses JSON.
const withTag = (handler) => async (req, res) => {
  const tag = req.params.tag.toUpperCase().replace(/^#/, '').replace(/O/g, '0');
  if (!TAG_PATTERN.test(tag)) {
    return res.status(400).json({ error: 'Tag invalide.' });
  }
  try {
    res.json({ demo: DEMO, ...(await handler(tag)) });
  } catch (err) {
    if (err instanceof CocApiError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

app.get('/api/clans/search', async (req, res) => {
  const name = String(req.query.name ?? '').trim();
  if (name.length < 3 || name.length > 50) {
    return res.status(400).json({ error: 'Le nom doit contenir entre 3 et 50 caractères.' });
  }
  try {
    const clans = DEMO
      ? buildDemoSearch(name)
      : ((await searchClans(name, TOKEN)).items ?? []).map(toClanSummaryDto);
    res.json({ demo: DEMO, clans });
  } catch (err) {
    if (err instanceof CocApiError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

app.get(
  '/api/clan/:tag',
  withTag(async (tag) => ({
    clan: DEMO ? buildDemoClan(tag) : toClanDto(await fetchClan(tag, TOKEN)),
  })),
);

app.get(
  '/api/clan/:tag/war',
  withTag(async (tag) => {
    if (DEMO) return { war: buildDemoWar(tag) };
    try {
      return { war: toWarDto(await fetchCurrentWar(tag, TOKEN)) };
    } catch (err) {
      // Le clan vient d'être chargé avec ce même token : un 403 ici
      // signifie que son journal de guerre est privé.
      if (err instanceof CocApiError && err.status === 403) return { war: { state: 'private' } };
      throw err;
    }
  }),
);

app.get(
  '/api/clan/:tag/warlog',
  withTag(async (tag) => {
    if (DEMO) return { private: false, wars: buildDemoWarLog() };
    try {
      return { private: false, wars: toWarLogDto(await fetchWarLog(tag, TOKEN)) };
    } catch (err) {
      if (err instanceof CocApiError && err.status === 403) return { private: true, wars: [] };
      throw err;
    }
  }),
);

app.get(
  '/api/clan/:tag/league',
  withTag(async (tag) => {
    if (DEMO) return { league: buildDemoLeague() };
    try {
      return { league: await loadLeague(tag, TOKEN) };
    } catch (err) {
      // 404 : le clan ne participe pas à la ligue ce mois-ci.
      if (err instanceof CocApiError && err.status === 404) return { league: { state: 'none' } };
      throw err;
    }
  }),
);

app.get(
  '/api/clan/:tag/raids',
  withTag(async (tag) => ({
    raid: DEMO ? buildDemoRaids() : toRaidDto(await fetchRaidSeasons(tag, TOKEN)),
  })),
);

app.get(
  '/api/player/:tag',
  withTag(async (tag) => {
    if (!DEMO) return { player: toPlayerDto(await fetchPlayer(tag, TOKEN)) };
    const player = buildDemoPlayer(tag);
    if (!player) throw new CocApiError(404, 'Joueur introuvable.');
    return { player };
  }),
);

// En production, le même serveur sert le front compilé (npm run build).
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (fs.existsSync(dist)) {
  // Les fichiers de /assets ont un nom unique par version : cache long.
  app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use(express.static(dist, { maxAge: '1h' }));
  app.use('/api', (req, res) => res.status(404).json({ error: 'Route inconnue.' }));
  app.use((req, res) => res.set('Cache-Control', 'no-cache').sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`API Clash Creator AI sur http://localhost:${PORT}`);
  if (DEMO) console.log('COC_API_TOKEN absent : mode démo (données fictives).');
});
