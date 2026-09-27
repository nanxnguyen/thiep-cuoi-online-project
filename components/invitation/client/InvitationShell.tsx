"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { t, type Locale } from "@/lib/i18n";

type Props = {
  gate: boolean;
  guestName: string;
  groom: string;
  bride: string;
  music: { url: string; title: string } | null;
  children: ReactNode;
  locale?: Locale;
};

// Deterministic petals behind the envelope and a burst of confetti when it opens (design/Thiep Khach.dc.html).
const rnd = (i: number, n: number) => {
  const x = Math.sin(i * 97.13 + n * 13.7) * 10000;
  return x - Math.floor(x);
};
const PETALS = Array.from({ length: 14 }, (_, i) => ({ left: `${rnd(i, 3) * 100}%`, size: 8 + rnd(i, 1) * 10, dur: 8 + rnd(i, 2) * 8, delay: -rnd(i, 4) * 16, tone: i % 3 }));
const BURST = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2;
  const dist = 140 + (i % 5) * 30;
  return { x: Math.cos(a) * dist, y: Math.sin(a) * dist, tone: i % 4, round: i % 2 === 1 };
});
const OPEN_MS = 480; // envelope scales out (.5s ease-in), then the page opens: design/Thiep Khach.dc.html

// Holds the two pieces of state that need a user gesture: the envelope that gates the page and the
// background music (browsers only allow audio to start after a tap, so the tap on "Mở thiệp" starts it).
export function InvitationShell({ gate, groom, bride, music, children, locale = "vi" }: Props) {
  const dict = t(locale);
  const [phase, setPhase] = useState<"closed" | "opening" | "open">(gate ? "closed" : "open");
  const [playing, setPlaying] = useState(false);
  // Cánh hoa trang trí: chỉ render sau mount để HTML server và client khớp nhau
  // (tránh hydration mismatch làm liệt nút Mở thiệp).
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const audio = useRef<HTMLAudioElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (phase === "open") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function play() {
    audio.current
      ?.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false)); // autoplay can still be refused: the music button stays available
  }

  function openEnvelope() {
    if (phase !== "closed") return;
    if (music) play();
    const finish = () => {
      setPhase("open");
      content.current?.focus({ preventScroll: true });
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return finish();
    setPhase("opening");
    timer.current = window.setTimeout(finish, OPEN_MS);
  }

  function toggleMusic() {
    const el = audio.current;
    if (!el) return;
    if (el.paused) play();
    else {
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      {phase !== "open" && (
        <div className="inv-gate" data-phase={phase} role="dialog" aria-modal="true" aria-label={dict.kindlyInvites}>
          {mounted && (
            <div className="inv-gate__petals" aria-hidden="true">
              {PETALS.map((p, i) => (
                <i key={i} data-tone={p.tone} style={{ left: p.left, width: p.size, height: p.size * 0.8, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
              ))}
            </div>
          )}
          {phase === "opening" && (
            <div className="inv-gate__burst" aria-hidden="true">
              {BURST.map((b, i) => (
                <i key={i} data-tone={b.tone} data-round={b.round || undefined} style={{ "--bx": `${b.x}px`, "--by": `${b.y}px` } as React.CSSProperties} />
              ))}
            </div>
          )}
          <button type="button" className="inv-gate__hit" onClick={openEnvelope} disabled={phase === "opening"} aria-label={dict.openInvitation}>
            <span className="inv-envelope" aria-hidden="true">
              <span className="inv-envelope__back" />
              <span className="inv-envelope__card">
                <span className="inv-envelope__kicker">{dict.kindlyInvites.toUpperCase()}</span>
                <span className="inv-envelope__names">
                  {bride} &amp; {groom}
                </span>
              </span>
              <span className="inv-envelope__front" />
              <span className="inv-envelope__flap" />
              <span className="inv-envelope__seal">M</span>
            </span>
            <span className="inv-gate__tap">{dict.tapToOpen}</span>
          </button>
        </div>
      )}

      <div className="inv-content" ref={content} tabIndex={-1} inert={phase !== "open"}>
        {children}
      </div>

      {music && (
        <>
          <audio ref={audio} src={music.url} loop preload="none" />
          {phase === "open" && (
            <button
              type="button"
              className="inv-music"
              data-playing={playing}
              onClick={toggleMusic}
              aria-pressed={playing}
              aria-label={playing ? dict.muteMusic(music.title) : dict.playMusic(music.title)}
            >
              <span className="inv-music__bars" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </button>
          )}
        </>
      )}
    </>
  );
}
