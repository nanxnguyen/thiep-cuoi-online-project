import type { CoverProps } from "./types";

// Thẻ Nổi — a paper card floats over a lattice ground with a soft shadow,
// a heart badge on its top edge, the photo, the names and an invitation pill.
// The lattice is a single SVG pattern; the pill is decoration, not a control.
export function FloatingCardCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-floating-card">
      <svg className="cv-floating-card__ground" viewBox="0 0 100 178" aria-hidden="true">
        <defs>
          <pattern id="cv-fc-lattice" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M6 0L12 6L6 12L0 6Z" fill="none" stroke="var(--cv-gold)" strokeWidth="0.3" />
            <circle cx="6" cy="6" r="0.7" fill="var(--cv-gold)" />
          </pattern>
        </defs>
        <rect width="100" height="178" fill="url(#cv-fc-lattice)" opacity="0.5" />
      </svg>
      <div className="cv-floating-card__card">
        <span className="cv-floating-card__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21C5 15 2 11.5 2 8A5 5 0 0 1 12 6A5 5 0 0 1 22 8C22 11.5 19 15 12 21Z" />
          </svg>
        </span>
        <span className="cv-kicker cv-floating-card__kicker">THIỆP MỜI</span>
        <div className="cv-floating-card__photo">{slot(0, "Ảnh cưới")}</div>
        <p className="cv-names cv-floating-card__names">
          {b}
          <span className="cv-floating-card__amp">&amp;</span>
          {a}
        </p>
        <p className="cv-date cv-floating-card__date">{date}</p>
        {place && <p className="cv-place cv-floating-card__place">{place}</p>}
        <span className="cv-floating-card__pill" aria-hidden="true">
          Mời bạn đến dự
        </span>
      </div>
    </div>
  );
}
