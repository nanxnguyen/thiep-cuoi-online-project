import type { Metadata } from "next";
import { bankName } from "@/lib/banks";
import { CtaBand, MarketingLayout, PageHero } from "@/components/marketing/MarketingLayout";
import { DONATE_ACCOUNT, DONATE_MESSAGE } from "@/lib/donate";
import { vietQrUrl } from "@/lib/vietqr";

export const metadata: Metadata = {
  title: "Ủng hộ dự án",
  description: "MỘC hiện miễn phí và không có quảng cáo. Nếu thiệp giúp ích cho ngày cưới của hai bạn, có thể ủng hộ dự án qua chuyển khoản trực tiếp.",
  alternates: { canonical: "/ung-ho" },
};

export default function DonatePage() {
  const qrUrl = vietQrUrl(DONATE_ACCOUNT, "Ung ho MOC Wedding");

  return (
    <MarketingLayout>
      <PageHero
        crumbs={[{ label: "Ủng hộ dự án" }]}
        eyebrow="Ủng hộ dự án"
        title={
          <>
            MỘC miễn phí,
            <br />
            <em>nhờ vào tấm lòng của các cặp đôi.</em>
          </>
        }
        lede="Không thu phí, không quảng cáo. Nếu thiệp đã giúp ích cho ngày cưới của hai bạn, một khoản ủng hộ nhỏ sẽ giúp mình duy trì và phát triển MỘC lâu dài — hoàn toàn tự nguyện."
      />
      <div className="mk-section mk-narrow">
        <div className="mk-card" style={{ alignItems: "center", textAlign: "center" }}>
          <img src={qrUrl} alt={`Mã QR chuyển khoản ${bankName(DONATE_ACCOUNT.bankCode)} tới ${DONATE_ACCOUNT.accountName}`} width={220} height={220} loading="lazy" />
          <h3>{DONATE_MESSAGE}</h3>
          <p>Ngân hàng: {bankName(DONATE_ACCOUNT.bankCode)}</p>
          <p>Số tài khoản: {DONATE_ACCOUNT.accountNumber}</p>
          <p>Chủ tài khoản: {DONATE_ACCOUNT.accountName}</p>
          <p>Tiền chuyển thẳng vào tài khoản cá nhân của người làm MỘC — không qua trung gian, không hoàn tiền.</p>
        </div>
      </div>
      <CtaBand title="Chưa làm thiệp? Bắt đầu miễn phí ngay." />
    </MarketingLayout>
  );
}
