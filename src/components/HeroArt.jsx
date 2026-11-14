// Illustration d'arrière-plan du bandeau : paysage de collines au couchant.
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
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="400" fill="url(#sky)" />
      <rect width="1200" height="400" fill="url(#sun)" />
      <path d="M0 270 Q200 190 420 250 T820 230 T1200 260 V400 H0Z" fill="#5d6b3a" />
      <path d="M0 310 Q260 240 520 300 T980 280 T1200 310 V400 H0Z" fill="#3f5230" />
      <path d="M0 350 Q300 300 620 345 T1200 335 V400 H0Z" fill="#26361f" />
      <g fill="#2a2333" opacity="0.85" transform="translate(150 -6)">
        <rect x="880" y="196" width="26" height="60" />
        <path d="M874 196h38l-6-14h-26z" />
        <rect x="930" y="214" width="20" height="44" />
        <path d="M925 214h30l-5-11h-20z" />
        <rect x="906" y="232" width="24" height="26" />
      </g>
    </svg>
  );
}
