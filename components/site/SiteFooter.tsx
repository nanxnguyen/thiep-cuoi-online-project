import Link from "next/link";
import { FOOTER_COLUMNS as columns } from "@/lib/navigation";

// Shared footer (design/Site Footer.dc.html). `cta={false}` hides the closing call-to-action (design prop showCta).
export function SiteFooter({ cta = true }: { cta?: boolean }) {
  return (
    <footer className="footer">
      <div className="footer__wrap">
        {cta && (
          <div className="footer__cta">
            <h2>
              Bắt đầu tấm thiệp
              <br />
              <em>của hai bạn.</em>
            </h2>
            <Link href="/studio">Tạo thiệp miễn phí</Link>
          </div>
        )}
        <div className="footer__grid">
          <div className="footer__col footer__brand">
            <span className="footer__word">MỘC</span>
            <span className="footer__tag">Thiệp cưới online miễn phí.</span>
          </div>
          {columns.map((c) => (
            <nav key={c.title} className="footer__col" aria-label={c.title}>
              <span className="footer__title">{c.title.toUpperCase()}</span>
              {c.links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="footer__legal">
          <span>© 2026 Mộc</span>
          <span>Làm bằng ♥ tại Việt Nam</span>
        </div>
      </div>
    </footer>
  );
}
