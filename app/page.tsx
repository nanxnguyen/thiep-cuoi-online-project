import Link from "next/link";
import type { CSSProperties } from "react";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { CountdownText, CountdownTiles, CountUp, Rotating, ScrollProgress, Tilt } from "@/components/home/HomeLive";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_URL } from "@/lib/site";
import { ScaledFrame } from "@/components/templates/ScaledFrame";
import { sampleContent } from "@/lib/content";
import { allFontClasses } from "@/lib/fonts";
import { getTemplate, templates } from "@/lib/templates";
import "@/components/home/home.css";
import "@/components/templates/gallery.css";

// design/Trang Chu.dc.html, section by section. Deviations: the quote strip states product facts instead of unattributed
// customer testimonials (the product has no reviews to quote yet); counts use the real registry sizes.
const FACTS = [
  "Gửi thiệp trong 10 phút, khách xác nhận ngay trên điện thoại",
  "Không trả phí theo lượt xem hay số khách",
  "Đổi mẫu bao nhiêu lần cũng không mất chữ nào đã gõ",
  "Ông bà, bố mẹ mở link là đọc được, không cần cài gì",
];
const STEPS = [
  ["01", "Chọn mẫu", `${templates.length} mẫu thiết kế riêng với sáu phong cách. Đổi mẫu lúc nào cũng được, nội dung vẫn còn nguyên.`],
  ["02", "Điền nội dung", "Tên, ngày, địa điểm, ảnh và nhạc. Mộc tự lưu khi bạn gõ và cho xem trước ngay bên cạnh."],
  ["03", "Gửi link", "Mỗi khách một đường link mang tên họ. Gửi qua Zalo, Messenger hay tin nhắn, khách mở là xem."],
] as const;
const TOOLS = [
  ["Tạo mã QR", "Dán link thiệp, nhận mã QR để in lên thiệp giấy.", "/cong-cu/tao-qr"],
  ["Nén ảnh", "Giảm dung lượng ảnh cưới ngay trên máy, không tải lên đâu cả.", "/cong-cu/nen-anh"],
  ["Nén video", "Thu nhỏ video phóng sự cưới để đăng lên thiệp.", "/cong-cu/nen-video"],
  ["Tin nhắn mời", "Gợi ý lời mời theo hai giọng: trang trọng hoặc thân mật.", "/cong-cu/tin-nhan-moi"],
  ["Danh sách khách", "Thêm, sửa, nhập và xuất danh sách khách bằng CSV.", "/cong-cu/danh-sach-khach"],
  ["Sơ đồ chỗ ngồi", "Kéo thả khách vào từng bàn tiệc.", "/cong-cu/so-do-cho-ngoi"],
  ["Save the date", "Thiết kế ảnh báo ngày cưới và tải về PNG.", "/cong-cu/save-the-date"],
] as const;
const GUESTS = ["Cô Lan & gia đình", "Anh Tuấn", "Bạn Thư thân mến", "Chú Hải & cô Hoa", "Dear Emily"];
const WISHES = [
  ["Chúc hai bạn trăm năm hạnh phúc!", "Minh Thư"],
  ["Mãi yêu nhau như ngày đầu nhé.", "Anh Tuấn"],
  ["Tiếc không về được, gửi hai đứa thật nhiều thương.", "Cô Lan"],
] as const;

// Deterministic pseudo-random so server and client render the same petals / QR modules.
const rnd = (i: number, n: number) => {
  const x = Math.sin(i * 97.13 + n * 13.7) * 10000;
  return x - Math.floor(x);
};
const PETALS = Array.from({ length: 22 }, (_, i) => ({
  left: `${rnd(i, 3) * 100}%`,
  sway: `${4 + rnd(i, 4) * 3}s`,
  size: 9 + rnd(i, 1) * 12,
  dur: 11 + rnd(i, 2) * 10,
  tone: i % 5,
  opacity: 0.55 + rnd(i, 5) * 0.35,
  dx: `${(rnd(i, 6) - 0.5) * 200}px`,
  rot: `${360 + rnd(i, 7) * 360}deg`,
}));
const QR = Array.from({ length: 169 }, (_, i) => {
  const x = i % 13;
  const y = Math.floor(i / 13);
  const finder = (cx: number, cy: number) => x >= cx && x < cx + 4 && y >= cy && y < cy + 4 && (x === cx || x === cx + 3 || y === cy || y === cy + 3);
  if (finder(0, 0) || finder(9, 0) || finder(0, 9)) return true;
  const v = Math.sin(i * 12.9898) * 43758.5453;
  return v - Math.floor(v) > 0.52;
});
const BARS = Array.from({ length: 9 }, (_, i) => ({ d: `${0.7 + ((i * 37) % 7) / 10}s`, dl: `${-(i * 0.13)}s` }));

