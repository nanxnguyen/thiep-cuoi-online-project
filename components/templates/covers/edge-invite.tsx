import type { CoverProps } from "./types";

// Thư Dọc — two oversized outlined words stand along the page edges and the
// portrait sits between them like a magazine cover. Words are decorative
// (aria-hidden); the names carry the meaning.
export function EdgeInviteCover({ a, b, date, place, year, slot }: CoverProps) {
  return (
    <div className="cv-edge-invite">
      <span className="cv-edge-invite__word cv-edge-invite__word--l" aria-hidden="true">
        THIỆP MỜI
      </span>
      <span className="cv-edge-invite__word cv-edge-invite__word--r" aria-hidden="true">
        {year || "CƯỚI"}
      </span>
      <div className="cv-edge-invite__photo">{slot(0, "Ảnh cưới")}</div>
      <div className="cv-edge-invite__text">
        <p className="cv-names cv-edge-invite__names">
          {b}
          <span className="cv-edge-invite__amp"> &amp; </span>
          {a}
        </p>
        <p className="cv-date cv-edge-invite__date">{date}</p>
        {place && <p className="cv-place cv-edge-invite__place">{place}</p>}
      </div>
    </div>
  );
}
