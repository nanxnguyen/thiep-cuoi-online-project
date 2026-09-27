import type { CSSProperties, ReactNode } from "react";
import { familyPhotos, type CoverFamily } from "@/lib/templates";
import { ThiepPreviewFull } from "./ThiepPreviewFull";
import "./thiep-preview.css";

// design/Thiep Preview.dc.html, element for element: one 9:16 cover in fifteen families (A–O), sized in container
// units so it scales with its box. Photos default to the family's sample shots (design DEF); pass "" to show the
// design's empty drop-zone frame instead (tinted ground, dashed ring, icon, caption).
export type ThiepPreviewProps = {
  family: CoverFamily;
  deep: string;
  paper: string;
  gold: string;
  /** Photo ground; design default is `${deep}1f`. */
  tint?: string;
  a: string;
  b: string;
  date: string;
  place: string;
  radius?: string;
  /** Max width of the card (design prop maxW, default 240px). */
  maxW?: string;
  /** Design `fit`. Without it the design's own rule applies: from 860px up the card is 70% of its box. */
  fit?: boolean;
  photo?: string;
  photo2?: string;
  photo3?: string;
  /** Design `full`: the sample invitation sections follow the cover. */
  full?: boolean;
  className?: string;
  style?: CSSProperties;
};

const TRACKS = [["01", "Lễ gia tiên", "09:00"], ["02", "Rước dâu", "11:00"], ["03", "Đón khách", "17:30"], ["04", "Khai tiệc", "18:30"]];
const WEEKDAYS = ["CHỦ NHẬT", "THỨ HAI", "THỨ BA", "THỨ TƯ", "THỨ NĂM", "THỨ SÁU", "THỨ BẢY"];

function Slot({ photo, caption, circle }: { photo?: string; caption: string; circle?: boolean }) {
  if (photo) return <img className="tp-slot tp-slot--img" src={photo} alt="" style={circle ? { borderRadius: "50%" } : undefined} />;
  return (
    <div className="tp-slot" style={circle ? { borderRadius: "50%" } : undefined} aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <div className="tp-slot__cap">{caption}</div>
      <i className="tp-slot__ring" style={circle ? { borderRadius: "50%" } : undefined} />
    </div>
  );
}

