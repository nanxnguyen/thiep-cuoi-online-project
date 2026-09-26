"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileMenu } from "./MobileMenu";
import { isNavActive, NAV_LINKS } from "@/lib/navigation";

export { NAV_LINKS } from "@/lib/navigation";

// Shared top bar (design/Site Header.dc.html): logo, three section links, then Ủng hộ / Tài khoản / Tạo thiệp.
// Phones get a menu button next to the action instead of the design's wrapped rows.
export function SiteHeader() {
  const pathname = usePathname();
  const current = (href: string) => (isNavActive(pathname, href) ? "page" : undefined);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <span className="brand-word">MỘC</span>
        </Link>
        <nav className="site-nav" aria-label="Chính">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="site-actions">
          <Link href="/ung-ho">
            Ủng hộ
          </Link>
          <Link href="/account" aria-current={current("/account")}>
            Tài khoản
          </Link>
          <Link className="nav-cta" href="/studio">
            Tạo thiệp
          </Link>
          <MobileMenu
            links={[...NAV_LINKS, { href: "/ung-ho", label: "Ủng hộ" }, { href: "/bang-gia", label: "Bảng giá" }, { href: "/account", label: "Tài khoản" }]}
          />
        </div>
      </div>
    </header>
  );
}
