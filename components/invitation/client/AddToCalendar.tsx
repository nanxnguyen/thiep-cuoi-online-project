"use client";

import { toIcs, googleCalendarUrl, type CalendarEvent } from "@/lib/ics";

export function AddToCalendar({ event, uid }: { event: CalendarEvent; uid: string }) {
  const google = googleCalendarUrl(event);

  function downloadIcs() {
    const ics = toIcs(event, uid);
    if (!ics) return;
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "thiep-cuoi.ics";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="inv-actions">
      {google && (
        <a className="inv-btn" href={google} target="_blank" rel="noopener noreferrer">
          Thêm vào Google Calendar
        </a>
      )}
      <button type="button" className="inv-btn inv-btn--ghost" onClick={downloadIcs}>
        Tải lịch (.ics)
      </button>
    </div>
  );
}
