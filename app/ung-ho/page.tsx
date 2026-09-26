import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { bankName } from "@/lib/banks";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { DONATE_ACCOUNT, DONATE_MESSAGE } from "@/lib/donate";
import { vietQrUrl } from "@/lib/vietqr";
import { CopyRows } from "./CopyRows";
import "./donate.css";

export const metadata: Metadata = {
  title: "Ủng hộ dự án",
  description: "MỘC hiện miễn phí và không có quảng cáo. Nếu thiệp giúp ích cho ngày cưới của hai bạn, có thể ủng hộ dự án qua chuyển khoản trực tiếp.",
  alternates: { canonical: "/ung-ho" },
};

const USES = ["Trả tiền máy chủ để thiệp luôn mở nhanh", "Thiết kế thêm mẫu thiệp mới", "Giữ Mộc miễn phí cho mọi người"];
const rnd = (i: number, n: number) => {
  const x = Math.sin(i * 71.3 + n * 9.1) * 1e4;
  return x - Math.floor(x);
};
const HEARTS = Array.from({ length: 16 }, (_, i) => {
  const d = 6 + rnd(i, 1) * 6;
  return { left: `${rnd(i, 2) * 100}%`, size: 12 + rnd(i, 3) * 18, dur: `${d}s`, delay: `${-rnd(i, 4) * d}s` };
});

// design/Ung Ho.dc.html. The QR is a real VietQR for the owner's account (lib/donate.ts), not a placeholder slot.
export default function DonatePage() {
  const bank = bankName(DONATE_ACCOUNT.bankCode);
  const qrUrl = vietQrUrl(DONATE_ACCOUNT, "Ung ho MOC Wedding");
  return (
    <>
      <SiteHeader />
      <main>
        <section className="donate-hero">
          <div className="donate-hearts" aria-hidden="true">
            {HEARTS.map((h, i) => (
              <span key={i} style={{ left: h.left, fontSize: h.size, animationDuration: h.dur, animationDelay: h.delay } as CSSProperties}>
                ♥
              </span>
            ))}
          </div>
          <div className="donate-hero__inner">
            <div className="donate-hero__copy">
              <span className="donate-hero__heart" aria-hidden="true">♥</span>
              <h1>
                Ủng hộ <em>Mộc</em>
              </h1>
              <p>Mộc miễn phí cho tất cả mọi người. Nếu tấm thiệp giúp ngày cưới của bạn nhẹ nhàng hơn, một khoản ủng hộ nhỏ sẽ giúp dự án tiếp tục.</p>
              <ol>
                {USES.map((u, i) => (
                  <li key={u}>
                    <span>{i + 1}</span>
                    {u}
                  </li>
                ))}
              </ol>
            </div>
            <div className="donate-card">
              <div className="donate-card__head">
                <span>CHUYỂN KHOẢN</span>
                <span className="donate-card__bank">{bank}</span>
              </div>
              <div className="donate-card__qr">
                <img src={qrUrl} alt={`Mã QR chuyển khoản ${bank} tới ${DONATE_ACCOUNT.accountName}`} width={320} height={320} loading="lazy" />
              </div>
              <CopyRows
                rows={[
                  ["Ngân hàng", bank],
                  ["Chủ tài khoản", DONATE_ACCOUNT.accountName],
                  ["Số tài khoản", DONATE_ACCOUNT.accountNumber],
                  ["Nội dung", DONATE_MESSAGE],
                ]}
              />
            </div>
          </div>
        </section>
        <section className="donate-quote">
          <span>“Không ủng hộ cũng không sao. Hãy dùng Mộc, và kể cho một cặp đôi khác nghe.”</span>
          <Link href="/studio">
            Tạo thiệp miễn phí
          </Link>
        </section>
      </main>
      <SiteFooter cta={false} />
    </>
  );
}