export default function HomePage() {
  const sample = sampleContent();
  const content = { ...sample, couple: { ...sample.couple, heroPhoto: "" } };
  const front = getTemplate("song-hy")!;
  const marquee = templates.slice(0, 10);

  return (
    <div className={allFontClasses}>
      <SiteHeader />
      <ScrollProgress />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "MỘC Wedding", url: SITE_URL },
          { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "MỘC Wedding", inLanguage: "vi-VN", publisher: { "@id": `${SITE_URL}/#organization` } },
        ],
      }} />
      <main>
        <section className="home-hero">
          <div className="hm-petals" aria-hidden="true">
            {PETALS.map((p, i) => (
              <div key={i} style={{ left: p.left, animationDuration: p.sway }}>
                <i className={`hm-petal hm-petal--${p.tone}`} style={{ width: p.size, height: p.size * 0.8, opacity: p.opacity, animationDuration: `${p.dur}s`, animationDelay: `${-rnd(i, 8) * p.dur}s`, "--dx": p.dx, "--rot": p.rot } as CSSProperties} />
              </div>
            ))}
          </div>
          <div className="home-hero__inner">
            <div>
              <p className="eyebrow rise" style={{ "--i": 0 } as CSSProperties}>Thiệp cưới online · miễn phí</p>
              <h1 className="rise" style={{ "--i": 1 } as CSSProperties}>
                Một tấm thiệp,
                <br />
                <em className="foil">trao tận tay</em>
                <br />
                người thương.
              </h1>
              <p className="lede rise" style={{ "--i": 2 } as CSSProperties}>Chọn mẫu, điền thông tin, gửi cho mỗi vị khách một đường link mang tên họ. Xác nhận tham dự, sổ lưu bút và mừng cưới QR nằm gọn trong một tấm thiệp.</p>
              <div className="actions rise" style={{ "--i": 3 } as CSSProperties}>
                <Link className="button-primary" href="/studio">
                  Tạo thiệp miễn phí
                </Link>
                <Link className="button-ghost" href="/templates">
                  Xem {templates.length} mẫu thiệp
                </Link>
              </div>
              <p className="home-proof rise" style={{ "--i": 4 } as CSSProperties}>
                <span>Không cần đăng nhập để bắt đầu</span>
                <span>Tự lưu khi bạn gõ</span>
              </p>
            </div>

            <Tilt className="hero-envelope">
              <div className="hero-envelope__back" />
              <ScaledFrame className="hero-envelope__card"><InvitationRenderer only="cover" mode="preview" gate={false} template={front} content={content} /></ScaledFrame>
              <div className="hero-envelope__front" /><div className="hero-envelope__seal">M</div><div className="hero-envelope__flap" />
              <div className="hero-envelope__rsvp"><b>✓</b><span>Cô Lan &amp; gia đình<small>Xác nhận tham dự · 3 người</small></span></div>
              <div className="hero-envelope__days"><small>CÒN LẠI</small><strong><CountdownText /></strong></div>
              <div className="hero-envelope__wish">
                <Rotating items={WISHES.map(([w, who]) => (<><em>“{w}”</em><small>{who} · vừa gửi lời chúc</small></>))} />
              </div>
            </Tilt>
          </div>
        </section>

        <section className="hm-marquee" aria-label="Mẫu thiệp">
          <div className="marquee">
            {[...marquee, ...marquee].map((t, i) => (
              <Link href={`/templates/${t.id}`} key={`${t.id}-${i}`} tabIndex={i >= marquee.length ? -1 : undefined} aria-hidden={i >= marquee.length || undefined}>
                <ScaledFrame className="hm-marquee__thumb"><InvitationRenderer only="cover" mode="preview" gate={false} template={t} content={content} /></ScaledFrame>
                <span>{t.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="hm-facts" aria-label="Vì sao chọn Mộc">
          <div className="marquee marquee--reverse">
            {[...FACTS, ...FACTS].map((q, i) => (
              <div key={i} aria-hidden={i >= FACTS.length || undefined}>
                <span>✦</span>
                <span className="script">{q}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="hm-stats" aria-label="Mộc trong con số">
          {([[templates.length, "", "Mẫu thiệp"], [8, "", "Tính năng"], [7, "", "Công cụ miễn phí"], [0, "đ", "Chi phí"]] as const).map(([v, suffix, label]) => (
            <div key={label}>
              <strong><CountUp to={v} suffix={suffix} /></strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="hm-steps">
          <div className="hm-head">
            <p className="eyebrow">Ba bước</p>
            <h2>Từ ý tưởng đến tay khách <em>trong một buổi tối</em></h2>
          </div>
          <ol>
            {STEPS.map(([n, title, text]) => (
              <li key={n}>
                <span>{n}</span>
                <strong>{title}</strong>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="hm-features">
          <div className="hm-features__inner">
            <div className="hm-features__top">
              <div className="hm-head">
                <p className="eyebrow">Tính năng</p>
                <h2>Mọi thứ khách cần, <em>trong một tấm thiệp</em></h2>
              </div>
              <Link className="hm-more" href="/tinh-nang">Xem tất cả tính năng →</Link>
            </div>
            <div className="hm-features__grid">
              <Link className="hm-feat" href="/tinh-nang/xac-nhan-tham-du">
                <div className="hm-feat__art hm-rsvp">
                  <div><span>Tham dự</span><b>96 / 128</b></div>
                  <i><i style={{ "--w": "75%" } as CSSProperties} /></i>
                  <div><span>Chưa chắc</span><b>18</b></div>
                  <i><i className="hm-rsvp__maybe" style={{ "--w": "14%" } as CSSProperties} /></i>
                </div>
                <strong>Xác nhận tham dự</strong>
                <span>Khách bấm xác nhận ngay trên thiệp, bạn thấy số người đến theo thời gian thực.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang/so-luu-but">
                <div className="hm-feat__art hm-wish">
                  <Rotating items={WISHES.map(([w, who]) => (<><em className="script">“{w}”</em><small>— {who}</small></>))} />
                </div>
                <strong>Sổ lưu bút</strong>
                <span>Lời chúc của khách được lưu lại thành một cuốn sổ nhỏ để đọc về sau.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang/mung-cuoi-qr">
                <div className="hm-feat__art hm-qr">
                  <div>
                    <div className="hm-qr__grid">{QR.map((on, i) => <span key={i} data-on={on || undefined} />)}</div>
                    <i className="hm-qr__scan" />
                  </div>
                </div>
                <strong>Mừng cưới QR</strong>
                <span>Mã QR chuyển khoản nằm sẵn trong thiệp, khách ở xa gửi mừng dễ dàng.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang/ban-do-chi-duong">
                <div className="hm-feat__art hm-map">
                  <i className="hm-map__road1" /><i className="hm-map__road2" /><i className="hm-map__ripple" />
                  <div className="hm-map__pin"><span /></div>
                </div>
                <strong>Bản đồ chỉ đường</strong>
                <span>Một chạm mở chỉ đường tới nhà hàng hay tư gia, không ai phải hỏi lại.</span>
              </Link>
              <Link className="hm-feat hm-feat--dark" href="/tinh-nang/dem-nguoc-lich">
                <div className="hm-feat__art hm-cd"><CountdownTiles /></div>
                <strong>Đếm ngược &amp; lịch</strong>
                <span>Đồng hồ đếm ngược tới giờ cưới và nút thêm sự kiện vào lịch điện thoại.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang/album-anh">
                <div className="hm-feat__art hm-album"><i className="hm-album__a" /><i className="hm-album__b" /><i className="hm-album__c" /></div>
                <strong>Album ảnh</strong>
                <span>Kể câu chuyện của hai bạn bằng những tấm ảnh cưới đẹp nhất.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang/nhac-nen">
                <div className="hm-feat__art hm-music">
                  <div className="hm-music__disc"><span /></div>
                  <div className="hm-music__bars">{BARS.map((b, i) => <span key={i} style={{ animationDuration: b.d, animationDelay: b.dl }} />)}</div>
                </div>
                <strong>Nhạc nền</strong>
                <span>Bài hát của hai bạn vang lên khi khách mở thiệp.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang/phong-bi-loi-moi">
                <div className="hm-feat__art hm-env">
                  <div><i className="hm-env__back" /><div className="hm-env__card hand">Vy &amp; Khôi</div><i className="hm-env__front" /><i className="hm-env__flap" /></div>
                </div>
                <strong>Phong bì lời mời</strong>
                <span>Thiệp mở ra từ phong bì, giống như nhận một tấm thiệp giấy.</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="home-section home-guest on-dark">
          <div className="home-guest__copy">
            <p className="eyebrow">Link riêng cho từng khách</p>
            <h2>
              Mỗi vị khách,
              <br />
              <em>một lời mời mang tên họ.</em>
            </h2>
            <p className="lede">Thêm khách vào danh sách, MỘC tạo cho mỗi người một đường link riêng. Khi mở thiệp, khách thấy tên mình ngay dòng đầu. Thiệp hiển thị được cả tiếng Việt và tiếng Anh cho khách nước ngoài.</p>
            <div className="home-guest__tags">
              <span>Nhập khách từ CSV</span>
              <span>Song ngữ Việt · Anh</span>
              <span>Theo dõi phản hồi</span>
            </div>
          </div>
          <div className="home-guest__preview" aria-label="Xem trước lời mời riêng">
            <div className="home-guest__browser"><span className="home-guest__dots" aria-hidden="true"><i /><i /><i /></span>moc.vn/invite/vy-khoi?g=<b>mã-riêng</b></div>
            <div className="home-guest__card">
              <span>TRÂN TRỌNG KÍNH MỜI</span>
              <strong className="hand"><Rotating className="hm-type" items={GUESTS} /></strong>
              <i />
              <p>tới dự bữa tiệc chung vui cùng gia đình chúng tôi, trong ngày thành hôn của</p>
              <h3>Hạ Vy <em>&amp;</em> Minh Khôi</h3>
              <small>17:00 · 09.11.2026 · HÀ NỘI</small>
            </div>
          </div>
        </section>

        <section className="home-section home-tools">
          <div className="home-tools__intro">
            <p className="eyebrow">Công cụ miễn phí</p>
            <h2>
              Bảy việc nhỏ
              <br />
              <em>trước ngày cưới.</em>
            </h2>
            <p className="lede">Chạy ngay trên trình duyệt, không cần đăng nhập. Ảnh, video và danh sách khách ở lại trên máy của bạn.</p>
            <Link className="more-link" href="/cong-cu-dam-cuoi">Xem tất cả công cụ →</Link>
          </div>
          <div className="home-tools__list">
            {TOOLS.map(([title, text, href], index) => (
              <Link href={href} key={href}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{title}</strong>
                <small>{text}</small>
                <b aria-hidden="true">→</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-price on-dark">
          <div>
            <p className="eyebrow">Bảng giá</p>
            <h2>
              <span>Miễn phí.</span>
              <br />
              <em>Toàn bộ.</em>
            </h2>
          </div>
          <div>
            <p className="lede">Tất cả mẫu thiệp, tính năng và công cụ đều dùng miễn phí. MỘC được duy trì nhờ sự ủng hộ tự nguyện của những cặp đôi thấy nó có ích.</p>
            <div className="actions">
              <Link className="button-primary" href="/studio">Tạo thiệp ngay</Link>
              <Link className="button-ghost" href="/ung-ho"><span className="anim-heart" aria-hidden="true">♥</span> Ủng hộ MỘC</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
