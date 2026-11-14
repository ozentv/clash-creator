import { useEffect, useMemo, useRef, useState } from 'react';
import { formatCompact, formatDate, formatNumber } from '../lib/format.js';

// Courbe d'une seule mesure dans le temps. Survol ou flèches du clavier : réticule et valeur du jour.
// Couleur du trait validée pour le fond sombre (contraste et clarté) ; le texte reste en gris/blanc.
const LINE = '#b88c08';
const HEIGHT = 190;
const MARGIN = { top: 14, right: 16, bottom: 26, left: 58 };

function useWidth(ref) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// Trois graduations « rondes » couvrant l'étendue des valeurs.
function scaleOf(values) {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * 0.12;
  return { min: min - pad, max: max + pad };
}

export default function LineChart({ title, points, format = formatNumber }) {
  const wrapRef = useRef(null);
  const width = useWidth(wrapRef);
  const [active, setActive] = useState(null); // index du point survolé

  const geometry = useMemo(() => {
    if (!width || points.length < 2) return null;
    const { min, max } = scaleOf(points.map((p) => p.value));
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;
    const x = (i) => MARGIN.left + (i / (points.length - 1)) * innerW;
    const y = (v) => MARGIN.top + (1 - (v - min) / (max - min)) * innerH;
    return {
      x,
      y,
      path: points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(''),
      ticks: [0, 0.5, 1].map((t) => min + (max - min) * (0.1 + t * 0.8)),
    };
  }, [width, points]);

  function onPointer(e) {
    if (!geometry) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left - MARGIN.left) / (width - MARGIN.left - MARGIN.right);
    setActive(Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1)))));
  }
  function onKeyDown(e) {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    setActive((i) => Math.max(0, Math.min(points.length - 1, (i ?? points.length - 1) + delta)));
  }

  const last = points.at(-1);
  const first = points[0];
  const change = last && first ? last.value - first.value : 0;
  const shown = active != null ? points[active] : null;

  return (
    <figure className="card overflow-hidden">
      <figcaption className="flex items-baseline justify-between gap-3 border-b border-white/[0.08] p-4">
        <span className="section-label">{title}</span>
        {last && (
          <span className="text-right">
            <span className="text-lg font-semibold text-white tabular-nums">{format(last.value)}</span>
            {points.length > 1 && (
              <span className="ml-2 text-xs text-zinc-500 tabular-nums">
                {change >= 0 ? '+' : '−'}
                {format(Math.abs(change))} sur la période
              </span>
            )}
          </span>
        )}
      </figcaption>
      <div
        ref={wrapRef}
        className="relative"
        tabIndex={0}
        role="img"
        aria-label={`${title} : de ${format(first?.value ?? 0)} le ${formatDate(first?.day)} à ${format(last?.value ?? 0)} le ${formatDate(last?.day)}. Flèches gauche et droite pour parcourir les jours.`}
        onPointerMove={onPointer}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        <svg width="100%" height={HEIGHT} aria-hidden="true">
          {geometry && (
            <>
              {geometry.ticks.map((tick) => (
                <g key={tick}>
                  <line x1={MARGIN.left} x2={width - MARGIN.right} y1={geometry.y(tick)} y2={geometry.y(tick)} stroke="rgb(255 255 255 / 0.06)" />
                  <text x={MARGIN.left - 8} y={geometry.y(tick)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#71717a">
                    {formatCompact(Math.round(tick))}
                  </text>
                </g>
              ))}
              <text x={MARGIN.left} y={HEIGHT - 8} fontSize="11" fill="#71717a">
                {formatDate(first.day)}
              </text>
              <text x={width - MARGIN.right} y={HEIGHT - 8} textAnchor="end" fontSize="11" fill="#71717a">
                {formatDate(last.day)}
              </text>
              <path d={geometry.path} fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {/* Point final : pastille de 8 px avec un anneau de la couleur du fond */}
              <circle cx={geometry.x(points.length - 1)} cy={geometry.y(last.value)} r="4" fill={LINE} stroke="#0b0b10" strokeWidth="2" />
              {shown && (
                <>
                  <line x1={geometry.x(active)} x2={geometry.x(active)} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} stroke="rgb(255 255 255 / 0.25)" />
                  <circle cx={geometry.x(active)} cy={geometry.y(shown.value)} r="5" fill={LINE} stroke="#0b0b10" strokeWidth="2" />
                </>
              )}
            </>
          )}
        </svg>
        {shown && geometry && (
          <div
            className="pointer-events-none absolute top-2 rounded-lg border border-white/15 bg-ink-800 px-2.5 py-1.5 shadow-xl shadow-black"
            style={{
              left: Math.min(Math.max(geometry.x(active), 70), width - 70),
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-sm font-semibold text-white tabular-nums">{format(shown.value)}</p>
            <p className="text-[11px] text-zinc-400">{formatDate(shown.day)}</p>
          </div>
        )}
      </div>
    </figure>
  );
}
