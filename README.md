# Clash Creator

Analyse un clan Clash of Clans à partir de son nom ou de son tag.

- **Aperçu** : chiffres clés, cinq classements exportables en image (trophées, dons, bilan des dons,
  niveau, hôtel de ville), composition du clan et membres probablement inactifs.
- **Guerres** : guerre en cours, plan d'attaque partageable par lien, ligue de guerre de clans,
  bilan de chaque membre sur les guerres enregistrées (étoiles, attaques manquées), historique.
- **Capitale** : week-end de raid, attaques et or pillé par membre.
- **Membres** : tableau triable et filtrable.
- **Évolution** : courbes des trophées, des membres et des dons, arrivées et départs
  (un relevé par jour, voir « Historique » plus bas).
- **Comparer** : deux clans côte à côte.

- **Page joueur** : fiche complète d'un compte, accessible par tag ou en cliquant sur un pseudo —
  profil, armée, unités restant à améliorer, carrière, succès et comparaison avec un autre joueur.
- **Bibliothèque** : pages Compositions et Bases avec les liens de partage du jeu, alimentées par
  les fichiers de `src/data` et, si une base de données est configurée, par un formulaire
  protégé par mot de passe (bouton « Gérer »). Avec un clan ouvert, chaque composition indique
  quels membres peuvent la jouer.
- **Classements** : meilleurs clans et joueurs par pays ou dans le monde.
- **Bandeau des événements** : week-end de raid, jeux de clan, ligue de clans et fin de saison,
  d'après leurs horaires habituels.

Les classements, la guerre, les raids et la page joueur s'exportent en image, au format normal
ou en story verticale (1080 × 1920).

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

### Ajout de fiches depuis le site (facultatif)

Sans configuration, la bibliothèque est en lecture seule et ne contient que les fiches de `src/data`.
Pour activer le bouton « Gérer », définis deux variables d'environnement :

- `DATABASE_URL` : adresse de connexion d'une base PostgreSQL. La table est créée automatiquement.
- `ADMIN_PASSWORD` : mot de passe du mode gestion, 8 caractères minimum.

Dix mots de passe erronés depuis la même adresse bloquent les tentatives pendant dix minutes.

### Historique (facultatif)

Avec `DATABASE_URL`, le site enregistre un relevé de chaque clan consulté, une fois par jour
(conservé 180 jours), ainsi que le détail de chaque guerre vue dans l'onglet Guerres (conservé un an),
car le jeu ne fournit le détail par membre que pour la guerre en cours. Sans visite, pas de relevé : pour un suivi sans trou, fais appeler
`/api/cron/snapshot` toutes les heures par un service de surveillance (UptimeRobot, cron-job.org…).
Cet appel met à jour tous les clans consultés dans les 30 derniers jours, et évite au passage que
le service ne s'endorme sur l'offre gratuite de Render.

## Architecture

```
server/               Proxy Express : garde le token secret et contourne l'absence de CORS
  index.js            Routes /api, en-têtes de sécurité, limite de débit, fichiers statiques
  cocClient.js        Appels à l'API officielle (avec cache), erreurs, conversion des réponses
  db.js               Connexion PostgreSQL partagée
  libraryStore.js     Bibliothèque : fichiers de src/data + fiches enregistrées en base
  historyStore.js     Relevés quotidiens des clans, séries et mouvements de membres
  demoData.js         Données fictives du mode démo
src/
  api/clashApi.js     Appels du front vers le proxy
  hooks/              useRoute (navigation), useClan, useAsync, useRecentClans, useReveal, useSpotlight
  lib/                Logique pure : tag, classements, statistiques, formats, noms français,
                      export en image, messages de confirmation
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
| `GET /api/clan/:tag/history`, `GET /api/player/:tag/history` | Relevés quotidiens |
| `GET /api/clan/:tag/war-stats` | Bilan des membres sur les guerres enregistrées |
| `GET /api/clan/:tag/roster` | Niveaux des unités de chaque membre |
| `GET /api/rankings/locations`, `GET /api/rankings/:pays/:type` | Classements par pays |
| `GET /api/cron/snapshot` | Mise à jour planifiée des relevés |
| `GET /api/library` | Compositions et bases |
| `POST /api/library/:kind`, `DELETE /api/library/:id` | Ajout et suppression (mot de passe requis) |

Ce contenu n'est pas affilié à, approuvé, sponsorisé ou spécifiquement validé par Supercell,
et Supercell n'en est pas responsable.
