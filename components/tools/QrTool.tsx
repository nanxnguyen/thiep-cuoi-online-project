"use client";

import { useState } from "react";
import { TextField, isHttpUrl } from "@/components/studio/fields";
import { qrImageUrl } from "@/lib/tools/qr";

export function QrTool() {
  const [link, setLink] = useState("");
  const [touched, setTouched] = useState(false);
  const trimmed = link.trim();
  const valid = trimmed !== "" && isHttpUrl(trimmed);
  const error = touched && trimmed !== "" && !valid ? "Link phải bắt đầu bằng http:// hoặc https:// và không có khoảng trắng." : undefined;

  return (
    <div className="card tool-result">
      <TextField
        label="Đường link"
        hint="Ví dụ: https://moc.wedding/invite/ten-thiep"
        error={error}
        value={link}
        onChange={setLink}
        onBlur={() => setTouched(true)}
        inputMode="url"
        maxLength={500}
        placeholder="https://"
        autoFocus
      />
      {valid && (
        <>
          <img src={qrImageUrl(trimmed)} alt={`Mã QR cho ${trimmed}`} width={320} height={320} />
          <div className="tool-result__meta">
            <span>Quét thử bằng camera điện thoại trước khi in.</span>
            <a className="button-ghost" href={qrImageUrl(trimmed)} download="ma-qr-thiep.png">
              Tải mã QR
            </a>
          </div>
          <p className="pn-hint">
            Nếu nút tải không tự lưu ảnh (một số trình duyệt trên iPhone mở ảnh ở tab mới), hãy chạm giữ vào ảnh QR để lưu.
          </p>
        </>
      )}
    </div>
  );
}
