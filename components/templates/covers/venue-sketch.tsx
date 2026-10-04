import type { CoverProps } from "./types";

// Nơi Mình Hẹn — the venue as a line drawing: a small pavilion with arched
// doors, bunting, two trees and a path, under a low sun. One SVG, one colour.
export function VenueSketchCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-venue-sketch">
      <span className="cv-kicker cv-venue-sketch__kicker">NƠI MÌNH HẸN</span>
      <svg className="cv-venue-sketch__art" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="76" cy="30" r="13" fill="var(--cv-gold)" stroke="none" opacity="0.55" />
        <path d="M0 74C18 66 30 70 50 66S84 62 100 68V100H0Z" fill="currentColor" fillOpacity="0.08" stroke="none" />
        <path d="M6 44C28 54 72 54 94 44" />
        <path d="M14 48.6l2.6 6 2.6-5.6M26 51l2.6 6 2.6-5.8M38 52.6l2.6 6 2.6-5.8M50 53l2.6 6 2.6-5.8M62 52.6l2.6 6 2.6-5.8M74 51l2.6 6 2.6-5.8M86 48.4l2.6 6 2.6-5.6" fill="var(--cv-gold)" fillOpacity="0.7" strokeWidth="0.6" />
        <path d="M22 62L50 34L78 62Z" fill="var(--cv-paper)" />
        <path d="M26 62H74V88H26Z" fill="var(--cv-paper)" />
        <path d="M42 88V76C42 70 46 67 50 67S58 70 58 76V88" fill="currentColor" fillOpacity="0.18" />
        <path d="M31 80V74C31 70 34 69 36 69S41 70 41 74V80ZM59 80V74C59 70 62 69 64 69S69 70 69 74V80Z" fill="currentColor" fillOpacity="0.14" />
        <path d="M46 56a4 4 0 1 1 8 0a4 4 0 1 1-8 0Z" />
        <path d="M30 62V88M70 62V88" strokeWidth="0.6" />
        <path d="M44 88L36 100M56 88L64 100" />
        <path d="M10 88V70M10 70C2 70 2 58 10 56 18 58 18 70 10 70Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M90 88V72M90 72C83 72 83 62 90 60 97 62 97 72 90 72Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M0 88H100" strokeWidth="0.6" opacity="0.7" />
      </svg>
      <div className="cv-venue-sketch__photo">{slot(0, "Ảnh cưới", true)}</div>
      <p className="cv-names cv-venue-sketch__names">
        {b} <span className="cv-venue-sketch__amp">&amp;</span> {a}
      </p>
      <p className="cv-date cv-venue-sketch__date">{date}</p>
      {place && <p className="cv-place cv-venue-sketch__place">{place}</p>}
    </div>
  );
}
