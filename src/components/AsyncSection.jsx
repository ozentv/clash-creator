// Carte de section dont le contenu dépend d'un chargement (voir useAsync).
export default function AsyncSection({ icon: Icon, title, state, children }) {
  return (
    <section className="card overflow-hidden">
      <h3 className="section-label border-b border-white/10 p-4">
        <Icon className="size-4 text-accent-400" aria-hidden="true" />
        {title}
      </h3>
      {state.status === 'loading' && <p className="p-4 text-sm text-zinc-400">Chargement…</p>}
      {state.status === 'error' && (
        <p role="alert" className="p-4 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.status === 'success' && children(state.data)}
    </section>
  );
}
