import type { CoverProps } from "./types";

// Mực Loang — thủy mặc: an enso brush ring (drawn with a rough displacement
// edge and a gap at the crest) holds the photo; ink mist drifts behind, three
// far-mountain washes sit low, two birds cross the mist, and a small seal
// stamps the top-right corner. Names live in a bottom-anchored wrapper.
const SPLASH: [number, number, number][] = [
  [86, 52, 1.4],
  [90, 58, 0.8],
  [12, 94, 1.1],
  [8, 88, 0.6],
  [82, 104, 0.7],
  [16, 40, 0.7],
];

export function InkWashCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-ink-wash">
      <svg className="cv-ink-wash__art" viewBox="0 0 100 178" fill="currentColor" aria-hidden="true">
        <defs>
          <filter id="cv-ink-rough" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" />
          </filter>
          <filter id="cv-ink-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>
          <filter id="cv-ink-edge">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
        </defs>
        <g className="cv-ink-wash__mist" filter="url(#cv-ink-soft)">
          <ellipse cx="88" cy="22" rx="32" ry="10" opacity="0.1" />
          <ellipse cx="6" cy="64" rx="22" ry="8" opacity="0.08" />
          <ellipse cx="50" cy="176" rx="70" ry="14" opacity="0.2" />
        </g>
        <g fill="none" stroke="currentColor" strokeLinecap="round" opacity="0.7">
          <path d="M14 44c1.6-1.8 3.4-1.8 5 0 1.6-1.8 3.4-1.8 5 0" strokeWidth="0.7" />
          <path d="M70 30c1.2-1.4 2.6-1.4 3.8 0 1.2-1.4 2.6-1.4 3.8 0" strokeWidth="0.6" />
        </g>
        <g filter="url(#cv-ink-edge)">
          <path d="M0 150C10 138 18 142 26 132S44 134 54 124 74 130 84 120 96 126 100 120V178H0Z" opacity="0.1" />
          <path d="M0 160C12 150 20 156 32 146S52 152 64 142 86 150 100 140V178H0Z" opacity="0.16" />
          <path d="M0 170C14 164 26 168 40 162S68 166 80 160 94 164 100 160V178H0Z" opacity="0.26" />
        </g>
        <g
          className="cv-ink-wash__ring"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          filter="url(#cv-ink-rough)"
        >
          <path d="M78 62A30 30 0 1 0 74 44" strokeWidth="2.6" opacity="0.92" />
          <path d="M22 84A30 30 0 0 1 36 44" strokeWidth="1.2" opacity="0.5" transform="rotate(-24 50 70) scale(1.07) translate(-3.7 -5)" />
          <path d="M80 56A31 31 0 0 1 70 96" strokeWidth="4" opacity="0.35" />
          <circle cx="76" cy="46" r="1.6" stroke="none" opacity="0.8" />
        </g>
        <g opacity="0.8">
          {SPLASH.map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
      </svg>
      <span className="cv-kicker cv-ink-wash__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <span className="cv-ink-wash__seal" aria-hidden="true">
        囍
      </span>
      <div className="cv-ink-wash__photo">{slot(0, "Mẫu thiệp cưới Mực Loang phong cách thủy mặc mực loang", true)}</div>
      <div className="cv-ink-wash__text">
        <p className="cv-names cv-ink-wash__names">
          {b} <span className="cv-ink-wash__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-ink-wash__date">{date}</p>
        {place && <p className="cv-place cv-ink-wash__place">{place}</p>}
      </div>
    </div>
  );
}
