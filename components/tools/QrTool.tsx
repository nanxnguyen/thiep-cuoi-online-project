"use client";

import { useState } from "react";
import { isHttpUrl } from "@/components/studio/fields";
import { qrImageUrl } from "@/lib/tools/qr";

// design/CC Tao QR.dc.html: link field → 220px QR tile beside the download action.
export function QrTool() {
  const [link, setLink] = useState("https://moc.vn/invite/vy-khoi");
  const trimmed = link.trim();
  const valid = trimmed !== "" && isHttpUrl(trimmed);
  const error = trimmed !== "" && !valid;
  const src = valid ? qrImageUrl(trimmed) : "";

  return (
    <>
      <label className="tool-field">
        Link cần tạo mã
        <input
          className="tool-qr-input"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          inputMode="url"
          maxLength={500}
          placeholder="https://moc.vn/invite/vy-khoi"
          aria-invalid={error}
          aria-describedby={error ? "qr-error" : undefined}
        />
        {error && (
          <span className="tool-error" id="qr-error">
            Link cần bắt đầu bằng http:// hoặc https://
          </span>
        )}
      </label>
      <div className="tool-qr">
        <div className="tool-qr__tile">
          {valid ? <img src={src} alt={`Mã QR cho ${trimmed}`} width={220} height={220} /> : <span>Nhập link để xem mã QR</span>}
        </div>
        <div className="tool-qr__side">
          <a className="tool-qr__dl" href={src || undefined} download="ma-qr-moc.png" aria-disabled={!valid} tabIndex={valid ? undefined : -1}>
            Tải mã QR (PNG)
          </a>
          <span>Mã được tạo qua dịch vụ QR miễn phí, không lưu lại link của bạn.</span>
        </div>
      </div>
    </>
  );
}
