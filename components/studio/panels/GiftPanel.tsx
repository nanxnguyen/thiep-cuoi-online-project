"use client";

import { useEffect, useState } from "react";
import { AddButton, Glyph, IconButton, PanelSection, SelectField, TextAreaField, TextField, ToggleField, useListFocus, type Option, type PanelProps } from "@/components/studio/fields";
import { BANKS, bankName } from "@/lib/banks";
import { toBankName } from "@/lib/bank-name";
import { MAX_ACCOUNTS, SAMPLE_NAMES, type Content } from "@/lib/content";
import { removeAt, updateAt } from "@/lib/list";
import { isAccountComplete, vietQrUrl } from "@/lib/vietqr";

type Account = Content["gift"]["accounts"][number];

const HOLDER_TEXT = { groom: "chú rể", bride: "cô dâu" } as const;
const HOLDER_OPTIONS: Option[] = [
  { value: "groom", label: "Chú rể" },
  { value: "bride", label: "Cô dâu" },
];
const BANK_OPTIONS: Option[] = BANKS.map((b) => ({ value: b.bin, label: b.name }));
const asHolder = (v: string): Account["holder"] => (v === "bride" ? "bride" : "groom");
// A saved bank code that is not in our list must stay selectable, or opening the panel would hide it.
const bankOptions = (code: string): Option[] => (code && !BANKS.some((b) => b.bin === code) ? [{ value: code, label: `Mã ngân hàng ${code}` }, ...BANK_OPTIONS] : BANK_OPTIONS);

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

function missingParts(a: Account): string[] {
  const out: string[] = [];
  if (!a.bankCode) out.push("ngân hàng");
  if (!/^\d{6,20}$/.test(a.accountNumber)) out.push("số tài khoản (6 đến 20 số)");
  if (!a.accountName.trim()) out.push("tên chủ tài khoản");
  return out;
}

// The QR is what guests will scan, so the couple can check it here. The image URL changes with every
// keystroke once the account is complete; it is debounced so the free QR service is not hammered while typing.
function QrPreview({ account }: { account: Account }) {
  const complete = isAccountComplete(account);
  const url = complete ? vietQrUrl(account, "Mung cuoi") : "";
  const shown = useDebounced(url, 600);
  const [failed, setFailed] = useState("");
  return (
    <div aria-live="polite">
      {!complete ? (
        <p className="pn-note">Nhập thêm {missingParts(account).join(", ")} để xem mã QR.</p>
      ) : !shown ? (
        <p className="pn-note">Đang tạo mã QR…</p>
      ) : failed === shown ? (
        <p className="pn-note pn-note--warn">Chưa tải được mã QR xem trước. Khách vẫn thấy đủ số tài khoản trên thiệp.</p>
      ) : (
        <>
          {/* Same text on every refresh, so a screen reader hears it once; the tile itself is muted (live=off) while typing. */}
          <p className="pn-sr">Mã QR đã sẵn sàng.</p>
          <div className={`pn-qr${shown !== url ? " pn-qr--stale" : ""}`} aria-live="off">
            <img src={shown} alt={`Mã QR chuyển khoản mừng ${HOLDER_TEXT[account.holder]}, tài khoản ${bankName(account.bankCode)} ${account.accountNumber}, chủ tài khoản ${account.accountName}`} onError={() => setFailed(shown)} />
            <small>Khách sẽ quét mã này trên thiệp.</small>
          </div>
        </>
      )}
    </div>
  );
}

