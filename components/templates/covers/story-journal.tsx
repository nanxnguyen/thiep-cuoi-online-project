import type { CoverProps } from "./types";

// Nhật Ký Đôi Mình — a ruled journal page on a spiral: handwritten title, a
// taped print, the milestones as three scribbled lines and the wedding date
// circled in pen. No years or dates are invented: only the cover date shows.
const RINGS = Array.from({ length: 12 }, (_, i) => i);

export function StoryJournalCover({ a, b, date, slot }: CoverProps) {
  return (
    <div className="cv-story-journal">
      <div className="cv-story-journal__spiral" aria-hidden="true">
        {RINGS.map((i) => (
          <i key={i} />
        ))}
      </div>
      <div className="cv-story-journal__sheet">
        <i className="cv-story-journal__margin" aria-hidden="true" />
        <p className="cv-story-journal__title">Nhật ký đôi mình</p>
        <figure className="cv-story-journal__print">
          <div className="cv-story-journal__photo">{slot(0, "Ảnh cưới")}</div>
          <figcaption>chúng mình</figcaption>
          <i className="cv-story-journal__tape" aria-hidden="true" />
        </figure>
        <ul className="cv-story-journal__lines">
          <li>ngày mình gặp nhau</li>
          <li>ngày mình hẹn hò</li>
          <li>
            ngày mình <b>về chung nhà</b>
          </li>
        </ul>
        <p className="cv-date cv-story-journal__date">{date}</p>
        <p className="cv-names cv-story-journal__names">
          {b} <span className="cv-story-journal__amp">&amp;</span> {a}
        </p>
      </div>
      <span className="cv-story-journal__tab cv-story-journal__tab--a" aria-hidden="true">
        GẶP
      </span>
      <span className="cv-story-journal__tab cv-story-journal__tab--b" aria-hidden="true">
        HẸN
      </span>
      <span className="cv-story-journal__tab cv-story-journal__tab--c" aria-hidden="true">
        CƯỚI
      </span>
    </div>
  );
}
