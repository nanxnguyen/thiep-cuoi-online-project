"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileMenu } from "./MobileMenu";
import { isNavActive, NAV_LINKS } from "@/lib/navigation";

export { NAV_LINKS } from "@/lib/navigation";

// Shared top bar for the marketing pages: sticky, translucent, one primary action. Wide screens show the links inline;
// phones get a menu button next to the action.
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          MỘC
        </Link>
        <nav className="site-nav" aria-label="Chính">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isNavActive(pathname, l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
          <Link href="/account">Tài khoản</Link>
          <Link className="nav-cta" href="/studio">
            Tạo thiệp
          </Link>
          <MobileMenu links={[...NAV_LINKS, { href: "/bang-gia", label: "Bảng giá" }, { href: "/account", label: "Tài khoản" }]} />
        </nav>
      </div>
    </header>
  );
}
