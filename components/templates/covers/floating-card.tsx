import type { CoverProps } from "./types";

// Thẻ Nổi — a paper card floats over a layered lattice ground with a second
// card tucked behind it, a gold stamp, the photo, the names and an invitation
// pill. The lattice is a single SVG pattern; the pill is decoration.
function Corner({ cls }: { cls: string }) {
  return (
    <svg className={`cv-floating-card__corner ${cls}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden="true">
      <path d="M2 18V2H18" />
      <path d="M6 14V6H14" />
      <circle cx="2" cy="2" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function FloatingCardCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-floating-card">
      <svg className="cv-floating-card__ground" viewBox="0 0 100 178" aria-hidden="true">
        <defs>
          <pattern id="cv-fc-lattice" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M6 0L12 6L6 12L0 6Z" fill="none" stroke="var(--cv-paper)" strokeWidth="0.3" />
            <circle cx="6" cy="6" r="0.7" fill="var(--cv-paper)" />
          </pattern>
          <pattern id="cv-fc-lattice2" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 0L24 12L12 24L0 12Z" fill="none" stroke="var(--cv-gold)" strokeWidth="0.35" />
          </pattern>
        </defs>
        <rect width="100" height="178" fill="url(#cv-fc-lattice)" opacity="0.1" />
        <rect width="100" height="178" fill="url(#cv-fc-lattice2)" opacity="0.5" />
      </svg>
      <div className="cv-floating-card__back" aria-hidden="true" />
      <div className="cv-floating-card__card">
        <Corner cls="cv-floating-card__corner--tl" />
        <Corner cls="cv-floating-card__corner--tr" />
        <Corner cls="cv-floating-card__corner--bl" />
        <Corner cls="cv-floating-card__corner--br" />
        <span className="cv-floating-card__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21C5 15 2 11.5 2 8A5 5 0 0 1 12 6A5 5 0 0 1 22 8C22 11.5 19 15 12 21Z" />
          </svg>
        </span>
        <span className="cv-kicker cv-floating-card__kicker">THIỆP MỜI</span>
        <div className="cv-floating-card__photo">{slot(0, "Mẫu thiệp cưới Thẻ Nổi phong cách cổ điển thẻ nổi")}</div>
        <p className="cv-names cv-floating-card__names">
          {b}
          <span className="cv-floating-card__amp">&amp;</span>
          {a}
        </p>
        <p className="cv-date cv-floating-card__date">{date}</p>
        {place && <p className="cv-place cv-floating-card__place">{place}</p>}
        <span className="cv-floating-card__pill" aria-hidden="true">
          Mở thiệp <span aria-hidden="true">→</span>
        </span>
      </div>
    </div>
  );
}
