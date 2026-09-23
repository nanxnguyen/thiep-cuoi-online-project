import type { Content } from "@/lib/content";
import { pick, t, type Locale } from "@/lib/i18n";
import { Reveal } from "../client/Reveal";

export function Couple({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  const dict = t(locale);
  const { couple } = content;
  const groom = couple.groom.name.trim();
  const bride = couple.bride.name.trim();
  const message = pick(locale, couple.message, couple.messageEn);
  return (
    <section className="inv-section inv-couple" aria-labelledby="inv-couple-h">
      <Reveal>
        <h2 className="inv-label" id="inv-couple-h">
          {dict.inviteTitle}
        </h2>
        {message.trim() && <p className="inv-message">{message}</p>}
        <div className="inv-pair">
          <div>
            <span className="inv-role">{dict.groomFallback}</span>
            <span className="inv-pair__name">{groom || "—"}</span>
          </div>
          <div>
            <span className="inv-role">{dict.brideFallback}</span>
            <span className="inv-pair__name">{bride || "—"}</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
