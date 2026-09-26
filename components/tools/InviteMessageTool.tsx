"use client";

import { useRef, useState } from "react";
import { inviteMessages, type InviteTone } from "@/lib/tools/inviteMessage";

const TONES: [InviteTone, string][] = [
  ["formal", "Trang trọng"],
  ["friendly", "Thân mật"],
];

// design/CC Tin Nhan.dc.html: bride/groom/link → tone switch → three ready-to-copy messages, with a toast.
export function InviteMessageTool() {
  const [form, setForm] = useState({ bride: "", groom: "", link: "" });
  const [tone, setTone] = useState<InviteTone>("formal");
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Đã sao chép tin nhắn");
    } catch {
      setToast("Không sao chép được, hãy chọn chữ và sao chép tay");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 1800);
  }

  return (
    <>
      <div className="tool-form-grid">
        <label className="tool-field">
          Tên cô dâu
          <input className="input" value={form.bride} onChange={set("bride")} maxLength={80} placeholder="Hạ Vy" />
        </label>
        <label className="tool-field">
          Tên chú rể
          <input className="input" value={form.groom} onChange={set("groom")} maxLength={80} placeholder="Minh Khôi" />
        </label>
        <label className="tool-field tool-field--full">
          Link thiệp
          <input className="input" value={form.link} onChange={set("link")} inputMode="url" maxLength={500} placeholder="https://moc.vn/invite/vy-khoi" />
        </label>
      </div>
      <div className="tool-segment" role="group" aria-label="Giọng điệu">
        {TONES.map(([key, label]) => (
          <button key={key} type="button" aria-pressed={tone === key} onClick={() => setTone(key)}>
            {label}
          </button>
        ))}
      </div>
      <ul className="tool-messages">
        {inviteMessages(tone, form).map((text) => (
          <li key={text}>
            <p className="script">{text}</p>
            <button type="button" className="tool-copy" onClick={() => void copy(text)}>
              Sao chép
            </button>
          </li>
        ))}
      </ul>
      <div className="tool-toast" role="status" aria-live="polite">
        {toast && <span key={toast + Date.now()}>{toast}</span>}
      </div>
    </>
  );
}
