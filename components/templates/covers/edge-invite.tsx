import type { CoverProps } from "./types";

// Thư Dọc — a tall portrait bleeds from the top; one solid and one hollow word
// stand along its edges like a magazine spine. Words are decorative
// (aria-hidden); the names carry the meaning.
export function EdgeInviteCover({ a, b, date, place, year, slot }: CoverProps) {
  const right = year || "CƯỚI";
  return (
    <div className="cv-edge-invite">
      <i className="cv-edge-invite__block" aria-hidden="true" />
      <span className="cv-edge-invite__word cv-edge-invite__word--l" aria-hidden="true">
        THIỆP MỜI
      </span>
      <span className="cv-edge-invite__word cv-edge-invite__word--r" aria-hidden="true" style={right.length > 5 ? { fontSize: "14cqw" } : undefined}>
        {right}
      </span>
      <div className="cv-edge-invite__photo">{slot(0, "Mẫu thiệp cưới Thư Dọc phong cách hiện đại chữ dọc")}</div>
      <span className="cv-edge-invite__no" aria-hidden="true">
        01
      </span>
      <div className="cv-edge-invite__text">
        <p className="cv-kicker cv-edge-invite__kicker">THE WEDDING OF</p>
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
