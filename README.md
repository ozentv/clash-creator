# Clash Creator AI

Analyse un clan Clash of Clans et transforme ses stats en contenu TikTok :
classements trophées / dons, cartes de statistiques, texte TikTok généré et export PNG.

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigne COC_API_TOKEN
npm run dev            # front : http://localhost:5173 — API : http://localhost:3001
```

Sans `COC_API_TOKEN`, l'application tourne en **mode démo** avec un clan fictif.

### Obtenir un token

1. Crée un compte sur https://developer.clashofclans.com
2. *My Account → Create New Key*, en indiquant l'adresse IP publique de la machine
   qui exécute le serveur (les clés sont liées à une IP).
3. Copie la clé dans `.env`.

### Production

```bash
npm run build
npm start              # sert l'API et le front compilé sur le port 3001
```

## Architecture

```
server/               Proxy Express : garde le token secret et contourne l'absence de CORS
  index.js            Routes HTTP (GET /api/clan/:tag)
  cocClient.js        Appel à l'API officielle + mapping des erreurs
  tiktokAi.js         Génération IA du texte TikTok (facultative)
  demoData.js         Clan fictif du mode démo
src/
  api/clashApi.js     Appels du front vers le proxy
  hooks/useClan.js    État de chargement du clan
  lib/                Logique pure (tag, classements, stats, texte TikTok, export PNG)
  components/         Composants React (recherche, en-tête, stats, classement, TikTok, membres)
```

## Texte TikTok

Par défaut, le texte est généré localement à partir de modèles alimentés par les stats du clan
(`src/lib/tiktok.js`) : aucun service externe ni clé supplémentaire n'est nécessaire.

Si `ANTHROPIC_API_KEY` est renseigné dans `.env`, un bouton « Générer avec l'IA » apparaît :
le serveur (`server/tiktokAi.js`) envoie les stats du clan à Claude, qui rédige un texte original.
Chaque génération est facturée sur le compte lié à la clé.
