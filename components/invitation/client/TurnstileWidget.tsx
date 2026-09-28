"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

type Props = {
  action: "rsvp" | "wish";
  locale: Locale;
  onToken: (token: string) => void;
  resetSignal: number;
};

// Public identifier, safe to bundle. Empty when unconfigured so the UI shows
// the "not configured" state instead of silently using another env's key.
const siteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();

export function TurnstileWidget({ action, locale, onToken, resetSignal }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [problem, setProblem] = useState("");
  const retryMessage = locale === "en" ? "Verification expired. Please try again." : "Xác minh đã hết hạn, vui lòng thử lại.";

  const acceptToken = useCallback((token: string) => {
    setProblem("");
    onToken(token);
  }, [onToken]);

  const render = useCallback(() => {
    if (!siteKey || !container.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      action,
      size: "flexible",
      callback: acceptToken,
      "expired-callback": () => { onToken(""); setProblem(retryMessage); },
      "error-callback": () => { onToken(""); setProblem(retryMessage); },
    });
  }, [acceptToken, action, onToken, retryMessage]);

  useEffect(() => {
    render();
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [render]);

  useEffect(() => {
    if (resetSignal && widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      onToken("");
      setProblem("");
    }
  }, [onToken, resetSignal]);

  if (!siteKey) return <p className="inv-error" role="alert">{locale === "en" ? "Spam protection is not configured." : "Xác minh chống spam chưa được cấu hình."}</p>;

  return (
    <div className="inv-turnstile">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={render} />
      <div ref={container} />
      {problem && <p className="inv-error" role="alert">{problem}</p>}
    </div>
  );
}
