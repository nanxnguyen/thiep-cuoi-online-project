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

const OPEN_MS = 1100; // flap opens, card rises, overlay fades: keep in sync with .inv-gate[data-phase="opening"] in CSS

// Holds the two pieces of state that need a user gesture: the envelope that gates the page and the
// background music (browsers only allow audio to start after a tap, so the tap on "Mở thiệp" starts it).
export function InvitationShell({ gate, guestName, groom, bride, music, children, locale = "vi" }: Props) {
  const dict = t(locale);
  const [phase, setPhase] = useState<"closed" | "opening" | "open">(gate ? "closed" : "open");
  const [playing, setPlaying] = useState(false);
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
    </>
  );
}
