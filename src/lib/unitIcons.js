// Images des unités déposées dans src/assets/units (voir le README de ce dossier).
// Vite dresse la liste au moment du build : aucune requête n'est faite pour une image absente.
const files = import.meta.glob('../assets/units/*.{png,webp,svg,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const unitSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const icons = new Map(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.\w+$/, ''), url]),
);

export const unitIconUrl = (name) => icons.get(unitSlug(name)) ?? null;
