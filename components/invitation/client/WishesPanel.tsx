"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useState, type FormEvent } from "react";
import { api, type PublicWish } from "@/lib/api";
import { t, type Locale } from "@/lib/i18n";

type Props = { slug?: string; preview: boolean; guestName: string; initial: PublicWish[]; locale?: Locale };

export function WishesPanel({ slug, preview, guestName, initial, locale = "vi" }: Props) {
  const dict = t(locale);
  const [listRef] = useAutoAnimate<HTMLUListElement>();
  const [wishes, setWishes] = useState(initial);
  const [name, setName] = useState(guestName);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (preview || !slug) return;
    if (!name.trim() || !message.trim()) {
      setError(dict.errWishRequired);
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const wish = await api.submitWish(slug, { name: name.trim(), message: message.trim(), website });
      setWishes((list) => [wish, ...list]);
      setMessage("");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errGeneric);
      setStatus("error");
    }
  }

  return (
    <div className="inv-wishes">
      <form className="inv-form" onSubmit={submit} noValidate>
        <fieldset disabled={preview || status === "sending"}>
          <legend className="inv-sr-only">{dict.wishLegend}</legend>
          <label className="inv-field">
            <span>{dict.yourName}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
          </label>
          <label className="inv-field">
            <span>{dict.wishLabel}</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={4} />
            <small className="inv-count">{message.length}/500</small>
          </label>
          <div className="inv-hp" aria-hidden="true">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>
          {status === "error" && (
            <p className="inv-error" role="alert">
              {error}
            </p>
          )}
          {status === "sent" && (
            <p className="inv-success" role="status">
              {dict.wishSentMsg}
            </p>
          )}
          <button type="submit" className="inv-btn inv-btn--block">
            {status === "sending" ? dict.sending : dict.submitWish}
          </button>
          {preview && <p className="inv-hint">{dict.wishPreviewHint}</p>}
        </fieldset>
      </form>

      {wishes.length > 0 ? (
        <ul className="inv-wishlist" ref={listRef}>
          {wishes.map((w) => (
            <li className="inv-wish" key={w.id}>
              <p className="inv-wish__msg">{w.message}</p>
              <p className="inv-wish__by">{w.name}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="inv-hint">{dict.wishEmpty}</p>
      )}
    </div>
  );
}
