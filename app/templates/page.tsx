import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Mẫu thiệp cưới", description: "Khám phá bộ sưu tập mẫu thiệp cưới online hiện đại của MỘC Wedding.", alternates: { canonical: "/templates" } };

const templates = ["Gallery Noir", "Soft Type", "Wild Garden", "Afterglow", "Maison Blanc", "Olive Story"];
export default function TemplatesPage() { return <main className="section"><header className="site-header"><Link className="brand" href="/"><span className="brand-mark">M</span>MỘC</Link><Link className="nav-cta" href="/studio">Tạo thiệp →</Link></header><p className="eyebrow">MỘC COLLECTION</p><h1>Chọn một cảm giác<br /><em>đúng là mình.</em></h1><p className="lede">Mỗi mẫu có một nhịp điệu riêng. Bạn có thể đổi mẫu bất cứ lúc nào mà không mất thông tin.</p><div className="template-grid">{templates.map((name, index) => <Link className={`template-card ${["noir", "soft", "garden"][index % 3]}`} href="/studio" key={name}><span className="eyebrow">0{index + 1} / COLLECTION</span><strong>{name}</strong><small>Chọn mẫu này →</small></Link>)}</div></main>; }
