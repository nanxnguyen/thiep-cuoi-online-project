"use client";

import { useState } from "react";
import { TextField } from "@/components/studio/fields";
import { buildInviteMessages } from "@/lib/tools/inviteMessage";

type Form = { groom: string; bride: string; date: string; link: string; guestName: string };
const blank: Form = { groom: "", bride: "", date: "", link: "", guestName: "" };

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button type="button" className="button-ghost pn-compact" onClick={copy}>
      {copied ? "Đã sao chép" : "Sao chép"}
    </button>
  );
}

export function InviteMessageTool() {
  const [form, setForm] = useState<Form>(blank);
  const { friendly, formal } = buildInviteMessages(form);

  return (
    <div className="card tool-result">
      <div className="pn-row">
        <TextField label="Tên chú rể" value={form.groom} onChange={(groom) => setForm((f) => ({ ...f, groom }))} maxLength={80} placeholder="Nam" />
        <TextField label="Tên cô dâu" value={form.bride} onChange={(bride) => setForm((f) => ({ ...f, bride }))} maxLength={80} placeholder="Lan" />
      </div>
      <div className="pn-row">
        <TextField label="Ngày cưới" hint="Không bắt buộc." type="date" value={form.date} onChange={(date) => setForm((f) => ({ ...f, date }))} />
        <TextField label="Tên người nhận" hint="Không bắt buộc." value={form.guestName} onChange={(guestName) => setForm((f) => ({ ...f, guestName }))} maxLength={80} placeholder="Chú Ba" />
      </div>
      <TextField label="Link thiệp" hint="Không bắt buộc." value={form.link} onChange={(link) => setForm((f) => ({ ...f, link }))} inputMode="url" maxLength={500} placeholder="https://" />

      <div className="pn-stack">
        <div className="pn-item">
          <div className="pn-item__head">
            <h3 className="pn-item__title">Gần gũi</h3>
            <CopyButton text={friendly} />
          </div>
          <p>{friendly}</p>
        </div>
        <div className="pn-item">
          <div className="pn-item__head">
            <h3 className="pn-item__title">Trang trọng</h3>
            <CopyButton text={formal} />
          </div>
          <p>{formal}</p>
        </div>
      </div>
    </div>
  );
}
