import Link from "next/link";

const templates = [
  ["Gallery Noir", "Editorial · Đậm chất", "noir"],
  ["Soft Type", "Minimal · Thanh lịch", "soft"],
  ["Wild Garden", "Botanical · Ấm áp", "garden"],
];

export default function HomePage() {
  return <>
    <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">M</span>MỘC</Link><nav className="site-nav"><Link href="/templates">Mẫu thiệp</Link><Link href="#how-it-works">Cách hoạt động</Link><Link className="nav-cta" href="/studio">Tạo thiệp →</Link></nav></header>
    <main>
      <section className="hero"><div className="hero-copy"><p className="eyebrow">MỘC WEDDING STUDIO</p><h1>Một lời mời<br /><em>thật riêng.</em></h1><p className="lede">Tạo một chiếc thiệp cưới hiện đại, có câu chuyện, có âm nhạc và mang đúng dấu ấn của hai bạn.</p><div className="actions"><Link className="button-primary" href="/studio">Bắt đầu tạo thiệp ↗</Link><Link href="/templates">Khám phá mẫu ↓</Link></div></div><div className="hero-art"><div className="hero-card hero-card-back"><span>THE WEDDING OF</span><strong>MINH <i>&</i> AN</strong><small>08 / 11 / 2026</small></div><div className="hero-card hero-card-front"><span>SAVE THE DATE</span><strong>Minh <i>&</i> An</strong><small>08 · 11 · 2026</small><b>SCROLL TO DISCOVER ↓</b></div></div></section>
      <section className="section"><div className="section-head"><div><p className="eyebrow">BỘ SƯU TẬP</p><h2>Chọn cảm giác<br /><em>đúng là mình.</em></h2></div><p>Mỗi mẫu được thiết kế để câu chuyện của hai bạn xuất hiện thật tự nhiên.</p></div><div className="template-grid">{templates.map(([name, subtitle, tone]) => <Link className={`template-card ${tone}`} href="/studio" key={name}><span className="eyebrow">MỘC COLLECTION</span><strong>{name}</strong><small>{subtitle}</small></Link>)}</div></section>
      <section className="process" id="how-it-works"><div><p className="eyebrow">MỘC MAKES IT SIMPLE</p><h2>Từ ý tưởng<br />đến lời mời.</h2></div><div className="process-list"><div><span>01</span><strong>Chọn một phong cách</strong><p>Bắt đầu bằng một thiết kế khiến bạn thấy “đúng là mình”.</p></div><div><span>02</span><strong>Thêm câu chuyện của bạn</strong><p>Tên, ngày, ảnh, lời nhắn và bài nhạc yêu thích.</p></div><div><span>03</span><strong>Gửi đi điều đáng nhớ</strong><p>Xuất bản một chiếc thiệp đẹp trên mọi màn hình.</p></div></div></section>
    </main><footer className="footer"><span>© 2026 MỘC STUDIO</span><span>Made for meaningful beginnings.</span></footer>
  </>;
}
