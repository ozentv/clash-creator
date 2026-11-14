// Carte de section dont le contenu dépend d'un chargement (voir useAsync).
export default function AsyncSection({ icon: Icon, title, state, children }) {
  return (
    <section className="card overflow-hidden">
      <h3 className="section-label border-b border-white/[0.08] p-4">
        <Icon className="size-4 text-accent-400" aria-hidden="true" />
        {title}
      </h3>
      {state.status === 'loading' && (
        <div role="status" aria-label="Chargement" className="flex flex-col gap-3 p-4">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
        </div>
      )}
      {state.status === 'error' && (
        <p role="alert" className="p-4 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.status === 'success' && <div className="rise">{children(state.data)}</div>}
    </section>
  );
}
