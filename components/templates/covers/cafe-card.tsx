import type { CoverProps } from "./types";

// Quán Quen — the regular café: a menu card whose "dishes" are the milestones,
// the photo sits as a coaster beside a drawn cup. All labels are fixed words;
// nothing is dated except the cover date.
export function CafeCardCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-cafe-card">
      <div className="cv-cafe-card__menu">
        <span className="cv-kicker cv-cafe-card__kicker">QUÁN QUEN · THỰC ĐƠN</span>
        <div className="cv-cafe-card__sign">
          <p className="cv-names cv-cafe-card__names">
            {b} <span className="cv-cafe-card__amp">&amp;</span> {a}
          </p>
        </div>
        <div className="cv-cafe-card__hero">
          <svg className="cv-cafe-card__cup" viewBox="0 0 60 56" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 20H44V32C44 40 38 46 26 46S8 40 8 32Z" fill="var(--cv-paper)" />
            <path d="M44 24H50C55 24 55 35 48 35H43" />
            <path d="M4 50H48" />
            <path className="cv-cafe-card__steam cv-cafe-card__steam--1" d="M16 14C11 10 21 7 16 2" strokeWidth="1" />
            <path className="cv-cafe-card__steam cv-cafe-card__steam--2" d="M26 14C21 10 31 7 26 2" strokeWidth="1" />
            <path className="cv-cafe-card__steam cv-cafe-card__steam--3" d="M36 14C31 10 41 7 36 2" strokeWidth="1" />
          </svg>
          <div className="cv-cafe-card__coaster">{slot(0, "Mẫu thiệp cưới Quán Quen phong cách cổ điển menu quán", true)}</div>
        </div>
        <ul className="cv-cafe-card__items">
          <li>
            <span>Khai vị</span>
            <i />
            <b>lần đầu gặp nhau</b>
          </li>
          <li>
            <span>Món chính</span>
            <i />
            <b>bên nhau mỗi ngày</b>
          </li>
          <li>
            <span>Tráng miệng</span>
            <i />
            <b>ngày chung đôi</b>
          </li>
        </ul>
        <div className="cv-cafe-card__foot">
          <p className="cv-date cv-cafe-card__date">{date}</p>
          {place && <p className="cv-place cv-cafe-card__place">{place}</p>}
        </div>
      </div>
    </div>
  );
}
