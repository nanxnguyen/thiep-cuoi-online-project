"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

// The phone menu: a native <details> (works without JS, keyboard-accessible). Keyed by the path so it closes itself
// after a link is followed. Hidden on wide screens, where the inline nav is shown instead.
// .site-login/.site-user are hidden on mobile too (see the max-width:760px rule in globals.css), so `extra` is
// where the header's login/account controls move to on phones instead of sitting inline next to the CTA.
// Below 768px the open menu is a sheet over a dimmed backdrop (.nav-menu__scrim, globals.css; hidden above that
// width). A tap on the backdrop closes the menu, and so does Escape.
export function MobileMenu({ links, extra }: { links: readonly { href: string; label: string }[]; extra?: ReactNode }) {
  const path = usePathname();
  const close = (menu: HTMLDetailsElement) => {
    menu.open = false;
    menu.querySelector("summary")?.focus();
  };
  return (
    <details
      className="nav-menu"
      key={path}
      onClick={(e: MouseEvent<HTMLDetailsElement>) => {
        if ((e.target as HTMLElement).classList.contains("nav-menu__scrim")) close(e.currentTarget);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDetailsElement>) => {
        if (e.key === "Escape" && e.currentTarget.open) close(e.currentTarget);
      }}
    >
      <summary aria-label="Menu">
        <Menu size={22} aria-hidden="true" />
      </summary>
      <span className="nav-menu__scrim" aria-hidden="true" />
      <nav aria-label="Menu trên điện thoại">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
            {l.href === "/ung-ho" && (
              <span className="nav-heart nav-heart--after" aria-hidden="true">
                ♥
              </span>
            )}
          </Link>
        ))}
        {extra}
      </nav>
    </details>
  );
}
