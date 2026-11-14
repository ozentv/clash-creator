// Barre d'onglets collante, navigable avec les flèches gauche et droite.
export default function Tabs({ tabs, current, onChange, label, idPrefix }) {
  function onKeyDown(e) {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const index = tabs.findIndex(([key]) => key === current);
    const next = tabs[(index + delta + tabs.length) % tabs.length][0];
    onChange(next);
    document.getElementById(`${idPrefix}-${next}`)?.focus();
  }

  return (
    <div className="sticky top-14 z-10 -mx-4 border-b border-white/[0.08] bg-ink-950/80 px-4 backdrop-blur-xl">
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex gap-6 overflow-x-auto">
        {tabs.map(([key, text, Icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`${idPrefix}-${key}`}
            aria-selected={current === key}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={current === key ? 0 : -1}
            className="tab"
            onClick={() => onChange(key)}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
