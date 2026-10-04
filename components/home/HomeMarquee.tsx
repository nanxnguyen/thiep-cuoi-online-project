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

function Defer({ eager, bg, radius, children }: { eager: boolean; bg: string; radius?: string; children: ReactNode }) {
  const [show, setShow] = useState(eager);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (show || !el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);
  return show ? (
    <>{children}</>
  ) : (
    <div ref={ref} className="tp-root tp-root--std" aria-hidden="true" style={{ background: bg, maxWidth: "240px", borderRadius: radius ?? "10px" }} />
  );
}

// Server SSR 6 cards (Workers Free 10ms), client mount lên 20 ngay trong viewport,
// scroll tới sentinel mở dần đủ 50. Data có sẵn từ server, không fetch thêm.
export function HomeMarquee({ items }: { items: MarqueeItem[] }) {
  const [visible, setVisible] = useState(6);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(20);
  }, []);

  useEffect(() => {
    if (visible >= items.length) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(items.length);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, items.length]);

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
                <Defer eager={i < 6} bg={t.paper} radius="14px">
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
                <Defer eager={false} bg={t.paper} radius="10px">
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
