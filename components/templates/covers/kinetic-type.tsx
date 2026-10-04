import type { CoverProps } from "./types";

// Chữ Chuyển Nhịp — oversized names slide into place once on open, a photo band
// sits between them and the day is set as a huge outlined numeral. One run of
// the entrance; reduced motion shows the resting state immediately.
export function KineticTypeCover({ a, b, date, place, day, month, slot }: CoverProps) {
  return (
    <div className="cv-kinetic-type">
      <p className="cv-kinetic-type__strip" aria-hidden="true">
        SAVE THE DATE · SAVE THE DATE · SAVE THE DATE · SAVE THE DATE
      </p>
      <p className="cv-kinetic-type__names">
        <span className="cv-kinetic-type__line cv-kinetic-type__line--a">{b}</span>
        <span className="cv-kinetic-type__photo">{slot(0, "Ảnh cưới")}</span>
        <span className="cv-kinetic-type__line cv-kinetic-type__line--b">
          <i>&amp;</i> {a}
        </span>
      </p>
      <p className="cv-kinetic-type__day" aria-hidden="true">
        {day || "—"}
        <sup>{month ? `.${month}` : ""}</sup>
      </p>
      <p className="cv-date cv-kinetic-type__date">{date}</p>
      {place && <p className="cv-place cv-kinetic-type__place">{place}</p>}
    </div>
  );
}
