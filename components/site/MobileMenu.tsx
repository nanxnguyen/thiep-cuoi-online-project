"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

// The phone menu: a native <details> (works without JS, keyboard-accessible). Keyed by the path so it closes itself
// after a link is followed. Hidden on wide screens, where the inline nav is shown instead.
export function MobileMenu({ links }: { links: readonly { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <details className="nav-menu" key={path}>
      <summary aria-label="Menu">
        <Menu size={22} aria-hidden="true" />
      </summary>
      <nav aria-label="Menu trên điện thoại">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
