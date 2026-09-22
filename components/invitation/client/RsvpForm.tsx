"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { celebrate } from "@/lib/celebrate";

type Question = { id: string; label: string; type: "text" | "yesno" };
type Props = { slug?: string; preview: boolean; guestName: string; guestToken?: string; questions: Question[] };

export function RsvpForm({ slug, preview, guestName, guestToken = "", questions }: Props) {
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
    if (!name.trim()) return fail("Hãy cho chúng mình biết tên bạn.");
    if (attending === null) return fail("Bạn sẽ đến chứ? Hãy chọn một đáp án.");
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
      fail(err instanceof Error ? err.message : "Chưa gửi được, bạn thử lại nhé.");
    }
  }

  if (status === "done") {
    return (
      <div className="inv-card inv-done" role="status">
        <p className="inv-done__title">{attending ? "Hẹn gặp bạn nhé!" : "Cảm ơn bạn đã báo cho chúng mình."}</p>
        <p>Chúng mình đã nhận được phản hồi của bạn. Cần đổi ý, bạn cứ gửi lại.</p>
        <button type="button" className="inv-btn inv-btn--ghost" onClick={() => setStatus("idle")}>
          Sửa phản hồi
        </button>
      </div>
    );
  }

  return (
    <form className="inv-form" onSubmit={submit} noValidate>
      <fieldset disabled={preview || status === "sending"}>
        <legend className="inv-sr-only">Xác nhận tham dự</legend>
        <label className="inv-field">
          <span>Tên của bạn</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" required />
        </label>

        <div className="inv-field" role="radiogroup" aria-label="Bạn có tham dự không?">
          <span>Bạn có tham dự không?</span>
          <div className="inv-choices">
            <label className="inv-choice">
              <input type="radio" name="attending" checked={attending === true} onChange={() => setAttending(true)} />
              <span>Mình sẽ đến</span>
            </label>
            <label className="inv-choice">
              <input type="radio" name="attending" checked={attending === false} onChange={() => setAttending(false)} />
              <span>Mình không đến được</span>
            </label>
          </div>
        </div>

        {attending && (
          <label className="inv-field">
            <span>Số người đi cùng (tính cả bạn)</span>
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

        {questions.map((q) => (
          <div className="inv-field" key={q.id} role={q.type === "yesno" ? "radiogroup" : undefined} aria-label={q.type === "yesno" ? q.label : undefined}>
            {q.type === "yesno" ? (
              <>
                <span>{q.label}</span>
                <div className="inv-choices">
                  {["Có", "Không"].map((option) => (
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
                <span>{q.label}</span>
                <input value={answers[q.id] ?? ""} maxLength={300} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
              </label>
            )}
          </div>
        ))}

        <label className="inv-field">
          <span>Lời nhắn (không bắt buộc)</span>
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
          {status === "sending" ? "Đang gửi…" : "Gửi xác nhận"}
        </button>
        {preview && <p className="inv-hint">Chế độ xem thử: biểu mẫu chưa gửi được.</p>}
      </fieldset>
    </form>
  );
}
