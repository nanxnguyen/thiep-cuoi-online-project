import Link from "next/link";
import { MobileMenu } from "./MobileMenu";

export const NAV_LINKS = [
  { href: "/templates", label: "Mẫu thiệp" },
  { href: "/tinh-nang", label: "Tính năng" },
  { href: "/cong-cu-dam-cuoi", label: "Công cụ" },
  { href: "/tro-giup", label: "Trợ giúp" },
  { href: "/blog", label: "Blog" },
] as const;

// Shared top bar for the marketing pages: sticky, translucent, one primary action. Wide screens show the links inline;
// phones get a menu button next to the action.
export function SiteHeader() {
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
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <Link className="nav-cta" href="/studio">
            Tạo thiệp
          </Link>
          <MobileMenu links={NAV_LINKS} />
        </nav>
      </div>
    </header>
  );
}
