"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { t, type Locale } from "@/lib/i18n";
import { AutoScroll } from "./AutoScroll";

type Props = {
  gate: boolean;
  guestName: string;
  groom: string;
  bride: string;
  music: { url: string; title: string } | null;
  children: ReactNode;
  locale?: Locale;
  autoScroll?: boolean;
};

// Deterministic petals behind the envelope and a burst of confetti when it opens (design/Thiep Khach.dc.html).
const rnd = (i: number, n: number) => {
  const x = Math.sin(i * 97.13 + n * 13.7) * 10000;
  return x - Math.floor(x);
};
const PETALS = Array.from({ length: 14 }, (_, i) => ({ left: `${rnd(i, 3) * 100}%`, size: 8 + rnd(i, 1) * 10, dur: 10 + rnd(i, 2) * 8, delay: -rnd(i, 4) * 18 }));
const BURST = Array.from({ length: 24 }, (_, i) => ({ angle: (i / 24) * 360 + rnd(i, 5) * 12, dist: 90 + rnd(i, 6) * 120, tone: i % 3 }));
const OPEN_MS = 1100; // flap opens, card rises, overlay fades: keep in sync with .inv-gate[data-phase="opening"] in CSS

// Holds the two pieces of state that need a user gesture: the envelope that gates the page and the
// background music (browsers only allow audio to start after a tap, so the tap on "Mở thiệp" starts it).
export function InvitationShell({ gate, guestName, groom, bride, music, children, locale = "vi", autoScroll = false }: Props) {
  const dict = t(locale);
  const [phase, setPhase] = useState<"closed" | "opening" | "open">(gate ? "closed" : "open");
  const [playing, setPlaying] = useState(false);
  // Cánh hoa trang trí: chỉ render sau mount để HTML server và client khớp nhau
  // (tránh hydration mismatch làm liệt nút Mở thiệp).
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const audio = useRef<HTMLAudioElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (phase === "open") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => {
    if (gate) openButton.current?.focus();
    return () => window.clearTimeout(timer.current);
  }, [gate]);

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

  const who = guestName || dict.defaultGuest;

  return (
    <>
      {phase !== "open" && (
        <div className="inv-gate" data-phase={phase} role="dialog" aria-modal="true" aria-labelledby="inv-gate-title">
          {mounted && (
            <div className="inv-gate__petals" aria-hidden="true">
              {PETALS.map((p, i) => (
                <i key={i} style={{ left: p.left, width: p.size, height: p.size * 0.8, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
              ))}
            </div>
          )}
          {phase === "opening" && (
            <div className="inv-gate__burst" aria-hidden="true">
              {BURST.map((b, i) => (
                <i key={i} data-tone={b.tone} style={{ "--a": `${b.angle}deg`, "--d": `${b.dist}px` } as React.CSSProperties} />
              ))}
            </div>
          )}
          <div className="inv-envelope" aria-hidden="true">
            <div className="inv-envelope__back" />
            <div className="inv-envelope__card">
              <span className="inv-envelope__kicker">{dict.kindlyInvites}</span>
              <span className="inv-envelope__guest">{who}</span>
            </div>
            <div className="inv-envelope__front" />
            <div className="inv-envelope__flap" />
            <div className="inv-envelope__seal" />
          </div>
          <p className="inv-gate__kicker">{dict.kindlyInvites}</p>
          <h2 className="inv-gate__guest" id="inv-gate-title">
            {who}
          </h2>
          <p className="inv-gate__names">
            {groom} &amp; {bride}
          </p>
          <button type="button" className="inv-btn inv-gate__open" ref={openButton} onClick={openEnvelope} disabled={phase === "opening"}>
            {dict.openInvitation}
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
      {autoScroll && phase === "open" && <AutoScroll startLabel={dict.autoScrollStart} stopLabel={dict.autoScrollStop} />}
    </>
  );
}