export function ThiepPreview(p: ThiepPreviewProps) {
  const { family: f, deep, paper, gold, a, b, date, place } = p;
  const tint = p.tint ?? `${deep}1f`;
  const parts = date.split("·").map((s) => s.trim());
  const dm = parts.slice(0, 2).join(".");
  const year = parts[2] ?? "";
  const vars = { "--tp-deep": deep, "--tp-paper": paper, "--tp-gold": gold, "--tp-tint": tint } as CSSProperties;
  const arcId = `tp-arc-${[...`${a}|${b}|${date}|${deep}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36)}`;
  const S = (photo: string | undefined, caption: string, circle?: boolean) => <Slot photo={photo} caption={caption} circle={circle} />;
  const def = familyPhotos[f];
  const ph = p.photo ?? def[0];
  const ph2 = p.photo2 ?? def[1] ?? def[0];
  const ph3 = p.photo3 ?? def[2] ?? def[0];
  const [d, m, y] = parts.map(Number);
  const when = new Date(y || 2026, (m || 1) - 1, d || 1);
  const pad = (n: number) => String(n).padStart(2, "0");

  let body: ReactNode = null;
  if (f === "A")
    body = (
      <div className="tpA">
        <div className="tpA__band">
          <span className="tpA__kicker">TRÂN TRỌNG KÍNH MỜI</span>
          <div className="tpA__row">
            <div className="tpA__side">
              <span className="tpA__label">NHÀ TRAI</span>
              <span className="tpA__name">{b}</span>
            </div>
            <span className="tpA__xi">囍</span>
            <div className="tpA__side">
              <span className="tpA__label">NHÀ GÁI</span>
              <span className="tpA__name">{a}</span>
            </div>
          </div>
        </div>
        <svg className="tpA__arc" viewBox="0 0 100 20">
          <path id={arcId} d="M5,18 Q50,-4 95,18" fill="none" />
          <text fill={gold}>
            <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
              ✦ love never fails ✦
            </textPath>
          </text>
        </svg>
        <div className="tpA__photo">{S(ph, "Ảnh cưới")}</div>
        <div className="tpA__foot">
          <span className="tpA__date">{date}</span>
          <span className="tpA__place">{place}</span>
        </div>
      </div>
    );
  else if (f === "B")
    body = (
      <div className="tpB">
        <div className="tpB__top">
          <span>SAVE THE DATE</span>
          <span>{year}</span>
        </div>
        <span className="tpB__dm">{dm}</span>
        <div className="tpB__rule" />
        <div className="tpB__photo">{S(ph, "Ảnh cưới")}</div>
        <div className="tpB__foot">
          <span className="tpB__names">
            {a} &amp; {b}
          </span>
          <span className="tpB__place">{place}</span>
        </div>
      </div>
    );
  else if (f === "C")
    body = (
      <>
        <div className="tpC__arch1" />
        <div className="tpC__arch2" />
        <div className="tpC">
          <span className="tpC__kicker">THE WEDDING OF</span>
          <span className="tpC__name">{a}</span>
          <span className="tpC__amp">&amp;</span>
          <span className="tpC__name">{b}</span>
          <div className="tpC__photo">{S(ph, "Ảnh", true)}</div>
          <span className="tpC__date">{date}</span>
          <span className="tpC__place">{place}</span>
        </div>
      </>
    );
  else if (f === "D")
    body = (
      <>
        <div className="tpD__bg" />
        <div className="tpD__frame1" />
        <div className="tpD__frame2" />
        <div className="tpD">
          <div className="tpD__orn">
            <span className="tpD__line" />
            <span className="tpD__dia" />
            <span className="tpD__line" />
          </div>
          <span className="tpD__kicker">LỄ THÀNH HÔN</span>
          <div className="tpD__photo">{S(ph, "Ảnh cưới")}</div>
          <span className="tpD__names">
            {a} &amp; {b}
          </span>
          <div className="tpD__rule" />
          <span className="tpD__date">{date}</span>
          <span className="tpD__place">{place}</span>
        </div>
      </>
    );
  else if (f === "E")
    body = (
      <>
        <div className="tpE__top">
          <span className="tpE__kicker">SAVE THE DATE</span>
          <span className="tpE__date">{date}</span>
        </div>
        <div className="tpE__env" />
        <div className="tpE__env2" />
        <div className="tpE__polaroid">
          <div className="tpE__photo">{S(ph, "Ảnh cưới")}</div>
        </div>
        <div className="tpE__seal">&amp;</div>
        <div className="tpE__names">
          {a}
          <br />
          &amp; {b}
        </div>
      </>
    );
  else if (f === "F")
    body = (
      <>
        <div className="tpF__photo">{S(ph, "Ảnh bìa")}</div>
        <div className="tpF__shadeTop" />
        <div className="tpF__shadeBot" />
        <div className="tpF">
          <div className="tpF__mast">
            <span className="tpF__title">Chung Nhà</span>
            <span className="tpF__issue">SỐ ĐẶC BIỆT</span>
          </div>
          <div className="tpF__foot">
            <span className="tpF__date">{date}</span>
            <span className="tpF__names">
              {a} &amp; {b}
            </span>
            <span className="tpF__place">{place}</span>
          </div>
        </div>
      </>
    );
  else if (f === "G")
    body = (
      <>
        <div className="tpG__bg" />
        <div className="tpG__band" />
        <div className="tpG__kicker">THE WEDDING OF</div>
        <div className="tpG__pol tpG__pol--1">
          <div className="tpG__photo">{S(ph, "Chú rể")}</div>
        </div>
        <div className="tpG__who tpG__who--b">
          <span className="tpG__rank">Trưởng Nam</span>
          <span className="tpG__name">{b}</span>
        </div>
        <div className="tpG__pol tpG__pol--2">
          <div className="tpG__photo">{S(ph2, "Cô dâu")}</div>
        </div>
        <div className="tpG__who tpG__who--a">
          <span className="tpG__rank">Út Nữ</span>
          <span className="tpG__name">{a}</span>
        </div>
        <div className="tpG__date">{date}</div>
      </>
    );
  else if (f === "H")
    body = (
      <div className="tpH">
        <div className="tpH__head">
          <div className="tpH__scallop" />
          <div className="tpH__band" />
          <div className="tpH__circle tpH__circle--l">{S(ph, "Chú rể", true)}</div>
          <div className="tpH__circle tpH__circle--r">{S(ph2, "Cô dâu", true)}</div>
          <span className="tpH__xi">囍</span>
        </div>
        <div className="tpH__names">
          <div>
            <span className="tpH__rank">Trưởng Nam</span>
            <span className="tpH__name">{b}</span>
          </div>
          <div>
            <span className="tpH__rank">Út Nữ</span>
            <span className="tpH__name">{a}</span>
          </div>
        </div>
        <div className="tpH__bar">THÔNG TIN LỄ CƯỚI</div>
        <div className="tpH__families">
          <div>
            <span className="tpH__fam">Nhà trai</span>
            <span className="tpH__parent">Ông Trần Văn Tuấn</span>
            <span className="tpH__parent">Bà Trần Thị Mai</span>
          </div>
          <div className="tpH__divider" />
          <div>
            <span className="tpH__fam">Nhà gái</span>
            <span className="tpH__parent">Ông Lê Văn Hùng</span>
            <span className="tpH__parent">Bà Hồ Thị Lan</span>
          </div>
        </div>
        <div className="tpH__foot">
          <span className="tpH__announce">
            TRÂN TRỌNG BÁO TIN
            <br />
            LỄ THÀNH HÔN CỦA CON CHÚNG TÔI
          </span>
          <span className="tpH__groom">{b}</span>
          <span className="tpH__date">{date}</span>
        </div>
      </div>
    );
  else if (f === "I")
    body = (
      <>
        <div className="tpI__bg" />
        <div className="tpI__names">
          {a}
          <br />
          <span>{b}</span>
        </div>
        <svg className="tpI__branch1" viewBox="0 0 100 60" fill="none" stroke={deep} strokeWidth="1.1" strokeLinecap="round">
          <path d="M95 8 C70 4 55 18 62 30 C68 40 84 36 82 26 C80 18 70 20 71 27" />
          <path d="M95 20 C78 20 70 32 76 42 C82 52 96 48 94 40" />
          <path d="M60 30 C40 34 30 50 10 52" />
          <path d="M66 36 C50 44 40 58 22 58" />
        </svg>
        <div className="tpI__band" />
        <span className="tpI__xi">囍</span>
        <svg className="tpI__branch2" viewBox="0 0 100 60" fill="none" stroke={deep} strokeWidth="1" strokeLinecap="round">
          <path d="M5 50 C20 30 40 30 44 42 C47 52 34 56 30 48 C27 42 34 38 38 43" />
          <path d="M10 58 C30 48 55 50 70 40 C80 33 92 36 95 30" />
          <circle cx="72" cy="22" r="6" />
          <circle cx="72" cy="22" r="2.5" />
        </svg>
        <div className="tpI__foot">
          <span className="tpI__date">{date}</span>
          <span className="tpI__place">{place}</span>
        </div>
      </>
    );
  else if (f === "J")
    body = (
      <>
        <div className="tpJ__bg" />
        <div className="tpJ__top">
          <span className="tpJ__name">{b}</span>
          <span className="tpJ__xi">囍</span>
          <span className="tpJ__name">{a}</span>
        </div>
        <svg className="tpJ__orn" viewBox="0 0 100 20" fill="none" stroke={gold} strokeWidth=".5">
          <path d="M0 10 C15 2 30 18 45 8" />
          <path d="M100 10 C85 2 70 18 55 8" />
          <circle cx="50" cy="8" r="1.2" fill={gold} />
        </svg>
        <div className="tpJ__arch">
          <div className="tpJ__photo">{S(ph, "Ảnh cưới")}</div>
        </div>
        <div className="tpJ__foot">
          <span className="tpJ__date">{date}</span>
          <span className="tpJ__place">{place}</span>
        </div>
      </>
    );

  else if (f === "K")
    body = (
      <>
        <div className="tpK__frame">
          <div />
        </div>
        <div className="tpK__head">
          <span className="tpK__kicker">THƯ MỜI · PAR AVION</span>
          <span className="tpK__lead">Gửi người thương của chúng mình</span>
        </div>
        <div className="tpK__stamp">
          <div className="tpK__stampIn">
            <div className="tpK__photo">{S(ph, "Ảnh cưới")}</div>
            <div className="tpK__stampFoot">
              <span className="tpK__country">VIỆT NAM</span>
              <span className="tpK__value">1 đời</span>
            </div>
          </div>
        </div>
        <div className="tpK__mark">
          <span className="tpK__markLabel">NGÀY CƯỚI</span>
          <span className="tpK__markDate">{dm}</span>
          <span className="tpK__markYear">{year}</span>
        </div>
        <svg className="tpK__waves" viewBox="0 0 60 16" fill="none" style={{ stroke: deep }} strokeWidth="1">
          <path d="M0 3 Q7.5 0 15 3 T30 3 T45 3 T60 3" />
          <path d="M0 8 Q7.5 5 15 8 T30 8 T45 8 T60 8" />
          <path d="M0 13 Q7.5 10 15 13 T30 13 T45 13 T60 13" />
        </svg>
        <div className="tpK__foot">
          <span className="tpK__names">
            {b} &amp; {a}
          </span>
          <span className="tpK__place">{place}</span>
        </div>
      </>
    );
  else if (f === "L")
    body = (
      <>
        <div className="tpL__bg" />
        <div className="tpL__kicker">VÉ HẠNH PHÚC · MỘT CHIỀU</div>
        <div className="tpL__ticket">
          <div className="tpL__photo">{S(ph, "Ảnh cưới")}</div>
          <div className="tpL__route">
            <div className="tpL__stop">
              <span className="tpL__label">GA ĐI</span>
              <span className="tpL__city">{b}</span>
            </div>
            <svg className="tpL__arrow" viewBox="0 0 24 10" fill="none" style={{ stroke: gold }} strokeWidth="1.2">
              <path d="M0 5h22M18 1l4 4-4 4" />
            </svg>
            <div className="tpL__stop tpL__stop--to">
              <span className="tpL__label">GA ĐẾN</span>
              <span className="tpL__city">{a}</span>
            </div>
          </div>
          <div className="tpL__meta">
            {[["NGÀY", dm], ["TOA", "01"], ["GHẾ", "Cạnh nhau"]].map(([l, v]) => (
              <div key={l}>
                <span className="tpL__label">{l}</span>
                <span className="tpL__val">{v}</span>
              </div>
            ))}
          </div>
          <div className="tpL__tear">
            <span />
            <span />
          </div>
          <div className="tpL__stub">
            <div className="tpL__barcode" />
            <div className="tpL__stubText">
              <span className="tpL__stubYear">{year}</span>
              <span className="tpL__stubLife">TRỌN ĐỜI</span>
            </div>
          </div>
        </div>
      </>
    );
  else if (f === "M")
    body = (
      <>
        <div className="tpM__bg" />
        <div className="tpM__sleeve">
          <span className="tpM__side">SIDE A</span>
          <span className="tpM__title">Bản tình ca của chúng mình</span>
        </div>
        <div className="tpM__disc">
          <div className="tpM__label">
            {S(ph, "Ảnh")}
            <span className="tpM__hole" />
          </div>
        </div>
        <div className="tpM__body">
          <span className="tpM__names">
            {b} <em>&amp;</em> {a}
          </span>
          <div className="tpM__list">
            {TRACKS.map(([n, name, t]) => (
              <div className="tpM__track" key={n}>
                <span>{n}</span>
                <span>{name}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
          <div className="tpM__foot">
            <span>{date}</span>
            <span>{place}</span>
          </div>
        </div>
      </>
    );
  else if (f === "N")
    body = (
      <>
        <div className="tpN__bg" />
        <div className="tpN__kicker">MỘC FILM · 36 KHOẢNH KHẮC</div>
        <div className="tpN__strip">
          <span className="tpN__holes tpN__holes--l" />
          <span className="tpN__holes tpN__holes--r" />
          <div className="tpN__frame">
            {S(ph, "Ảnh 1")}
            <span className="tpN__stamp">{`'${year.slice(-2)} ${parts[1] ?? ""} ${parts[0] ?? ""}`}</span>
          </div>
          <div className="tpN__frame">{S(ph2, "Ảnh 2")}</div>
          <div className="tpN__frame">{S(ph3, "Ảnh 3")}</div>
        </div>
        <div className="tpN__foot">
          <span className="tpN__names">
            {b} <em>&amp;</em> {a}
          </span>
          <span className="tpN__place">
            {date} · {place}
          </span>
        </div>
      </>
    );
  else if (f === "O")
    body = (
      <>
        <div className="tpO__wash" />
        <div className="tpO__under" />
        <div className="tpO__page">
          <div className="tpO__bar">
            <span />
            <span />
          </div>
          <span className="tpO__month">
            THÁNG {pad(m || 1)} · {year}
          </span>
          <span className="tpO__day">{pad(d || 1)}</span>
          <span className="tpO__weekday">{Number.isNaN(when.getTime()) ? "" : WEEKDAYS[when.getDay()]}</span>
          <div className="tpO__luck">
            <span>NGÀY LÀNH</span>
            <span>THÁNG TỐT</span>
          </div>
          <div className="tpO__photo">{S(ph, "Ảnh")}</div>
          <span className="tpO__names">
            {b} &amp; {a}
          </span>
          <span className="tpO__place">{place}</span>
        </div>
      </>
    );
  const cover = (
    <div className={`tp-root${p.fit ? "" : " tp-root--std"}${p.className ? ` ${p.className}` : ""}`} style={{ ...vars, maxWidth: p.maxW ?? "240px", borderRadius: p.radius ?? "10px", ...p.style }}>
      {body}
    </div>
  );
  if (!p.full) return cover;
  return (
    <div style={vars}>
      {cover}
      <ThiepPreviewFull a={a} b={b} date={date} place={place} />
    </div>
  );
}
