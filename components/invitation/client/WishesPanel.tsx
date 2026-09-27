"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect, useState, type FormEvent } from "react";
import { api, type PublicWish } from "@/lib/api";
import { t, type Locale } from "@/lib/i18n";
import { subscribeToWishes } from "@/lib/supabase-browser";

type Props = { slug?: string; invitationId?: string; preview: boolean; guestName: string; initial: PublicWish[]; placeholder: string; locale?: Locale };

export function WishesPanel({ slug, invitationId, preview, guestName, initial, placeholder, locale = "vi" }: Props) {
  const dict = t(locale);
  const [listRef] = useAutoAnimate<HTMLUListElement>();
  const [wishes, setWishes] = useState(initial);
  const [name, setName] = useState(guestName);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (preview || !slug || !invitationId) return;
    return subscribeToWishes(invitationId, () => {
      void api.getPublicInvitation(slug).then((dto) => { if (dto) setWishes(dto.wishes); });
    });
  }, [invitationId, preview, slug]);

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
      await api.submitWish(slug, { name: name.trim(), message: message.trim(), website });
      setMessage("");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errGeneric);
      setStatus("error");
    }
  }

  return (
    <>
      {wishes.length > 0 && (
        <ul className="inv-wishlist" ref={listRef}>
          {wishes.map((w) => (
            <li className="inv-wish" key={w.id}>
              <span className="inv-wish__msg">{w.message}</span>
              <span className="inv-wish__by">— {w.name}</span>
            </li>
          ))}
        </ul>
      )}
      <form className="inv-wishform" onSubmit={submit} noValidate>
        <fieldset disabled={preview || status === "sending"}>
          <legend className="inv-sr-only">{dict.wishLegend}</legend>
          {!preview && <input aria-label={dict.yourName} placeholder={dict.yourName} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />}
          <textarea aria-label={dict.wishLabel} placeholder={placeholder} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={preview ? 1 : 3} />
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
          {!preview && (
            <button type="submit" className="inv-wishform__send">
              {status === "sending" ? dict.sending : dict.submitWish}
            </button>
          )}
        </fieldset>
      </form>
    </>
  );
}
