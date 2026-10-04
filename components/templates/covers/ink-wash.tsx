import type { CoverProps } from "./types";

// Mực Loang — thủy mặc: blurred ink mist, two ranges of far mountains and a
// brush ring around the photo. Everything is one SVG layer under the text;
// the rough brush edge comes from a displacement filter, not from an image.
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
        <g filter="url(#cv-ink-soft)">
          <ellipse cx="88" cy="22" rx="32" ry="10" opacity="0.1" />
          <ellipse cx="6" cy="64" rx="22" ry="8" opacity="0.08" />
          <ellipse cx="50" cy="176" rx="70" ry="14" opacity="0.2" />
        </g>
        <g filter="url(#cv-ink-edge)">
          <path d="M0 150C10 138 18 142 26 132S44 134 54 124 74 130 84 120 96 126 100 120V178H0Z" opacity="0.1" />
          <path d="M0 160C12 150 20 156 32 146S52 152 64 142 86 150 100 140V178H0Z" opacity="0.16" />
          <path d="M0 170C14 164 26 168 40 162S68 166 80 160 94 164 100 160V178H0Z" opacity="0.26" />
        </g>
        <g fill="none" stroke="currentColor" strokeLinecap="round" filter="url(#cv-ink-rough)">
          <circle cx="50" cy="70" r="30.5" strokeWidth="2.6" opacity="0.92" />
          <path d="M22 84A30 30 0 0 1 36 44" strokeWidth="1.2" opacity="0.5" transform="rotate(-24 50 70) scale(1.07) translate(-3.7 -5)" />
          <path d="M80 56A31 31 0 0 1 70 96" strokeWidth="4" opacity="0.35" />
        </g>
        <g opacity="0.8">
          <circle cx="86" cy="52" r="1.4" />
          <circle cx="90" cy="58" r="0.8" />
          <circle cx="12" cy="94" r="1.1" />
          <circle cx="8" cy="88" r="0.6" />
          <circle cx="82" cy="104" r="0.7" />
        </g>
      </svg>
      <span className="cv-kicker cv-ink-wash__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <div className="cv-ink-wash__photo">{slot(0, "Ảnh cưới", true)}</div>
      <p className="cv-names cv-ink-wash__names">
        {b} <span className="cv-ink-wash__amp">&amp;</span> {a}
      </p>
      <p className="cv-date cv-ink-wash__date">{date}</p>
      <p className="cv-place cv-ink-wash__place">{place}</p>
      <span className="cv-ink-wash__seal" aria-hidden="true">
        囍
      </span>
    </div>
  );
}
