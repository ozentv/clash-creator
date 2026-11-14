import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { fetchClan, toClanDto, CocApiError } from './cocClient.js';
import { buildDemoClan } from './demoData.js';

const PORT = process.env.PORT ?? 3001;
const TOKEN = process.env.COC_API_TOKEN?.trim();
const TAG_PATTERN = /^[0289PYLQGRJCUV]{3,12}$/;

const app = express();

app.get('/api/clan/:tag', async (req, res) => {
  const tag = req.params.tag.toUpperCase().replace(/^#/, '').replace(/O/g, '0');
  if (!TAG_PATTERN.test(tag)) {
    return res.status(400).json({ error: 'Tag de clan invalide.' });
  }
  if (!TOKEN) {
    return res.json({ demo: true, clan: buildDemoClan(tag) });
  }
  try {
    const raw = await fetchClan(tag, TOKEN);
    res.json({ demo: false, clan: toClanDto(raw) });
  } catch (err) {
    if (err instanceof CocApiError) {
      return res.status(err.status).json({ error: err.message });
    }
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
});
