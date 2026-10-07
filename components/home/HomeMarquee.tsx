"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ThiepPreview } from "@/components/templates/ThiepPreview";
import type { CoverFamily } from "@/lib/templates";

export type MarqueeItem = {
  id: string;
  name: string;
  family: CoverFamily;
  deep: string;
  paper: string;
  gold: string;
  a: string;
  b: string;
  date: string;
  place: string;
  style: string;
};

// Shared reveal queue for below-fold cards. IntersectionObservers only mark cards
// ready; a rAF loop mounts a few per frame so one scroll doesn't mount dozens of
// heavy ThiepPreview subtrees at once (that locked the main thread ~10s+ on slow
// webviews, leaving the small marquee blank — Zalo iPhone report 2026-10-07).
// A timeout flush covers rAF stalls (background tabs).
const BATCH = 6;
const FLUSH_MS = 4000;
const pending = new Set<() => void>();
let pumping = false;
function pump() {
  const run = [...pending].slice(0, BATCH);
  for (const fn of run) {
    pending.delete(fn);
    fn();
  }
  if (pending.size > 0) {
    requestAnimationFrame(pump);
  } else {
    pumping = false;
  }
}
function revealSoon(fn: () => void) {
  pending.add(fn);
  if (!pumping) {
    pumping = true;
    requestAnimationFrame(pump);
    // rAF stalls in background tabs; the timeout guarantees convergence.
    setTimeout(() => {
      if (pending.size > 0) {
        pumping = true;
        pump();
      }
    }, FLUSH_MS);
  }
}

function Defer({ eager, ready, bg, radius, children }: { eager: boolean; ready: boolean; bg: string; radius?: string; children: ReactNode }) {
  const [show, setShow] = useState(eager);
  useEffect(() => {
    if (!show && ready) revealSoon(() => setShow(true));
  }, [show, ready]);
  return show ? (
    <>{children}</>
  ) : (
    <div className="tp-root tp-root--std" aria-hidden="true" style={{ background: bg, maxWidth: "240px", borderRadius: radius ?? "10px" }} />
  );
}

// Server SSR 6 cards (Workers Free 10ms), client mount lên 20 ngay trong viewport,
// scroll tới sentinel mở dần đủ 50. Data có sẵn từ server, không fetch thêm.
// Cards reveal theo SECTION (tiến tới theo chiều dọc), không theo từng card:
// track chạy ngang nên card ngoài khung ngang không bao giờ giao cắt observer.
export function HomeMarquee({ items }: { items: MarqueeItem[] }) {
  const [visible, setVisible] = useState(6);
  const [near, setNear] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(20);
  }, []);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          // Vertical approach only (1200px early): the tracks move horizontally,
          // so per-card horizontal visibility is the wrong trigger — off-canvas
          // cards would wait tens of seconds for the marquee to carry them in
          // (blank small slide on phones, report 2026-10-07).
          setNear(true);
          setVisible(items.length);
          io.disconnect();
        }
      },
      { rootMargin: "1200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [items.length]);

  const track1 = items.slice(0, Math.ceil(items.length / 2));
  const track2 = items.slice(Math.ceil(items.length / 2)).reverse();
  const v1 = track1.slice(0, Math.ceil(visible / 2));
  const v2 = track2.slice(0, Math.floor(visible / 2));

  return (
    <>
      <div className="hm-marquee__mask">
        <div className="hm-marquee__track">
          {[...v1, ...v1].map((t, i) => (
            <Link
              href={`/templates/${t.id}`}
              key={`${t.id}-${i}`}
              tabIndex={i >= v1.length ? -1 : undefined}
              aria-hidden={i >= v1.length || undefined}
              style={{ "--off": `${i % 2 ? 18 : 0}px`, "--rot": `${i % 2 ? 1 : -1}deg`, "--glow": `${t.deep}aa` } as CSSProperties}
            >
              <div className="hm-marquee__card">
                <Defer eager={i < 6} ready={near} bg={t.paper} radius="14px">
                  <ThiepPreview family={t.family} deep={t.deep} paper={t.paper} gold={t.gold} a={t.a} b={t.b} date={t.date} place={t.place} radius="14px" />
                </Defer>
                <span className="hm-marquee__badge">{t.style}</span>
              </div>
              <div className="hm-marquee__meta">
                <span>{t.name}</span>
                <span>
                  {t.a} &amp; {t.b}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="hm-marquee__mask">
        <div className="hm-marquee__track hm-marquee__track--small">
          {[...v2, ...v2].map((t, i) => (
            <Link href={`/templates/${t.id}`} key={`${t.id}-${i}`} tabIndex={-1} aria-hidden="true">
              <div className="hm-marquee__card">
                <Defer eager={false} ready={near} bg={t.paper} radius="10px">
                  <ThiepPreview family={t.family} deep={t.deep} paper={t.paper} gold={t.gold} a={t.a} b={t.b} date={t.date} place={t.place} radius="10px" />
                </Defer>
              </div>
              <span>{t.name}</span>
            </Link>
          ))}
        </div>
      </div>
      <div ref={sentinel} aria-hidden="true" style={{ height: 1 }} />
    </>
  );
}
