// Illustration animée du bandeau : collines au couchant, étoiles et nuages.
const STARS = Array.from({ length: 22 }, (_, i) => ({
  cx: (i * 53 + 20) % 1200,
  cy: (i * 29) % 130 + 8,
  r: 0.8 + (i % 3) * 0.5,
  delay: (i % 7) * 0.45,
}));

function Cloud({ y, scale, duration, delay, opacity }) {
  return (
    <g className="cloud" style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
      <g transform={`translate(0 ${y}) scale(${scale})`} fill="#fff" opacity={opacity}>
        <ellipse cx="60" cy="20" rx="60" ry="14" />
        <ellipse cx="95" cy="10" rx="38" ry="14" />
        <ellipse cx="35" cy="12" rx="28" ry="10" />
      </g>
    </g>
  );
}

export default function HeroArt() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2a55" />
          <stop offset="0.55" stopColor="#b8683f" />
          <stop offset="1" stopColor="#e9b25a" />
        </linearGradient>
        <radialGradient id="sun" cx="0.72" cy="0.62" r="0.35">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="400" fill="url(#sky)" />
      {STARS.map((s, i) => (
        <circle
          key={i}
          className="star"
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#fff"
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}
      <rect className="sun" width="1200" height="400" fill="url(#sun)" />
      <Cloud y={70} scale={1.5} duration={90} delay={-20} opacity={0.16} />
      <Cloud y={130} scale={1} duration={70} delay={-50} opacity={0.12} />
      <Cloud y={40} scale={0.8} duration={110} delay={-80} opacity={0.1} />
      <path d="M0 270 Q200 190 420 250 T820 230 T1200 260 V400 H0Z" fill="#5d6b3a" />
      <path d="M0 310 Q260 240 520 300 T980 280 T1200 310 V400 H0Z" fill="#3f5230" />
      <path d="M0 350 Q300 300 620 345 T1200 335 V400 H0Z" fill="#26361f" />
      <g fill="#2a2333" opacity="0.85" transform="translate(150 -6)">
        <rect x="880" y="196" width="26" height="60" />
        <path d="M874 196h38l-6-14h-26z" />
        <rect x="930" y="214" width="20" height="44" />
        <path d="M925 214h30l-5-11h-20z" />
        <rect x="906" y="232" width="24" height="26" />
        <rect className="star" x="889" y="212" width="7" height="9" fill="#ffd978" />
        <rect className="star" x="937" y="226" width="6" height="8" fill="#ffd978" style={{ animationDelay: '1.2s' }} />
      </g>
    </svg>
  );
}