export function GiftPanel({ content, onChange }: PanelProps) {
  const { gift, couple } = content;
  const [freshIndex, setFreshIndex] = useState(-1); // account just added: its first field takes focus
  const focus = useListFocus<HTMLOListElement>();

  const setGift = (patch: Partial<Content["gift"]>) => onChange({ ...content, gift: { ...gift, ...patch } });
  const patchAccount = (i: number, patch: Partial<Account>) => setGift({ accounts: updateAt(gift.accounts, i, patch) });

  function add() {
    // Offer the other holder first: most couples list one account each.
    const holder: Account["holder"] = gift.accounts.some((a) => a.holder === "groom") && !gift.accounts.some((a) => a.holder === "bride") ? "bride" : "groom";
    setFreshIndex(gift.accounts.length);
    setGift({ accounts: [...gift.accounts, { holder, bankCode: "", accountNumber: "", accountName: "" }] });
  }
  function remove(i: number) {
    focus.focusNext(String(Math.min(i, gift.accounts.length - 2)), "remove");
    setGift({ accounts: removeAt(gift.accounts, i) });
  }
  // After the number is typed, the name is the next field: offer the holder's own name in bank style.
  function suggestName(i: number) {
    const a = gift.accounts[i];
    const person = couple[a.holder].name.trim();
    if (a.accountName.trim() !== "" || person === "" || person === SAMPLE_NAMES[a.holder]) return;
    patchAccount(i, { accountName: toBankName(person).slice(0, 80) });
  }
  // Banks print names in capitals without diacritics; tidy what was typed once the user leaves the field.
  function tidyName(i: number) {
    const a = gift.accounts[i];
    const tidy = toBankName(a.accountName).slice(0, 80);
    if (tidy !== a.accountName) patchAccount(i, { accountName: tidy });
  }

  const full = gift.accounts.length >= MAX_ACCOUNTS;
  return (
    <div className="pn-stack">
      <PanelSection title="Mừng cưới" description="Khách quét mã QR bằng app ngân hàng để chuyển khoản mừng cưới.">
        <ToggleField label="Hiện hộp mừng cưới trên thiệp" hint="Tắt nếu bạn không nhận mừng cưới qua chuyển khoản." checked={gift.enabled} onChange={(enabled) => setGift({ enabled })} />
        {gift.enabled ? (
          <>
            <TextAreaField label="Lời nhắn" hint="Hiện phía trên mã QR." value={gift.note} onChange={(note) => setGift({ note })} maxLength={300} rows={3} />
            <div className="pn-subhead">
              <h4>Tài khoản nhận mừng</h4>
              <span className="pn-count">
                {gift.accounts.length}/{MAX_ACCOUNTS}
              </span>
            </div>
            <p className="pn-hint">Chỉ tài khoản điền đủ ngân hàng, số tài khoản và tên chủ tài khoản mới hiện trên thiệp.</p>
            {gift.accounts.length === 0 ? <p className="pn-empty">Chưa có tài khoản nào. Thêm một tài khoản để khách có mã QR mừng cưới.</p> : null}
            <ol className="pn-list" ref={focus.listRef}>
              {gift.accounts.map((a, i) => (
                <li key={i} className="pn-item" data-key={String(i)}>
                  <div className="pn-item__head">
                    <h4 className="pn-item__title">Tài khoản {i + 1}</h4>
                    <div className="pn-item__actions">
                      <IconButton label={`Xóa tài khoản ${i + 1}`} tone="danger" data-act="remove" onClick={() => remove(i)}>
                        <Glyph name="trash" />
                      </IconButton>
                    </div>
                  </div>
                  <div className="pn-item__body">
                    <SelectField label="Tài khoản của" value={a.holder} onChange={(v) => patchAccount(i, { holder: asHolder(v) })} options={HOLDER_OPTIONS} autoFocus={i === freshIndex} />
                    <SelectField label="Ngân hàng" placeholder="Chọn ngân hàng" value={a.bankCode} onChange={(bankCode) => patchAccount(i, { bankCode })} options={bankOptions(a.bankCode)} />
                    <TextField
                      label="Số tài khoản"
                      hint="Chỉ nhập số, không cần dấu cách."
                      inputMode="numeric"
                      value={a.accountNumber}
                      onChange={(v) => patchAccount(i, { accountNumber: v.replace(/\D/g, "").slice(0, 20) })}
                      onBlur={() => suggestName(i)}
                    />
                    <TextField label="Tên chủ tài khoản" hint="Viết hoa, không dấu, đúng như tên trên thẻ ngân hàng." value={a.accountName} onChange={(accountName) => patchAccount(i, { accountName })} onBlur={() => tidyName(i)} maxLength={80} placeholder="NGUYEN VAN MINH" />
                    <QrPreview account={a} />
                  </div>
                </li>
              ))}
            </ol>
            <AddButton onClick={add} disabled={full}>
              {full ? `Đã đủ ${MAX_ACCOUNTS} tài khoản` : "Thêm tài khoản"}
            </AddButton>
          </>
        ) : null}
      </PanelSection>
    </div>
  );
}
