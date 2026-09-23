import type { Content } from "@/lib/content";
import { bankName } from "@/lib/banks";
import { pick, t, type Locale } from "@/lib/i18n";
import { isAccountComplete, vietQrUrl } from "@/lib/vietqr";
import { CopyButton } from "../client/CopyButton";
import { Reveal } from "../client/Reveal";

// Guests scan the QR with their banking app. The bank, number and holder are always printed as text as well,
// so the section still works if the QR image cannot load.
export function Gift({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  const dict = t(locale);
  const { gift } = content;
  const accounts = gift.accounts.filter(isAccountComplete);
  if (!gift.enabled || accounts.length === 0) return null;
  const note = pick(locale, gift.note, gift.noteEn);

  return (
    <section className="inv-section inv-gift" aria-labelledby="inv-gift-h">
      <Reveal>
        <h2 className="inv-label" id="inv-gift-h">
          {dict.giftTitle}
        </h2>
        {note.trim() && <p className="inv-lead">{note}</p>}
        <div className="inv-accounts">
          {accounts.map((a) => (
            <article className="inv-account" key={a.holder + a.accountNumber}>
              <h3 className="inv-account__title">{dict.accountTitle(dict.holderLabel[a.holder])}</h3>
              <img
                className="inv-account__qr"
                src={vietQrUrl(a, "Mung cuoi")}
                alt={dict.qrAlt(dict.holderLabel[a.holder], a.accountName)}
                width={220}
                height={220}
                loading="lazy"
              />
              <dl className="inv-account__info">
                <div>
                  <dt>{dict.bankLabel}</dt>
                  <dd>{bankName(a.bankCode)}</dd>
                </div>
                <div>
                  <dt>{dict.accountNumberLabel}</dt>
                  <dd className="inv-account__number">{a.accountNumber}</dd>
                </div>
                <div>
                  <dt>{dict.accountNameLabel}</dt>
                  <dd>{a.accountName}</dd>
                </div>
              </dl>
              <CopyButton value={a.accountNumber} label={dict.copyAccountLabel(dict.holderLabel[a.holder])} locale={locale} />
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
