"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

// "Chỉ đường" opens Google Maps; the embedded map only loads after the guest asks for it,
// so a page with several events does not fetch several maps up front.
export function EventActions({ directions, embed, title, locale = "vi" }: { directions: string | null; embed: string | null; title: string; locale?: Locale }) {
  const dict = t(locale);
  const [open, setOpen] = useState(false);
  if (!directions && !embed) return null;
  return (
    <>
      <div className="inv-actions">
        {directions && (
          <a className="inv-btn" href={directions} target="_blank" rel="noopener noreferrer">
            {dict.directions}
          </a>
        )}
        {embed && (
          <button type="button" className="inv-btn inv-btn--ghost" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? dict.hideMap : dict.showMap}
          </button>
        )}
      </div>
      {open && embed && (
        <iframe
          className="inv-map"
          title={dict.mapTitle(title)}
          src={embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      )}
    </>
  );
}
