import type { CoverProps } from "./types";

// Chúng Mình — a hand-drawn chibi couple standing in front of the photo "window",
// holding hands under a heart, with a speech bubble. Skin, hair and clothes are
// built from the palette (no raw colours); faces are two dots and a smile.
const SKIN = "color-mix(in srgb, var(--cv-gold) 28%, white)";
const BLUSH = "color-mix(in srgb, var(--cv-deep) 22%, white)";

export function ChibiStoryCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-chibi-story">
      <i className="cv-chibi-story__sun" aria-hidden="true" />
      <div className="cv-chibi-story__bubble">chúng mình cưới nhau nhé!</div>
      <div className="cv-chibi-story__photo">{slot(0, "Ảnh cưới", true)}</div>
      <svg className="cv-chibi-story__couple" viewBox="0 0 100 100" aria-hidden="true">
        <ellipse cx="50" cy="94" rx="36" ry="3.4" fill="var(--cv-deep)" opacity="0.18" />
        <g>
          <rect x="24" y="76" width="5" height="16" rx="2.4" fill="var(--cv-deep)" />
          <rect x="34" y="76" width="5" height="16" rx="2.4" fill="var(--cv-deep)" />
          <path d="M20 54h24a4 4 0 0 1 4 4v22H16V58a4 4 0 0 1 4-4Z" fill="var(--cv-deep)" />
          <path d="M32 54l-6 8l6 8l6-8Z" fill="white" />
          <path d="M32 59l-2 3l2 6l2-6Z" fill="var(--cv-gold)" />
          <circle cx="32" cy="38" r="14" fill={SKIN} />
          <path d="M18 36C18 24 26 20 32 20S46 24 46 36C42 30 36 28 32 28S22 30 18 36Z" fill="var(--cv-deep)" />
          <circle cx="27" cy="40" r="1.7" fill="var(--cv-deep)" />
          <circle cx="37" cy="40" r="1.7" fill="var(--cv-deep)" />
          <path d="M28.5 45q3.5 3 7 0" fill="none" stroke="var(--cv-deep)" strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="23.6" cy="44" r="2.2" fill={BLUSH} />
          <circle cx="40.4" cy="44" r="2.2" fill={BLUSH} />
        </g>
        <g>
          <path d="M52 82C52 70 58 56 68 56S84 70 84 82Z" fill="white" stroke="var(--cv-deep)" strokeWidth="0.8" strokeLinejoin="round" />
          <path d="M60 80C62 72 66 66 68 62C70 66 74 72 76 80Z" fill="var(--cv-paper)" opacity="0.7" />
          <rect x="60" y="82" width="4" height="10" rx="2" fill={SKIN} />
          <rect x="72" y="82" width="4" height="10" rx="2" fill={SKIN} />
          <path d="M52 34C52 22 60 18 68 18S84 22 84 34V52C80 50 78 44 78 38H58C58 44 56 50 52 52Z" fill="var(--cv-deep)" />
          <path d="M54 30C54 18 62 14 68 14S82 18 82 30" fill="none" stroke="white" strokeWidth="1.2" opacity="0.8" />
          <circle cx="68" cy="38" r="14" fill={SKIN} />
          <path d="M54 34C58 26 64 22 68 22S78 26 82 34C76 30 72 28 68 28S60 30 54 34Z" fill="var(--cv-deep)" />
          <circle cx="63" cy="40" r="1.7" fill="var(--cv-deep)" />
          <circle cx="73" cy="40" r="1.7" fill="var(--cv-deep)" />
          <path d="M64.5 45q3.5 3 7 0" fill="none" stroke="var(--cv-deep)" strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="59.6" cy="44" r="2.2" fill={BLUSH} />
          <circle cx="76.4" cy="44" r="2.2" fill={BLUSH} />
          <path d="M60 24l8-8l8 8" fill="none" stroke="var(--cv-gold)" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
        </g>
        <circle cx="48" cy="70" r="3.2" fill={SKIN} />
        <path d="M45 66C45 60 51 60 51 66" fill="none" stroke="var(--cv-gold)" strokeWidth="0" />
        <path d="M50 52C44 46 40 49 44 54L50 60L56 54C60 49 56 46 50 52Z" fill="var(--cv-deep)" className="cv-chibi-story__heart" />
      </svg>
      <p className="cv-names cv-chibi-story__names">
        {b} <span className="cv-chibi-story__amp">&amp;</span> {a}
      </p>
      <p className="cv-date cv-chibi-story__date">{date}</p>
      {place && <p className="cv-place cv-chibi-story__place">{place}</p>}
    </div>
  );
}
