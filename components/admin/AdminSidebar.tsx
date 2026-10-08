"use client";

export type AdminNavKey = "overview" | "users" | "cards" | "templates";

type NavItem = { key: AdminNavKey; label: string; href: string };

export const ADMIN_NAV: readonly NavItem[] = [
  { key: "overview", label: "Tổng quan", href: "/admin" },
  { key: "users", label: "Người dùng", href: "/admin/users" },
  { key: "cards", label: "Thiệp cưới", href: "/admin/cards" },
  { key: "templates", label: "Mẫu thiệp", href: "/admin/templates" },
];

function NavIcon({ itemKey }: { itemKey: AdminNavKey }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true } as const;
  if (itemKey === "overview") {
    return (
      <svg {...common}><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" /></svg>
    );
  }
  if (itemKey === "users") {
    return (
      <svg {...common}><circle cx="8" cy="5.4" r="2.6" stroke="currentColor" strokeWidth="1.3" /><path d="M2.8 13.4c.9-2.4 2.8-3.6 5.2-3.6s4.3 1.2 5.2 3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
    );
  }
  if (itemKey === "cards") {
    return (
      <svg {...common}><rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M2 4.5L8 9l6-4.5" stroke="currentColor" strokeWidth="1.3" /></svg>
    );
  }
  return (
    <svg {...common}><rect x="2" y="2" width="12" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.3" /><rect x="2" y="10.5" width="12" height="3.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" /></svg>
  );
}

export function adminInitials(name: string): string {
  const match = name.trim().match(/\p{L}/u);
  return (match ? match[0] : "A").toUpperCase();
}

export type AdminSidebarProps = {
  active: AdminNavKey;
  adminName: string;
  onLogout: () => void;
};

// Colours come from site tokens (see admin.css); geometry follows
// design/Admin Sidebar.dc.html: dark ground, light text, active item on a
// light ground with ink text and a 2px accent bar.
export function AdminSidebar({ active, adminName, onLogout }: AdminSidebarProps) {
  const name = adminName.trim() || "Quản trị viên";
  return (
    <aside className="adm-sidebar" aria-label="Điều hướng quản trị">
      <a className="adm-brand" href="/admin">
        <span className="adm-brand-mark" aria-hidden="true">M</span>
        <span className="adm-brand-text">
          <span className="adm-brand-name">MỘC</span>
          <span className="adm-brand-sub">QUẢN TRỊ</span>
        </span>
      </a>
      <nav className="adm-nav">
        {ADMIN_NAV.map((item) => (
          <a
            key={item.key}
            href={item.href}
            aria-current={item.key === active ? "page" : undefined}
            className={item.key === active ? "adm-nav-item adm-nav-item-active" : "adm-nav-item"}
          >
            <span className="adm-nav-icon" aria-hidden="true"><NavIcon itemKey={item.key} /></span>
            <span className="adm-nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="adm-side-foot">
        <div className="adm-admin-row">
          <span className="adm-avatar" aria-hidden="true">{adminInitials(name)}</span>
          <span className="adm-admin-meta">
            <span className="adm-admin-name">{name}</span>
            <span className="adm-admin-role">Quản trị viên</span>
          </span>
        </div>
        <a className="adm-side-link" href="/">Về trang chủ</a>
        <button className="adm-side-link adm-logout" type="button" onClick={onLogout}>
          Đăng xuất quản trị
        </button>
      </div>
    </aside>
  );
}
