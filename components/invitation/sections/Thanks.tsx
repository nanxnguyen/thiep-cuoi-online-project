import Link from "next/link";
import type { Content } from "@/lib/content";
import { pick, t, type Locale } from "@/lib/i18n";
import { Reveal } from "../client/Reveal";

export function Thanks({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  const dict = t(locale);
  const { thanks, couple } = content;
  const message = pick(locale, thanks.message, thanks.messageEn);
  return (
    <footer className="inv-section inv-thanks">
      <Reveal>
        {message.trim() && <p className="inv-thanks__msg">{message}</p>}
        <p className="inv-thanks__names">
          <span className="inv-thanks__name">{couple.groom.name.trim() || dict.groomFallback}</span>
          <span className="inv-thanks__amp" aria-hidden="true">
            &amp;
          </span>
          <span className="inv-thanks__name">{couple.bride.name.trim() || dict.brideFallback}</span>
        </p>
        <p className="inv-credit">
          {dict.creditPrefix}
          <Link href="/">MỘC</Link>
        </p>
      </Reveal>
    </footer>
  );
}
