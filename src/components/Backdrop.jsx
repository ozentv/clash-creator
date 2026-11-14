// Fond animé de la page : halos qui dérivent, grille discrète et braises qui montent.
const EMBERS = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  size: 3 + (i % 4),
  duration: 9 + ((i * 7) % 11),
  delay: -((i * 5) % 20),
  sway: ((i % 5) - 2) * 28,
  opacity: 0.6 + (i % 4) * 0.13,
}));

export default function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="blob-a absolute -top-40 -left-40 size-[36rem] rounded-full bg-purple-600/40 blur-3xl" />
      <div className="blob-b absolute -right-40 bottom-0 size-[32rem] rounded-full bg-amber-500/25 blur-3xl" />
      <div className="blob-c absolute top-1/3 left-1/2 size-[28rem] rounded-full bg-rose-600/20 blur-3xl" />
      <div className="backdrop-grid absolute inset-0" />
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="ember absolute -bottom-2 rounded-full bg-accent-400"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            '--ember-sway': `${e.sway}px`,
            '--ember-opacity': e.opacity,
            boxShadow: '0 0 10px 2px rgb(245 197 49 / 0.75)',
          }}
        />
      ))}
    </div>
  );
}
