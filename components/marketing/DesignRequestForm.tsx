"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { BUDGETS, designRequestSchema } from "@/lib/design-request";

const empty = { name: "", phone: "", email: "", weddingDate: "", budget: "", details: "", referenceLinks: "", website: "" };

export function DesignRequestForm() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const set = (key: keyof typeof empty) => (e: { currentTarget: { value: string } }) => {
    const value = e.currentTarget.value; // read now: currentTarget is null by the time the updater runs
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = designRequestSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Thông tin chưa hợp lệ.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      await api.submitDesignRequest(parsed.data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa gửi được, bạn thử lại sau nhé.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="custom-done" role="status">
        <h3>Mộc đã nhận yêu cầu của bạn</h3>
        <p>Mộc sẽ liên hệ qua số điện thoại hoặc Zalo bạn để lại, thường trong vòng 1 ngày làm việc.</p>
      </div>
    );
  }

  return (
    <form className="custom-form" onSubmit={submit} noValidate>
      <fieldset disabled={status === "sending"}>
        <legend className="mk-sr">Yêu cầu thiết kế thiệp riêng</legend>
        <div className="custom-form__row">
          <label className="field">
            <span>Tên của bạn *</span>
            <input name="name" className="input" value={form.name} onChange={set("name")} maxLength={80} autoComplete="name" required />
          </label>
          <label className="field">
            <span>Số điện thoại / Zalo *</span>
            <input name="phone" className="input" type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} maxLength={30} autoComplete="tel" required />
          </label>
        </div>
        <div className="custom-form__row">
          <label className="field">
            <span>Email</span>
            <input name="email" className="input" type="email" value={form.email} onChange={set("email")} maxLength={120} autoComplete="email" />
          </label>
          <label className="field">
            <span>Ngày cưới</span>
            <input name="weddingDate" className="input" type="date" value={form.weddingDate} onChange={set("weddingDate")} />
          </label>
        </div>
        <label className="field">
          <span>Ngân sách dự kiến</span>
          <select name="budget" className="select" value={form.budget} onChange={set("budget")}>
            <option value="">Chọn khoảng ngân sách</option>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Ý tưởng của bạn *</span>
          <textarea name="details" className="textarea" rows={5} value={form.details} onChange={set("details")} maxLength={2000} placeholder="Phong cách, màu sắc, điều bạn muốn có trên thiệp…" required />
        </label>
        <label className="field">
          <span>Link ảnh hoặc thiệp tham khảo</span>
          <textarea name="referenceLinks" className="textarea" rows={2} value={form.referenceLinks} onChange={set("referenceLinks")} maxLength={1000} placeholder="Dán link Google Drive, Pinterest, Instagram…" />
        </label>
        <input className="custom-form__trap" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={form.website} onChange={set("website")} />
        {status === "error" && (
          <p className="custom-form__error" role="alert">
            {error}
          </p>
        )}
        <button className="button-primary" type="submit">
          {status === "sending" ? "Đang gửi…" : "Gửi yêu cầu"}
        </button>
        <p className="custom-form__note">Gửi yêu cầu không mất phí. Mộc chỉ dùng thông tin này để liên hệ báo giá.</p>
      </fieldset>
    </form>
  );
}
