import type { ReactNode } from "react";
import type { Content } from "@/lib/content";
import { earliestEvent } from "@/lib/datetime";
import { t, type Locale } from "@/lib/i18n";
import type { Template } from "@/lib/templates";

function Photo({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return <span className={`dc-photo ${className}`}>{src ? <img src={src} alt={alt} decoding="async" /> : <span role="img" aria-label={alt}>▧<small>{alt}</small></span>}</span>;
}

export function Cover({ content, template, locale = "vi" }: { content: Content; template: Template; locale?: Locale }) {
  const dict = t(locale);
  const bride = content.couple.bride.name.trim() || dict.brideFallback;
  const groom = content.couple.groom.name.trim() || dict.groomFallback;
  const event = earliestEvent(content.events);
  const [year = "", month = "", day = ""] = event?.date.split("-") ?? [];
  const date = [day, month, year].filter(Boolean).join(" · ");
  const dm = [day, month].filter(Boolean).join(".");
  const place = event?.venue || event?.address || "";
  const photo = content.couple.heroPhoto;
  const title = (children: ReactNode) => <div className="dc-title">{children}</div>;
  let artwork: ReactNode;

  switch (template.family) {
    case "A":
      artwork = <><div className="dc-a-top"><small>TRÂN TRỌNG KÍNH MỜI</small><div className="dc-a-names"><span>NHÀ TRAI<strong>{groom}</strong></span><b>囍</b><span>NHÀ GÁI<strong>{bride}</strong></span></div></div><Photo src={photo} alt="Ảnh cưới" className="dc-a-photo" />{title(<span className="dc-a-date">{date}</span>)}<small className="dc-a-place">{place}</small></>;
      break;
    case "B":
      artwork = <><div className="dc-b-head"><span>SAVE THE DATE</span><span>{year}</span></div>{title(dm)}<div className="dc-rule" /><Photo src={photo} alt="Ảnh cưới" className="dc-b-photo" /><div className="dc-b-bottom"><strong>{bride} &amp; {groom}</strong><small>{place}</small></div></>;
      break;
    case "C":
      artwork = <><div className="dc-c-arch" /><small>THE WEDDING OF</small>{title(<>{bride}<i>&amp;</i>{groom}</>)}<Photo src={photo} alt="Ảnh cưới" className="dc-c-photo" /><span className="dc-bottom-date">{date}</span><small>{place}</small></>;
      break;
    case "D":
      artwork = <><div className="dc-d-frame" /><small>✦ ───── ✦</small><small>LỄ THÀNH HÔN</small><Photo src={photo} alt="Ảnh cưới" className="dc-d-photo" />{title(<>{bride} &amp; {groom}</>)}<span className="dc-bottom-date">{date}</span><small>{place}</small></>;
      break;
    case "E":
      artwork = <><small>SAVE THE DATE</small><span className="dc-e-date">{date}</span><div className="dc-e-flap" /><Photo src={photo} alt="Ảnh cưới" className="dc-e-photo" /><span className="dc-e-seal">&amp;</span>{title(<>{bride}<br />&amp; {groom}</>)}</>;
      break;
    case "F":
      artwork = <><Photo src={photo} alt="Ảnh bìa" className="dc-f-photo" /><div className="dc-f-shade" /><div className="dc-f-head"><strong>Chung Nhà</strong><small>SỐ ĐẶC BIỆT</small></div><div className="dc-f-bottom"><small>{date}</small>{title(<>{bride} &amp; {groom}</>)}<span>{place}</span></div></>;
      break;
    case "G":
      artwork = <><small>THE WEDDING OF</small><Photo src={photo} alt="Ảnh chú rể" className="dc-g-photo dc-g-photo--one" /><span className="dc-g-groom">Trưởng Nam<strong>{groom}</strong></span><div className="dc-g-band" /><Photo src={photo} alt="Ảnh cô dâu" className="dc-g-photo dc-g-photo--two" />{title(<>Út Nữ<strong>{bride}</strong></>)}<span className="dc-bottom-date">{date}</span></>;
      break;
    case "H":
      artwork = <><div className="dc-h-band"><Photo src={photo} alt="Ảnh chú rể" /><b>囍</b><Photo src={photo} alt="Ảnh cô dâu" /></div><div className="dc-h-names"><span>Trưởng Nam<strong>{groom}</strong></span><span>Út Nữ<strong>{bride}</strong></span></div><h2>THÔNG TIN LỄ CƯỚI</h2><div className="dc-h-family"><span>Nhà trai<strong>{content.family.groomSide.father}</strong><strong>{content.family.groomSide.mother}</strong></span><span>Nhà gái<strong>{content.family.brideSide.father}</strong><strong>{content.family.brideSide.mother}</strong></span></div><div className="dc-h-bottom"><small>TRÂN TRỌNG BÁO TIN<br />LỄ THÀNH HÔN CỦA CON CHÚNG TÔI</small>{title(groom)}<span>{date}</span></div></>;
      break;
    case "I":
      artwork = <>{title(<>{bride}<br />{groom}</>)}<span className="dc-i-ornament">⌁</span><div className="dc-i-band" /><b className="dc-i-hy">囍</b><span className="dc-i-date">{date}<small>{place}</small></span></>;
      break;
    case "J":
      artwork = <><div className="dc-j-head"><span>{groom}</span><b>囍</b><span>{bride}</span></div><div className="dc-j-line">⌁ ✧ ⌁</div><Photo src={photo} alt="Ảnh cưới" className="dc-j-photo" />{title(<>{bride} &amp; {groom}</>)}<span className="dc-j-date">{date}<small>{place}</small></span></>;
  }

  return <section className="inv-cover dc-cover" aria-labelledby="inv-title" data-family={template.family}><h1 id="inv-title" className="inv-sr-only">{bride} &amp; {groom}</h1><div className="dc-cover-art">{artwork}</div></section>;
}
