# Clash Creator

Analyse un clan Clash of Clans à partir de son nom ou de son tag.

- **Aperçu** : chiffres clés, cinq classements exportables en PNG (trophées, dons, bilan des dons,
  niveau, hôtel de ville), composition du clan et membres probablement inactifs.
- **Guerres** : guerre en cours, ligue de guerre de clans, historique des guerres.
- **Capitale** : week-end de raid, attaques et or pillé par membre.
- **Membres** : tableau triable et filtrable.
- **Comparer** : deux clans côte à côte.

- **Page joueur** : fiche complète d'un compte, accessible par tag ou en cliquant sur un pseudo —
  profil, armée (héros, équipements, familiers, troupes, sorts, engins), carrière et succès.
- **Bibliothèque** : pages Compositions et Bases, alimentées par les fichiers de `src/data`
  (voir `src/data/README.md`), avec les liens de partage du jeu.

L'adresse reflète la page affichée (`?clan=TAG&tab=guerres`, `?joueur=TAG&vue=armee`,
`?page=compositions`) : tout lien est partageable et le bouton « précédent » fonctionne.
Les clans consultés sont mémorisés dans le navigateur.

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigne COC_API_TOKEN
npm run dev            # front : http://localhost:5173 — API : http://localhost:3001
```

Sans `COC_API_TOKEN`, l'application tourne en **mode démo** avec des données fictives.

```bash
npm test               # tests unitaires (logique et conversion des réponses de l'API)
```

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
  index.js            Routes /api, en-têtes de sécurité, limite de débit, fichiers statiques
  cocClient.js        Appels à l'API officielle (avec cache), erreurs, conversion des réponses
  demoData.js         Données fictives du mode démo
src/
  api/clashApi.js     Appels du front vers le proxy
  hooks/              useRoute (navigation), useClan, useAsync, useRecentClans, useReveal, useSpotlight
  lib/                Logique pure : tag, classements, statistiques, formats, export PNG
  data/               Bibliothèque : compositions.json et bases.json
  assets/             Images facultatives : units/ (icônes d'unités), bases/ (captures de bases)
  components/         Landing, ClanView, PlayerPage, Library et leurs panneaux
tests/                Tests node:test de lib/ et de server/
```

## Routes de l'API

| Route | Contenu |
| --- | --- |
| `GET /api/health` | État du serveur |
| `GET /api/clans/search?name=` | Recherche de clans par nom |
| `GET /api/clan/:tag` | Clan et membres |
| `GET /api/clan/:tag/war` | Guerre en cours |
| `GET /api/clan/:tag/warlog` | Historique des guerres |
| `GET /api/clan/:tag/league` | Ligue de guerre de clans |
| `GET /api/clan/:tag/raids` | Dernier week-end de raid |
| `GET /api/player/:tag` | Fiche joueur |

Ce contenu n'est pas affilié à, approuvé, sponsorisé ou spécifiquement validé par Supercell,
et Supercell n'en est pas responsable.
