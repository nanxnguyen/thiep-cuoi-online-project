"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { celebrate } from "@/lib/celebrate";
import { pick, t, type Locale } from "@/lib/i18n";

type Question = { id: string; label: string; labelEn: string; type: "text" | "yesno" };
type Props = { slug?: string; preview: boolean; guestName: string; guestToken?: string; questions: Question[]; plusOnes: boolean; locale?: Locale };

export function RsvpForm({ slug, preview, guestName, guestToken = "", questions, plusOnes, locale = "vi" }: Props) {
  const dict = t(locale);
  const [name, setName] = useState(guestName);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guests, setGuests] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [website, setWebsite] = useState(""); // honeypot: real people never see or fill this
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const fail = (message: string) => {
    setError(message);
    setStatus("error");
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (preview || !slug) return;
    if (!name.trim()) return fail(dict.errNoName);
    if (attending === null) return fail(dict.errNoAttending);
    setStatus("sending");
    try {
      await api.submitRsvp(slug, {
        name: name.trim(),
        attending,
        guests: attending ? guests : 0,
        note: "",
        answers,
        guestLabel: guestName,
        guestToken,
        website,
      });
      setStatus("done");
      if (attending) void celebrate();
    } catch (err) {
      fail(err instanceof Error ? err.message : dict.errGeneric);
    }
  }

  if (status === "done") {
    return (
      <div className="inv-done" role="status">
        <svg className="inv-done__tick" width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" />
          <path d="M15 27l7 7 15-15" />
        </svg>
        <p className="inv-done__title">{dict.rsvpDone}</p>
      </div>
    );
  }

  return (
    <form className="inv-rsvp__form" onSubmit={submit} noValidate>
      <fieldset disabled={preview || status === "sending"}>
        <legend className="inv-sr-only">{dict.rsvpTitle}</legend>
        <input className="inv-rsvp__name" aria-label={dict.yourName} placeholder={dict.yourName} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" required />

        <div className="inv-rsvp__choices" role="radiogroup" aria-label={dict.attendingQuestion}>
          {([[true, dict.attendingYes], [false, dict.attendingNo]] as const).map(([v, label]) => (
            <button type="button" role="radio" key={label} aria-checked={attending === v} onClick={() => setAttending(v)}>
              {label}
            </button>
          ))}
        </div>

        {attending && plusOnes && (
          <label className="inv-rsvp__row">
            <span>{dict.guestsCount}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
            />
          </label>
        )}

        {questions.map((q) => {
          const label = pick(locale, q.label, q.labelEn);
          return q.type === "yesno" ? (
            <div className="inv-rsvp__row" key={q.id} role="radiogroup" aria-label={label}>
              <span>{label}</span>
              <span className="inv-rsvp__yn">
                {[dict.yes, dict.no].map((option) => (
                  <button type="button" role="radio" key={option} aria-checked={answers[q.id] === option} onClick={() => setAnswers((a) => ({ ...a, [q.id]: option }))}>
                    {option}
                  </button>
                ))}
              </span>
            </div>
          ) : (
            <label className="inv-rsvp__row" key={q.id}>
              <span>{label}</span>
              <input value={answers[q.id] ?? ""} maxLength={300} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
            </label>
          );
        })}

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
        {!preview && (
          <button type="submit" className="inv-rsvp__submit">
            {status === "sending" ? dict.sending : dict.submitRsvp}
          </button>
        )}
      </fieldset>
    </form>
  );
}
