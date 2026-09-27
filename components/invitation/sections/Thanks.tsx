import Link from "next/link";
import type { Content } from "@/lib/content";
import { pick, t, type Locale } from "@/lib/i18n";
import { names } from "./shared";

export function Thanks({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  const dict = t(locale);
  const message = pick(locale, content.thanks.message, content.thanks.messageEn).trim();
  return (
    <>
      {content.sections.thanks && (
        <section className="inv-sec inv-thanks">
          <span className="inv-thanks__big">{dict.thankYou}</span>
          {message && <p className="inv-thanks__msg">{message}</p>}
          <span className="inv-thanks__names inv-name-font">{names(content, locale)}</span>
        </section>
      )}
      <Link className="inv-credit" href="/">
        {dict.madeWith}
      </Link>
    </>
  );
}
