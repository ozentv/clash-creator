# Clash Creator AI

Analyse un clan Clash of Clans : classements trophées / dons, cartes de statistiques,
liste des membres et export PNG du classement.

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

### Déploiement sur Render

Le fichier `render.yaml` décrit le service. Sur https://dashboard.render.com :
*New → Blueprint*, choisis ce dépôt, puis renseigne `COC_API_TOKEN`.
Render n'a pas d'adresse IP sortante unique (il fournit des plages, que le portail Clash of Clans
refuse). Il faut donc passer par un proxy à IP fixe, par exemple celui de RoyaleAPI
(https://docs.royaleapi.com/proxy.html) : autorise l'adresse IP du proxy dans la clé, puis définis
`COC_API_BASE_URL=https://cocproxy.royaleapi.dev/v1` dans l'onglet *Environment* du service.

## Architecture

```
server/               Proxy Express : garde le token secret et contourne l'absence de CORS
  index.js            Routes HTTP (GET /api/clan/:tag)
  cocClient.js        Appel à l'API officielle + mapping des erreurs
  demoData.js         Clan fictif du mode démo
src/
  api/clashApi.js     Appels du front vers le proxy
  hooks/useClan.js    État de chargement du clan
  lib/                Logique pure (tag, classements, stats, export PNG)
  components/         Composants React (recherche, en-tête, stats, classement, membres)
```
