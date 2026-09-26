"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { celebrate } from "@/lib/celebrate";
import { pick, t, type Locale } from "@/lib/i18n";

type Question = { id: string; label: string; labelEn: string; type: "text" | "yesno" };
type Props = { slug?: string; preview: boolean; guestName: string; guestToken?: string; questions: Question[]; locale?: Locale };

export function RsvpForm({ slug, preview, guestName, guestToken = "", questions, locale = "vi" }: Props) {
  const dict = t(locale);
  const [name, setName] = useState(guestName);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");
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
        note: note.trim(),
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
      <div className="inv-card inv-done" role="status">
        <svg className="inv-done__tick" width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" />
          <path d="M15 27l7 7 15-15" />
        </svg>
        <p className="inv-done__title">{attending ? dict.doneAttending : dict.doneNotAttending}</p>
        <p>{dict.doneBody}</p>
        <button type="button" className="inv-btn inv-btn--ghost" onClick={() => setStatus("idle")}>
          {dict.editResponse}
        </button>
      </div>
    );
  }

  return (
    <form className="inv-form" onSubmit={submit} noValidate>
      <fieldset disabled={preview || status === "sending"}>
        <legend className="inv-sr-only">{dict.rsvpTitle}</legend>
        <label className="inv-field">
          <span>{dict.yourName}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" required />
        </label>

        <div className="inv-field" role="radiogroup" aria-label={dict.attendingQuestion}>
          <span>{dict.attendingQuestion}</span>
          <div className="inv-choices">
            <label className="inv-choice">
              <input type="radio" name="attending" checked={attending === true} onChange={() => setAttending(true)} />
              <span>{dict.attendingYes}</span>
            </label>
            <label className="inv-choice">
              <input type="radio" name="attending" checked={attending === false} onChange={() => setAttending(false)} />
              <span>{dict.attendingNo}</span>
            </label>
          </div>
        </div>

        {attending && (
          <label className="inv-field">
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
          return (
            <div className="inv-field" key={q.id} role={q.type === "yesno" ? "radiogroup" : undefined} aria-label={q.type === "yesno" ? label : undefined}>
              {q.type === "yesno" ? (
                <>
                  <span>{label}</span>
                  <div className="inv-choices">
                    {[dict.yes, dict.no].map((option) => (
                      <label className="inv-choice" key={option}>
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id] === option}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <label>
                  <span>{label}</span>
                  <input value={answers[q.id] ?? ""} maxLength={300} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                </label>
              )}
            </div>
          );
        })}

        <label className="inv-field">
          <span>{dict.noteLabel}</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} />
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
        <button type="submit" className="inv-btn inv-btn--block">
          {status === "sending" ? dict.sending : dict.submitRsvp}
        </button>
        {preview && <p className="inv-hint">{dict.previewHintForm}</p>}
      </fieldset>
    </form>
  );
}
