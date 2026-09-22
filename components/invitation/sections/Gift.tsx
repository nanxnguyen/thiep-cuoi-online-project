import type { Content } from "@/lib/content";
import { bankName } from "@/lib/banks";
import { isAccountComplete, vietQrUrl } from "@/lib/vietqr";
import { CopyButton } from "../client/CopyButton";
import { Reveal } from "../client/Reveal";

const HOLDER = { groom: "chú rể", bride: "cô dâu" } as const;

// Guests scan the QR with their banking app. The bank, number and holder are always printed as text as well,
// so the section still works if the QR image cannot load.
export function Gift({ content }: { content: Content }) {
  const { gift } = content;
  const accounts = gift.accounts.filter(isAccountComplete);
  if (!gift.enabled || accounts.length === 0) return null;

  return (
    <section className="inv-section inv-gift" aria-labelledby="inv-gift-h">
      <Reveal>
        <h2 className="inv-label" id="inv-gift-h">
          Hộp mừng cưới
        </h2>
        {gift.note.trim() && <p className="inv-lead">{gift.note}</p>}
        <div className="inv-accounts">
          {accounts.map((a) => (
            <article className="inv-account" key={a.holder + a.accountNumber}>
              <h3 className="inv-account__title">Mừng {HOLDER[a.holder]}</h3>
              <img
                className="inv-account__qr"
                src={vietQrUrl(a, "Mung cuoi")}
                alt={`Mã QR chuyển khoản mừng ${HOLDER[a.holder]}, tài khoản ${a.accountName}`}
                width={220}
                height={220}
                loading="lazy"
              />
              <dl className="inv-account__info">
                <div>
                  <dt>Ngân hàng</dt>
                  <dd>{bankName(a.bankCode)}</dd>
                </div>
                <div>
                  <dt>Số tài khoản</dt>
                  <dd className="inv-account__number">{a.accountNumber}</dd>
                </div>
                <div>
                  <dt>Chủ tài khoản</dt>
                  <dd>{a.accountName}</dd>
                </div>
              </dl>
              <CopyButton value={a.accountNumber} label={`Chép số tài khoản mừng ${HOLDER[a.holder]}`} />
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
