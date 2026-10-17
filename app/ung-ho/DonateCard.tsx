"use client";

import { useState } from "react";
import { bankName } from "@/lib/banks";
import { DONATE_ACCOUNT, DONATE_AMOUNTS, DONATE_MESSAGE } from "@/lib/donate";
import { vietQrUrl } from "@/lib/vietqr";
import { CopyRows } from "./CopyRows";

// Transfer card of design/Ung Ho.dc.html: amount chips (toggle), impact line, QR, copy rows.
// Unlike the design's static image slot the QR is a real VietQR that also encodes the chosen amount.
export function DonateCard() {
  const [amount, setAmount] = useState<number | null>(null);
  const bank = bankName(DONATE_ACCOUNT.bankCode);
  const chosen = DONATE_AMOUNTS.find((a) => a[0] === amount);
  const qrUrl = vietQrUrl(DONATE_ACCOUNT, "Ung ho MOC Wedding", chosen?.[0] ?? 0);
  return (
    <div className="donate-card" id="bank-card">
      <div className="donate-card__head">
        <span>CHUYỂN KHOẢN</span>
        <span className="donate-card__bank">{bank}</span>
      </div>
      <div className="donate-amounts">
        <span>Chọn mức ủng hộ</span>
        <div>
          {DONATE_AMOUNTS.map(([value, label]) => (
            <button key={value} type="button" aria-pressed={amount === value} data-on={amount === value} onClick={() => setAmount(amount === value ? null : value)}>
              {label}
            </button>
          ))}
        </div>
        {chosen && <span className="donate-amounts__impact" key={chosen[0]}>♥ {chosen[2]}</span>}
      </div>
      <div className="donate-card__qr">
        <img src={qrUrl} alt={`Mã QR chuyển khoản ${bank}${chosen ? `, ${chosen[1]}` : ""}`} width={320} height={320} loading="lazy" />
      </div>
      <CopyRows
        rows={[
          ["Ngân hàng", bank],
          ["Số tài khoản", DONATE_ACCOUNT.accountNumber],
          ...(chosen ? ([["Số tiền", chosen[1]]] as const) : []),
          ["Nội dung", DONATE_MESSAGE],
        ]}
      />
    </div>
  );
}
