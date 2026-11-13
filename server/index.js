import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { fetchClan, toClanDto, CocApiError } from './cocClient.js';
import { buildDemoClan } from './demoData.js';
import { aiEnabled, generateWithAi, isValidStyle, AiError } from './tiktokAi.js';

const PORT = process.env.PORT ?? 3001;
const TOKEN = process.env.COC_API_TOKEN?.trim();
const TAG_PATTERN = /^[0289PYLQGRJCUV]{3,12}$/;

const app = express();
app.use(express.json({ limit: '100kb' }));

app.get('/api/clan/:tag', async (req, res) => {
  const tag = req.params.tag.toUpperCase().replace(/^#/, '').replace(/O/g, '0');
  if (!TAG_PATTERN.test(tag)) {
    return res.status(400).json({ error: 'Tag de clan invalide.' });
  }
  if (!TOKEN) {
    return res.json({ demo: true, ai: aiEnabled, clan: buildDemoClan(tag) });
  }
  try {
    const raw = await fetchClan(tag, TOKEN);
    res.json({ demo: false, ai: aiEnabled, clan: toClanDto(raw) });
  } catch (err) {
    if (err instanceof CocApiError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Plafond global de générations IA par heure : le site étant public,
// il borne le coût sur le compte lié à ANTHROPIC_API_KEY.
const AI_HOURLY_LIMIT = Number(process.env.AI_HOURLY_LIMIT) || 20;
let aiCalls = [];
function takeAiSlot() {
  const hourAgo = Date.now() - 3_600_000;
  aiCalls = aiCalls.filter((t) => t > hourAgo);
  if (aiCalls.length >= AI_HOURLY_LIMIT) return false;
  aiCalls.push(Date.now());
  return true;
}

function isValidClan(clan) {
  return (
    clan &&
    typeof clan.name === 'string' &&
    typeof clan.tag === 'string' &&
    Array.isArray(clan.members) &&
    clan.members.length > 0 &&
    clan.members.length <= 50 &&
    clan.members.every(
      (m) =>
        m &&
        typeof m.name === 'string' &&
        Number.isFinite(m.trophies) &&
        Number.isFinite(m.donations),
    )
  );
}

app.post('/api/tiktok', async (req, res) => {
  if (!aiEnabled) {
    return res.status(503).json({ error: "Génération IA non configurée (ANTHROPIC_API_KEY absent)." });
  }
  const { clan, style } = req.body ?? {};
  if (!isValidStyle(style) || !isValidClan(clan)) {
    return res.status(400).json({ error: 'Requête invalide.' });
  }
  if (!takeAiSlot()) {
    return res.status(429).json({ error: 'Quota horaire de générations IA atteint. Réessaie plus tard.' });
  }
  try {
    res.json({ text: await generateWithAi(clan, style) });
  } catch (err) {
    if (err instanceof AiError) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// En production, le même serveur sert le front compilé (npm run build).
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`API Clash Creator AI sur http://localhost:${PORT}`);
  if (!TOKEN) console.log('COC_API_TOKEN absent : mode démo (données fictives).');
  console.log(aiEnabled ? 'Texte TikTok : génération IA activée.' : 'Texte TikTok : modèles locaux (ANTHROPIC_API_KEY absent).');
});
