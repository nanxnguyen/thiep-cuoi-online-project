import Link from "next/link";
import { FOOTER_COLUMNS as columns } from "@/lib/navigation";

// `cta={false}` hides the closing call-to-action band (design: Site Footer show-cta, off on the account page).
export function SiteFooter({ cta = true }: { cta?: boolean }) {
  return (
    <footer className="footer">
      {cta && <div className="footer__cta"><h2>Bắt đầu tấm thiệp<br /><em>của hai bạn.</em></h2><Link href="/studio">Tạo thiệp miễn phí</Link></div>}
      <div className="footer__inner">
        <div>
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              M
            </span>
            MỘC
          </Link>
          <p>Thiệp cưới online miễn phí.</p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="footer__title">{c.title}</p>
            <ul>
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="footer__legal">
        <span>© 2026 MỘC</span><span>Làm bằng ♥ tại Việt Nam</span>
      </div>
    </footer>
  );
}
