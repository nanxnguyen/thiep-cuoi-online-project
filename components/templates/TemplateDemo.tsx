"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { colors, templateSamples, type ColorKey, type Template } from "@/lib/templates";
import { ThiepPreview } from "./ThiepPreview";

// "Xem thử" popup of design/Mau Thiep v2.dc.html: the full sample invitation in a phone frame scrolls itself top to
// bottom, holds, returns to the top, and repeats. Hover/touch pauses it and hands scrolling to the visitor; Esc or a
// click on the backdrop closes it.
export function TemplateDemo({ template, colorKey, onClose }: { template: Template; colorKey: ColorKey; onClose: () => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const ctl = useRef({ paused: false, hold: 0, pos: 0, atEnd: false, resume: 0 });
  const [paused, setPaused] = useState(false);
  const s = templateSamples[template.id];
  const c = colors[colorKey];

  useEffect(() => {
    const st = ctl.current;
    st.hold = performance.now() + 900;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const el = scroller.current;
      const dt = Math.min(64, now - last);
      last = now;
      if (el && !st.paused && now > st.hold) {
        if (st.atEnd) {
          st.atEnd = false;
          st.pos = 0;
          el.scrollTo({ top: 0, behavior: "smooth" });
          st.hold = now + 1500;
        } else {
          const max = el.scrollHeight - el.clientHeight;
          if (Math.abs(el.scrollTop - st.pos) > 4) st.pos = el.scrollTop;
          st.pos = Math.min(max, st.pos + dt * 0.055);
          el.scrollTop = st.pos;
          if (st.pos >= max - 1) {
            st.atEnd = true;
            st.hold = now + 1800;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(st.resume);
      removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const pause = () => {
    ctl.current.paused = true;
    clearTimeout(ctl.current.resume);
    setPaused(true);
  };
  const resume = () => {
    ctl.current.paused = false;
    ctl.current.hold = performance.now() + 400;
    setPaused(false);
  };
  const resumeLater = () => {
    clearTimeout(ctl.current.resume);
    ctl.current.resume = window.setTimeout(() => {
      ctl.current.paused = false;
      setPaused(false);
    }, 2500);
  };
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="gal-demo" role="dialog" aria-modal="true" aria-label={`Xem thử mẫu ${template.name}`} onClick={onClose}>
      <div className="gal-demo__phone" onClick={stop} onMouseEnter={pause} onMouseLeave={resume} onTouchStart={pause} onTouchEnd={resumeLater}>
        <div className="gal-demo__scroller" ref={scroller} style={{ background: c.paper }}>
          <div className="gal-demo__zoom">
            <ThiepPreview full fit maxW="100%" radius="0" family={template.family} deep={c.deep} paper={c.paper} gold={c.gold} a={s.a} b={s.b} date={s.date} place={s.place} />
          </div>
        </div>
      </div>
      <div className="gal-demo__side" onClick={stop}>
        <div className="gal-demo__status">
          <span data-paused={paused || undefined} />
          {paused ? "ĐÃ DỪNG" : "ĐANG TỰ CUỘN"}
        </div>
        <div className="gal-demo__title">
          <span>{template.name}</span>
          <span>{c.label}</span>
        </div>
        <p>Thiệp tự cuộn qua toàn bộ nội dung như khách sẽ thấy. Rê chuột vào thiệp để dừng và tự cuộn xem.</p>
        <div className="gal-demo__actions">
          <Link href={`/studio?template=${template.id}&color=${colorKey}`}>Dùng mẫu này</Link>
          <button type="button" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
