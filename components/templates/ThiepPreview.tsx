import type { CSSProperties, ReactNode } from "react";
import type { CoverFamily } from "@/lib/templates";
import "./thiep-preview.css";

// design/Thiep Preview.dc.html, element for element: one 9:16 cover in ten families (A–J), sized in container
// units so it scales with its box. The design's <image-slot> is an authoring drop-zone; here a slot shows the photo
// when there is one, otherwise the same empty frame (tinted ground, dashed ring, icon, caption).
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
  className?: string;
  style?: CSSProperties;
};

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
        <div className="tpA__photo">{S(p.photo, "Ảnh cưới")}</div>
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
        <div className="tpB__photo">{S(p.photo, "Ảnh cưới")}</div>
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
          <div className="tpC__photo">{S(p.photo, "Ảnh", true)}</div>
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
          <div className="tpD__photo">{S(p.photo, "Ảnh cưới")}</div>
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
          <div className="tpE__photo">{S(p.photo, "Ảnh cưới")}</div>
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
        <div className="tpF__photo">{S(p.photo, "Ảnh bìa")}</div>
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
          <div className="tpG__photo">{S(p.photo, "Chú rể")}</div>
        </div>
        <div className="tpG__who tpG__who--b">
          <span className="tpG__rank">Trưởng Nam</span>
          <span className="tpG__name">{b}</span>
        </div>
        <div className="tpG__pol tpG__pol--2">
          <div className="tpG__photo">{S(p.photo2, "Cô dâu")}</div>
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
          <div className="tpH__circle tpH__circle--l">{S(p.photo, "Chú rể", true)}</div>
          <div className="tpH__circle tpH__circle--r">{S(p.photo2, "Cô dâu", true)}</div>
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
          <div className="tpJ__photo">{S(p.photo, "Ảnh cưới")}</div>
        </div>
        <div className="tpJ__foot">
          <span className="tpJ__date">{date}</span>
          <span className="tpJ__place">{place}</span>
        </div>
      </>
    );

  return (
    <div className={`tp-root${p.fit ? "" : " tp-root--std"}${p.className ? ` ${p.className}` : ""}`} style={{ ...vars, maxWidth: p.maxW ?? "240px", borderRadius: p.radius ?? "10px", ...p.style }}>
      {body}
    </div>
  );
}
