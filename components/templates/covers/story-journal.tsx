import type { CoverProps } from "./types";

// Nhật Ký Đôi Mình — a ruled journal page on a gold spiral: handwritten title,
// a taped print, two scribbled lines and the wedding date circled in pen. No
// years or dates are invented: only the cover date shows.
const RINGS = Array.from({ length: 12 }, (_, i) => i);

export function StoryJournalCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-story-journal">
      <div className="cv-story-journal__spiral" aria-hidden="true">
        {RINGS.map((i) => (
          <i key={i} />
        ))}
      </div>
      <div className="cv-story-journal__sheet">
        <i className="cv-story-journal__fold" aria-hidden="true" />
        <i className="cv-story-journal__margin" aria-hidden="true" />
        <p className="cv-story-journal__title">Nhật ký đôi mình</p>
        <figure className="cv-story-journal__print">
          <div className="cv-story-journal__photo">{slot(0, "Mẫu thiệp cưới Nhật Ký Đôi Mình phong cách nhật ký cột mốc")}</div>
          <figcaption>chúng mình</figcaption>
          <i className="cv-story-journal__tape" aria-hidden="true" />
        </figure>
        <svg className="cv-story-journal__sticker cv-story-journal__sticker--heart" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21C5 15 2 11.5 2 8A5 5 0 0 1 12 6A5 5 0 0 1 22 8C22 11.5 19 15 12 21Z" />
        </svg>
        <svg className="cv-story-journal__sticker cv-story-journal__sticker--star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2L14.8 9L22 9.6L16.5 14.4L18.2 21.6L12 17.8L5.8 21.6L7.5 14.4L2 9.6L9.2 9Z" />
        </svg>
        <div className="cv-story-journal__text">
          <ul className="cv-story-journal__lines">
            <li>ngày mình gặp nhau</li>
            <li>
              ngày mình <b>về chung nhà</b>
            </li>
          </ul>
          <p className="cv-names cv-story-journal__names">
            {b} <span className="cv-story-journal__amp">&amp;</span> {a}
          </p>
          <p className="cv-date cv-story-journal__date">
            <span>{date}</span>
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
              <path pathLength="1" d="M8 16C6 5 40 1 62 2S98 8 96 17S70 29 44 28S4 25 8 14" />
            </svg>
          </p>
          {place && <p className="cv-place cv-story-journal__place">{place}</p>}
        </div>
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
