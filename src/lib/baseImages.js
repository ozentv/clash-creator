// Captures de bases déposées dans src/assets/bases (voir src/data/README.md).
const files = import.meta.glob('../assets/bases/*.{png,webp,jpg,jpeg}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const images = new Map(Object.entries(files).map(([path, url]) => [path.split('/').pop(), url]));

export const baseImageUrl = (file) => (file ? (images.get(file) ?? null) : null);
