# Bibliothèque : compositions et bases

Les pages « Compositions » et « Bases » du site lisent ces deux fichiers (en plus des fiches
ajoutées par le bouton « Gérer » quand une base de données est configurée). Pour ajouter une fiche,
ajoute un bloc dans le fichier, puis pousse la modification : le site se met à jour tout seul.
`npm test` vérifie que les fichiers sont valides.

## compositions.json

```json
{
  "id": "hybride-mineurs-cochons-hdv13",
  "nom": "Hybride mineurs et cochons",
  "hdv": 13,
  "style": "Terrestre",
  "troupes": [
    { "nom": "Miner", "nombre": 12 },
    { "nom": "Hog Rider", "nombre": 14 }
  ],
  "sorts": [{ "nom": "Healing Spell", "nombre": 4 }],
  "engin": "Siege Barracks",
  "note": "Conseil de déploiement, en une ou deux phrases.",
  "lien": "https://link.clashofclans.com/fr?action=CopyArmy&army=..."
}
```

- `id` : unique, en minuscules avec des tirets.
- `hdv` : niveau d'hôtel de ville visé.
- `troupes`, `sorts`, `engin` : noms **anglais** du jeu (`Miner`, `Rage Spell`, `Wall Wrecker`…).
  Le site les traduit et leur associe une icône.
- `lien` : dans le jeu, *Armée → Modifier l'armée → Partager → Copier le lien*.
  Seuls les liens `https://link.clashofclans.com/` sont acceptés.
- `"exemple": true` affiche un bandeau « Exemple à remplacer » ; à retirer sur tes vraies fiches.

## bases.json

```json
{
  "id": "guerre-anti-3-etoiles-hdv15",
  "nom": "Anti 3 étoiles",
  "hdv": 15,
  "type": "Guerre",
  "note": "Points forts, pièges à déplacer, etc.",
  "lien": "https://link.clashofclans.com/fr?action=OpenLayout&id=...",
  "image": "guerre-anti-3-etoiles-hdv15.jpg"
}
```

- `type` : `Guerre`, `Ligue`, `Trophées` ou `Farm`.
- `lien` : dans le jeu, *Éditeur de village → Partager → Copier le lien*.
- `image` (facultatif) : capture de la base, à déposer dans `src/assets/bases/`.
