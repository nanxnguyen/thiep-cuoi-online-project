"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";

// Login card geometry follows design/Admin.dc.html (centered 400px card).
// Colours reference site tokens (var(--…)) — never raw hex (see
// tests/design-system.test.ts). The design file's demo-password hint stays in
// the design file only and is intentionally NOT carried over here.
const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
  color: "var(--muted)",
} as const;

const inputStyle = {
  fontFamily: "inherit",
  fontSize: 14,
  padding: "12px 14px",
  minHeight: 44,
  borderRadius: 12,
  border: "1px solid var(--line-strong)",
  background: "var(--field-bg)",
  color: "var(--ink)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
} as const;

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await api.admin.login(email.trim(), password);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Chưa đăng nhập được, bạn thử lại nhé.");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Đăng nhập quản trị"
      style={{
        width: "100%",
        maxWidth: 400,
        background: "var(--surface)",
        borderRadius: 20,
        padding: "40px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        boxShadow: "0 20px 50px -24px rgba(26,20,18,.35)",
        boxSizing: "border-box",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: "var(--night)",
          color: "var(--on-dark)",
          display: "grid",
          placeItems: "center",
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        M
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 12, letterSpacing: ".18em", color: "var(--gold-deep)", fontWeight: 600 }}>
          KHU VỰC QUẢN TRỊ
        </span>
        <h1 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, fontSize: 26 }}>
          Đăng nhập quản trị
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
          Chỉ dành cho quản trị viên của Mộc. Trang này không có liên kết công khai trên website.
        </p>
      </div>
      <label style={labelStyle}>
        Email quản trị
        <input
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          value={email}
          onChange={(event) => { setEmail(event.target.value); setError(""); }}
          placeholder="admin@moc.vn"
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Mật khẩu
        <input
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
          value={password}
          onChange={(event) => { setPassword(event.target.value); setError(""); }}
          placeholder="••••••••"
          style={inputStyle}
        />
      </label>
      {error ? (
        <p role="alert" style={{ margin: 0, fontSize: 13, color: "var(--accent)" }}>
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        style={{
          fontFamily: "inherit",
          fontSize: 15,
          fontWeight: 500,
          padding: 14,
          minHeight: 48,
          borderRadius: 999,
          border: 0,
          background: "var(--night)",
          color: "var(--on-dark)",
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
      <a
        href="/"
        style={{ fontSize: 13, color: "var(--faint)", textAlign: "center", textDecoration: "none" }}
      >
        ← Về trang chủ
      </a>
    </form>
  );
}
