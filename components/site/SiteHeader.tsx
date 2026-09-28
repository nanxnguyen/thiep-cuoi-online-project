"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MobileMenu } from "./MobileMenu";
import { LoginModal } from "./LoginModal";
import { isNavActive, NAV_LINKS } from "@/lib/navigation";
import { api, type AccountUser } from "@/lib/api";
import { accountToken } from "@/lib/account";

export { NAV_LINKS } from "@/lib/navigation";

// Shared top bar (design/Site Header.dc.html): logo, two section links, then a login popup / avatar menu, then
// "Tạo thiệp". Phones get a menu button next to the action instead of the design's wrapped rows.
export function SiteHeader() {
  const pathname = usePathname();
  const current = (href: string) => (isNavActive(pathname, href) ? "page" : undefined);

  const [profile, setProfile] = useState<AccountUser | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Không có gợi ý phiên thì bỏ qua: tránh request 401 vô ích cho mọi khách chưa đăng nhập
    // (browser log lỗi network dù đã catch). Tab mới chưa có hint thì header hiện logged-out
    // cho tới khi vào /account hoặc đăng nhập lại.
    if (!accountToken.get()) setProfile(null);
    else api.me(accountToken.get()).then((user) => { accountToken.set("session"); setProfile(user); }).catch(() => { accountToken.clear(); setProfile(null); });
    const onAuth = (event: Event) => setProfile((event as CustomEvent<AccountUser | null>).detail);
    window.addEventListener("moc-auth", onAuth);
    return () => window.removeEventListener("moc-auth", onAuth);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const logout = useCallback(() => {
    setMenuOpen(false);
    void api.logout().finally(() => { accountToken.clear(); setProfile(null); window.dispatchEvent(new CustomEvent("moc-auth", { detail: null })); });
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" prefetch={false}>
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <span className="brand-word">MỘC</span>
        </Link>
        <nav className="site-nav" aria-label="Chính">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} prefetch={false} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="site-actions">
          <Link className="nav-cta" href="/studio" prefetch={false}>
            Tạo thiệp
          </Link>
          {profile ? (
            <div className="site-user">
              <button type="button" className="site-user__trigger" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
                <Avatar profile={profile} />
                <span className="site-user__name">{profile.email}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="site-user__caret" style={{ transform: menuOpen ? "rotate(180deg)" : undefined }}>
                  <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <button type="button" className="site-user__scrim" aria-label="Đóng menu" onClick={() => setMenuOpen(false)} />
                  <div className="site-user__menu" role="menu">
                    <div className="site-user__head">
                      <Avatar profile={profile} large />
                      <span>{profile.email}</span>
                    </div>
                    <Link href="/account" role="menuitem" onClick={() => setMenuOpen(false)}>
                      Thiệp của tôi
                    </Link>
                    <button type="button" role="menuitem" className="site-user__logout" onClick={logout}>
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button type="button" className="site-login" onClick={() => setLoginOpen(true)}>
              <span className="site-login__dot" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <circle cx="8" cy="5.6" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2.8 13.6c.9-2.5 2.9-3.8 5.2-3.8s4.3 1.3 5.2 3.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </span>
              Đăng nhập
            </button>
          )}
          <MobileMenu
            links={[...NAV_LINKS, { href: "/bang-gia", label: "Bảng giá" }]}
            extra={
              profile ? (
                <>
                  <Link href="/account">Thiệp của tôi</Link>
                  <button type="button" onClick={logout}>
                    Đăng xuất
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setLoginOpen(true)}>
                  Đăng nhập
                </button>
              )
            }
          />
        </div>
      </div>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}

function Avatar({ profile, large }: { profile: AccountUser; large?: boolean }) {
  const initial = profile.email.slice(0, 1).toUpperCase();
  return (
    <span className={large ? "site-avatar site-avatar--large" : "site-avatar"} aria-hidden={!profile.avatarUrl}>
      {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initial}
    </span>
  );
}
