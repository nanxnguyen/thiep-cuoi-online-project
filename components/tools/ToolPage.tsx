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
  children,
}: {
  /** Breadcrumb label, e.g. "Tạo mã QR". */
  name: string;
  title: ReactNode;
  description?: ReactNode;
  width?: number;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="tool-page" style={{ maxWidth: width }}>
        <nav className="tool-crumb" aria-label="Đường dẫn">
          <Link href="/cong-cu-dam-cuoi">Công cụ</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{name}</span>
        </nav>
        <h1>{title}</h1>
        {description && <p className="tool-lede">{description}</p>}
        {/* keeps heading levels contiguous: tools use h3/h4 inside */}
        <h2 className="tool-sr">{name}</h2>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
