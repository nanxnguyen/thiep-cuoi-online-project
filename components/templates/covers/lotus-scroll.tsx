import type { CoverProps } from "./types";

// Liên Hoa — an unrolled scroll on two bamboo rods. A lotus (back petals,
// photo, front petals) cradles the photo; pads and ripples sit below the date.
// The weekday comes from the real cover date; no lunar text is invented.
const PETAL = "M0 0C8-9 8-26 0-40C-8-26-8-9 0 0Z";

function Petals({ angles, scale, fill }: { angles: number[]; scale: number; fill: string }) {
  return (
    <>
      {angles.map((angle) => (
        <path key={angle} d={PETAL} transform={`translate(50 66) rotate(${angle}) scale(${scale})`} fill={fill} />
      ))}
    </>
  );
}

function Rod({ foot }: { foot?: boolean }) {
  return (
    <div className={`cv-lotus-scroll__rod${foot ? " cv-lotus-scroll__rod--foot" : ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  );
}

export function LotusScrollCover({ a, b, date, weekday, slot }: CoverProps) {
  return (
    <div className="cv-lotus-scroll">
      <Rod />
      <div className="cv-lotus-scroll__sheet">
        <span className="cv-kicker cv-lotus-scroll__kicker">TRÂN TRỌNG BÁO TIN</span>
        <svg className="cv-lotus-scroll__bloom cv-lotus-scroll__bloom--back" viewBox="0 0 100 80" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" aria-hidden="true">
          <Petals angles={[-78, -52, -26, 0, 26, 52, 78]} scale={1.3} fill="var(--cv-paper)" />
        </svg>
        <div className="cv-lotus-scroll__photo">{slot(0, "Ảnh cưới", true)}</div>
        <svg className="cv-lotus-scroll__bloom cv-lotus-scroll__bloom--front" viewBox="0 0 100 80" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" aria-hidden="true">
          <Petals angles={[-58, -30, 0, 30, 58]} scale={0.66} fill="var(--cv-paper)" />
        </svg>
        <p className="cv-names cv-lotus-scroll__names">
          {b} <span className="cv-lotus-scroll__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-lotus-scroll__date">{date}</p>
        {weekday && <p className="cv-lotus-scroll__weekday">{weekday}</p>}
        <svg className="cv-lotus-scroll__pond" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="0.9" aria-hidden="true">
          <ellipse cx="22" cy="16" rx="18" ry="5.5" fill="currentColor" fillOpacity="0.1" />
          <path d="M22 16L30 12" strokeWidth="0.6" />
          <ellipse cx="78" cy="19" rx="15" ry="4.5" fill="currentColor" fillOpacity="0.1" />
          <path d="M78 19L84 16" strokeWidth="0.6" />
          <ellipse cx="50" cy="25" rx="30" ry="3" opacity="0.5" />
          <ellipse cx="50" cy="25" rx="40" ry="4" opacity="0.25" />
        </svg>
      </div>
      <Rod foot />
    </div>
  );
}
