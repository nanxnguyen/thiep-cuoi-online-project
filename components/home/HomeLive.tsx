"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Small live pieces of the home page (design/Trang Chu.dc.html). Each renders a sensible static value on the server so
// the page is complete without JS and hydration matches; motion starts after mount.

const TARGET = new Date("2026-11-09T17:00:00+07:00").getTime();
const pad = (n: number) => String(n).padStart(2, "0");
function parts(now: number) {
  const diff = Math.max(0, TARGET - now);
  return { d: Math.floor(diff / 864e5), h: pad(Math.floor(diff / 36e5) % 24), m: pad(Math.floor(diff / 6e4) % 60), s: pad(Math.floor(diff / 1e3) % 60) };
}

function useNow(active = true) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

/** "74 ngày 08:26:10" in the hero chip. */
export function CountdownText() {
  const now = useNow();
  if (now === null) return <>— ngày --:--:--</>;
  const p = parts(now);
  return (
    <>
      {p.d} ngày {p.h}:{p.m}:{p.s}
    </>
  );
}

/** Four flip-style tiles in the "Đếm ngược & lịch" feature card. */
export function CountdownTiles() {
  const now = useNow();
  const p = now === null ? { d: "--", h: "--", m: "--", s: "--" } : parts(now);
  return (
    <>
      {[
        [p.d, "NGÀY"],
        [p.h, "GIỜ"],
        [p.m, "PHÚT"],
        [p.s, "GIÂY"],
      ].map(([v, l]) => (
        <div key={l}>
          <span>{v}</span>
          <small>{l}</small>
        </div>
      ))}
    </>
  );
}

function useTick(ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
  return i;
}

/** Cycles through items every 3.2s, re-keying so the entry animation replays. */
export function Rotating({ items, className }: { items: readonly ReactNode[]; className?: string }) {
  const i = useTick(3200);
  return (
    <span className={className} key={i} data-rotating="">
      {items[i % items.length]}
    </span>
  );
}

/** Number that counts up once when scrolled into view. */
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || to === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setV(0);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / 1400);
          setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {v}
      {suffix}
    </span>
  );
}

/** Tilts its child a few degrees toward the pointer (hero envelope). */
export function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <div
      className={className}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        setT({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
      }}
      onPointerLeave={() => setT({ x: 0, y: 0 })}
      style={{ transform: `rotateY(${t.x * 6}deg) rotateX(${-t.y * 6}deg)` }}
    >
      {children}
    </div>
  );
}

/** Thin reading-progress bar under the header. */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      setPct(Math.min(100, Math.max(0, (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return <div className="hm-progress" style={{ transform: `scaleX(${pct / 100})` }} aria-hidden="true" />;
}
