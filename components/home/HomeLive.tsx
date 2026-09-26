"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Live pieces of the home page, each behaving as design/Trang Chu.dc.html's Component does. Every piece renders a
// stable value on the server so hydration matches; motion starts after mount.

const TARGET = new Date("2026-11-09T17:00:00+07:00").getTime();
const pad = (n: number) => String(n).padStart(2, "0");
function parts(now: number) {
  const diff = Math.max(0, TARGET - now);
  return { d: Math.floor(diff / 864e5), h: pad(Math.floor(diff / 36e5) % 24), m: pad(Math.floor(diff / 6e4) % 60), s: pad(Math.floor(diff / 1e3) % 60) };
}

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/** "43 ngày 16:08:38" in the hero chip. */
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

/** Four tiles in the "Đếm ngược & lịch" feature card. */
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
          <span>{l}</span>
        </div>
      ))}
    </>
  );
}

/** The design's `g` counter: +1 every 3.2s, shared by the guest name and the guestbook card. */
function useTick(ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
  return i;
}

const GUESTS = [
  ["Cô Lan & gia đình", "co-lan"],
  ["Anh Tuấn", "anh-tuan"],
  ["Bạn Thư thân mến", "ban-thu"],
  ["Chú Hải & cô Hoa", "chu-hai"],
  ["Dear Emily", "emily"],
] as const;
const WISHES = [
  ["Chúc hai bạn trăm năm hạnh phúc!", "Minh Thư"],
  ["Mãi yêu nhau như ngày đầu nhé.", "Anh Tuấn"],
  ["Tiếc không về được, gửi hai đứa thật nhiều thương.", "Cô Lan"],
] as const;

/** Browser bar + typed guest name in the "link riêng" card; re-keyed so the typing replays for each guest. */
export function GuestInvite() {
  const g = GUESTS[useTick(3200) % GUESTS.length];
  return (
    <>
      <div className="hm-browser">
        <span className="hm-browser__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="hm-browser__url">
          moc.vn/invite/vy-khoi?g=<span>{g[1]}</span>
        </span>
      </div>
      <div className="hm-invite">
        <span className="hm-invite__kicker">TRÂN TRỌNG KÍNH MỜI</span>
        <div className="hm-invite__name">
          <span key={g[0]} style={{ animation: `type 1.1s steps(${g[0].length}) both` }}>
            {g[0]}
          </span>
          <span className="hm-invite__caret" />
        </div>
        <span className="hm-invite__rule" />
        <span className="hm-invite__text">tới dự bữa tiệc chung vui cùng gia đình chúng tôi, trong ngày thành hôn của</span>
        <span className="hm-invite__couple">
          Hạ Vy <em>&amp;</em> Minh Khôi
        </span>
        <span className="hm-invite__when">17:00 · 09.11.2026 · HÀ NỘI</span>
      </div>
    </>
  );
}

/** The guestbook card's rotating wish. */
export function WishRotator() {
  const w = WISHES[useTick(3200) % WISHES.length];
  return (
    <div className="hm-wish" key={w[0]}>
      <span>“{w[0]}”</span>
      <span>— {w[1]}</span>
    </div>
  );
}

/** Stats row: all four numbers count up together (1.4s, cubic ease-out) once the row is 30% in view. */
export function StatsRow({ stats }: { stats: readonly (readonly [number, string, string])[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const v = Math.min(1, (now - start) / 1400);
          setP(v);
          if (v < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const ease = 1 - Math.pow(1 - p, 3);
  return (
    <div className="hm-stats" ref={ref} data-reveal="1">
      {stats.map(([v, suffix, label]) => (
        <div key={label}>
          <span>
            {Math.round(v * ease)}
            {suffix}
          </span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/** Hero envelope stage: tilts toward the pointer (±6deg). */
export function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <div
      className={className}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setT({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      style={{ transform: `rotateY(${t.x * 6}deg) rotateX(${-t.y * 6}deg)` }}
    >
      {children}
    </div>
  );
}

/** 3px reading-progress bar pinned to the top of the window. */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      setPct(Math.min(100, Math.max(0, (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className="hm-progress" aria-hidden="true">
      <div style={{ width: `${pct.toFixed(1)}%` }} />
    </div>
  );
}
