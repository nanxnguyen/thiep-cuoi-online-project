export type GiftAccount = {
  holder: "groom" | "bride";
  bankCode: string; // the bank's BIN, see lib/banks.ts
  accountNumber: string;
  accountName: string;
};

export const isAccountComplete = (a: GiftAccount) =>
  a.bankCode !== "" && /^\d{6,20}$/.test(a.accountNumber) && a.accountName.trim() !== "";

// Image endpoint of the free VietQR service; guests scan it with their banking app.
// The UI always shows the plain account details too, so a dead image never blocks a transfer.
export function vietQrUrl(a: GiftAccount, addInfo = ""): string {
  const enc = encodeURIComponent;
  const info = addInfo ? `&addInfo=${enc(addInfo)}` : "";
  return `https://img.vietqr.io/image/${enc(a.bankCode)}-${a.accountNumber}-compact2.png?accountName=${enc(a.accountName.trim())}${info}`;
}
