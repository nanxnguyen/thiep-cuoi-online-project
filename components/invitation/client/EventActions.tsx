"use client";

import { useState } from "react";

// "Chỉ đường" opens Google Maps; the embedded map only loads after the guest asks for it,
// so a page with several events does not fetch several maps up front.
export function EventActions({ directions, embed, title }: { directions: string | null; embed: string | null; title: string }) {
  const [open, setOpen] = useState(false);
  if (!directions && !embed) return null;
  return (
    <>
      <div className="inv-actions">
        {directions && (
          <a className="inv-btn" href={directions} target="_blank" rel="noopener noreferrer">
            Chỉ đường
          </a>
        )}
        {embed && (
          <button type="button" className="inv-btn inv-btn--ghost" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? "Ẩn bản đồ" : "Xem bản đồ"}
          </button>
        )}
      </div>
      {open && embed && (
        <iframe
          className="inv-map"
          title={`Bản đồ: ${title}`}
          src={embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      )}
    </>
  );
}
