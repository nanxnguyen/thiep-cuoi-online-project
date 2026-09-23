"use client";

import { toIcs, googleCalendarUrl, type CalendarEvent } from "@/lib/ics";
import { t, type Locale } from "@/lib/i18n";

export function AddToCalendar({ event, uid, locale = "vi" }: { event: CalendarEvent; uid: string; locale?: Locale }) {
  const dict = t(locale);
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
          {dict.addGoogleCal}
        </a>
      )}
      <button type="button" className="inv-btn inv-btn--ghost" onClick={downloadIcs}>
        {dict.downloadIcs}
      </button>
    </div>
  );
}
