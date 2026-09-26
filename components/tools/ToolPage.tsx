import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import "./tools.css";

// Shared shell for the 7 browser tools, after design/CC *.dc.html: breadcrumb back to the hub, h1, one-line
// description, then the tool itself. `width` is each design page's own max-width.
export function ToolPage({
  name,
  title,
  description,
  width = 900,
  gap = 28,
  ledeWidth = 520,
  children,
}: {
  /** Breadcrumb label, e.g. "Tạo mã QR". */
  name: string;
  /** Omit when the tool renders its own title row (guest list: h1 beside the CSV buttons). */
  title?: ReactNode;
  description?: ReactNode;
  width?: number;
  /** Each design page's own main gap (QR 32, most 28, guest list 24). */
  gap?: number;
  ledeWidth?: number;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="tool-page" style={{ maxWidth: width, gap }}>
        <nav className="tool-crumb" aria-label="Đường dẫn">
          <Link href="/cong-cu-dam-cuoi">Công cụ</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{name}</span>
        </nav>
        {title && <h1>{title}</h1>}
        {description && (
          <p className="tool-lede" style={{ maxWidth: ledeWidth }}>
            {description}
          </p>
        )}
        {/* keeps heading levels contiguous: tools use h3/h4 inside */}
        <h2 className="tool-sr">{name}</h2>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
