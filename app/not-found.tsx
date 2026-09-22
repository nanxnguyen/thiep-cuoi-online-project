import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

// Any unknown address, and any /invite/{slug} that does not exist or is not published (the guest cannot tell which).
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="section" style={{ textAlign: "center", paddingBlock: "14vh" }}>
        <span className="xi" aria-hidden="true" style={{ display: "block", color: "var(--gold)", fontSize: 56, marginBottom: 12 }}>
          囍
        </span>
        <p className="eyebrow">Không tìm thấy trang</p>
        <h1 style={{ margin: "20px 0", fontSize: "clamp(34px, 6vw, 60px)" }}>
          Trang này <em>không có ở đây.</em>
        </h1>
        <p className="lede" style={{ margin: "0 auto" }}>
          Nếu bạn đang mở một tấm thiệp mời, có thể link chưa đầy đủ hoặc thiệp chưa được xuất bản. Hãy hỏi lại người đã gửi thiệp cho bạn.
        </p>
        <div className="actions" style={{ justifyContent: "center" }}>
          <Link className="button-primary" href="/">
            Về trang chủ
          </Link>
          <Link className="button-ghost" href="/templates">
            Xem các mẫu thiệp
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
