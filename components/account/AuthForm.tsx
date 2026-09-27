"use client";

import Link from "next/link";
import type { AccountUser } from "@/lib/api";
import "./account.css";

// Broadcast so any mounted SiteHeader picks up a logout without a page reload. Login has no such moment: Google is
// a full-page redirect, so the header just re-checks the session itself once the browser returns.
export function broadcastAuth(user: AccountUser | null) {
  window.dispatchEvent(new CustomEvent<AccountUser | null>("moc-auth", { detail: user }));
}

type Props = {
  /** Where Google should send the browser back to after auth; defaults to /account (its own page needs no override). */
  googleNext?: string;
  /** Modal popup (design/Site Header.dc.html) uses shorter copy than the full /account page (design/Tai Khoan.dc.html). */
  variant?: "page" | "modal";
};

// Google-only sign-in (design/Tai Khoan.dc.html + design/Site Header.dc.html, owner decision 2026-09-27: no
// email/password). Shared by the /account page and the header's login popup so both stay pixel-identical.
export function AuthForm({ googleNext, variant = "page" }: Props) {
  return (
    <div className={variant === "modal" ? "acc-authform acc-authform--modal" : "acc-authform"}>
      <div className="acc-access__title">
        {variant === "modal" ? (
          <h2>
            Đăng nhập vào <em>Mộc</em>
          </h2>
        ) : (
          <h2>Đăng nhập</h2>
        )}
        <span>{variant === "modal" ? "Lưu thiệp vào tài khoản để mở trên mọi thiết bị và theo dõi khách xác nhận." : "Dùng tài khoản Google để xem và quản lý thiệp của bạn."}</span>
      </div>
      <a className="acc-google" href={googleNext ? `/api/auth/google?next=${encodeURIComponent(googleNext)}` : "/api/auth/google"}>
        <span className="acc-google__icon" aria-hidden="true">G</span>
        <span>Tiếp tục với Google</span>
      </a>
      <span className="acc-consent">
        Khi tiếp tục, bạn đồng ý với <Link href="/dieu-khoan">Điều khoản</Link> và <Link href="/quyen-rieng-tu">Quyền riêng tư</Link> của Mộc.
      </span>
      <span className="acc-alt">
        Chưa muốn đăng ký? <Link href="/studio">Tạo thiệp không cần tài khoản</Link>
      </span>
    </div>
  );
}
