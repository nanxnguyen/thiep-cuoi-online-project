import type { CoverProps } from "./types";

// Tơ Hồng — one continuous silk thread: it ties a bow above the photo, loops
// once behind it, then runs down through the bottom-anchored text block,
// flourishing once under the names, once under the date and knotting under
// the place. The photo sits under the loop so the thread passes in front.
const UNDERLINE = "M28 0C40 3 60 3 72 0";

export function SilkKnotCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-silk-knot">
      <span className="cv-kicker cv-silk-knot__kicker">TRĂM NĂM HẠNH PHÚC</span>
      <div className="cv-silk-knot__photo">{slot(0, "Mẫu thiệp cưới Tơ Hồng phong cách cổ điển dải lụa", true)}</div>
      <svg className="cv-silk-knot__thread" viewBox="0 0 100 178" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
        <path d="M6-4C6 14 34 16 30 34S12 52 26 62" strokeWidth="1.5" opacity="0.9" />
        <path d="M6-4C6 14 34 16 30 34S12 52 26 62" strokeWidth="0.45" stroke="var(--cv-paper)" opacity="0.7" transform="translate(0.5 0.4)" />
        <ellipse cx="50" cy="66" rx="25" ry="22" strokeWidth="1.3" transform="rotate(-18 50 66)" />
        <ellipse cx="50" cy="66" rx="22" ry="25" strokeWidth="1.3" transform="rotate(24 50 66)" opacity="0.85" />
        <g className="cv-silk-knot__bow" strokeWidth="1.4">
          <path d="M50 42C38 30 28 42 50 42C72 42 62 30 50 42Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M50 42C46 52 40 56 33 58" />
          <path d="M50 42C54 52 60 56 67 58" />
        </g>
        <circle cx="50" cy="42" r="2" fill="currentColor" stroke="none" />
        <path d="M74 62C84 84 30 96 44 116" strokeWidth="1.5" opacity="0.9" />
        <path d="M44 116C52 128 66 128 74 138" strokeWidth="1.5" opacity="0.9" />
        <circle cx="74" cy="140" r="1.6" fill="currentColor" stroke="none" />
        <path d="M74 140c2.4 2.4 2.4 5.6 0 8-2.4-2.4-2.4-5.6 0-8Z" fill="currentColor" stroke="none" opacity="0.85" />
      </svg>
      <div className="cv-silk-knot__text">
        <p className="cv-names cv-silk-knot__names">
          {b} <span className="cv-silk-knot__amp">&amp;</span> {a}
        </p>
        <svg className="cv-silk-knot__flourish" viewBox="0 0 100 6" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
          <path d={UNDERLINE} strokeWidth="1.4" />
          <circle cx="50" cy="1.6" r="1.5" fill="currentColor" stroke="none" />
        </svg>
        <p className="cv-date cv-silk-knot__date">{date}</p>
        <svg className="cv-silk-knot__flourish cv-silk-knot__flourish--short" viewBox="0 0 100 6" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
          <path d="M36 0C44 3 56 3 64 0" strokeWidth="1.2" />
        </svg>
        {place && <p className="cv-place cv-silk-knot__place">{place}</p>}
      </div>
    </div>
  );
}
