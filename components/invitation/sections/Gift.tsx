import { bankName } from "@/lib/banks";
import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import { isAccountComplete, vietQrUrl } from "@/lib/vietqr";

// Two cards (groom, bride): who, the VietQR code, bank, account number and holder. The number is always printed as
// text too, so the section still works when the QR image cannot load.
export function Gift({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  const { gift } = content;
  if (!content.sections.gift || !gift.enabled || gift.accounts.length === 0) return null;
  const dict = t(locale);
  return (
    <section id="mung-cuoi" className="inv-sec inv-gift">
      <span className="inv-k">{dict.giftTitle}</span>
      <div className="inv-gift__grid">
        {gift.accounts.map((a) => (
          <article className="inv-gift__card" key={a.holder}>
            <span className="inv-gift__who">{dict.holderLabel[a.holder]}</span>
            {isAccountComplete(a) ? (
              <img className="inv-gift__qr" src={vietQrUrl(a, "Mung cuoi")} alt={dict.qrAlt(dict.holderLabel[a.holder], a.accountName)} width={84} height={84} loading="lazy" />
            ) : (
              <span className="inv-gift__qr inv-gift__qr--empty">VietQR</span>
            )}
            <span className="inv-gift__bank">{bankName(a.bankCode)}</span>
            <span className="inv-gift__acc" data-empty={!a.accountNumber || undefined}>
              {a.accountNumber || dict.noAccount}
            </span>
            <span className="inv-gift__name">{a.accountName}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
