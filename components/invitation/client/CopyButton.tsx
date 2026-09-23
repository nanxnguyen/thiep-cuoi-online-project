"use client";

import { useState } from "react";
import { t, type Locale } from "@/lib/i18n";

export function CopyButton({ value, label, locale = "vi" }: { value: string; label: string; locale?: Locale }) {
  const dict = t(locale);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API can be blocked (insecure context, permissions): fall back to a temporary textarea.
      const area = document.createElement("textarea");
      area.value = value;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" className="inv-btn inv-btn--ghost inv-btn--small" onClick={copy} aria-label={label}>
      <span aria-live="polite">{copied ? dict.copied : dict.copyNumber}</span>
    </button>
  );
}
