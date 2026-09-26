import Link from "next/link";
import type { CSSProperties } from "react";
import { CountdownText, CountdownTiles, GuestInvite, ScrollProgress, StatsRow, Tilt, WishRotator } from "@/components/home/HomeLive";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { JsonLd } from "@/components/marketing/JsonLd";
import { ThiepPreview } from "@/components/templates/ThiepPreview";
import { SITE_URL } from "@/lib/site";
import { colors, getTemplate, templates, type ColorKey, type CoverFamily } from "@/lib/templates";
import "@/components/home/home.css";

// design/Trang Chu.dc.html, section by section. The template count is the real registry size (design says 10);
// marquee labels and links are the real templates behind the design's legacy ids.
const QUOTES = [
  "“Gửi thiệp trong 10 phút, khách xác nhận ngay trên điện thoại.”",
  "“Cuối cùng cũng có thiệp cưới không phải trả phí theo lượt xem.”",
  "“Đổi mẫu ba lần mà không mất một chữ nào đã gõ.”",
  "“Bố mẹ hai bên đều mở được, kể cả không rành công nghệ.”",
];
const TPL: [string, string, CoverFamily, ColorKey, string, string, string, string][] = [
  ["gallery-noir", "Gallery Noir", "F", "muc", "Hạ Vy", "Minh Khôi", "HÀ NỘI · 11.2026", "Chủ nhật, 5 giờ chiều"],
  ["afterglow", "Afterglow", "E", "hong", "Hoàng Long", "Bảo Ngọc", "28 · 09 · 2027", "ĐÀ NẴNG"],
  ["soft-type", "Soft Type", "B", "tim", "An", "Bảo", "09 · 11 · 2026", "HÀ NỘI"],
  ["maison-blanc", "Maison Blanc", "D", "vang", "Phương Thảo", "Trung Kiên", "06 · 12 · 2026", "HÀ NỘI"],
  ["wild-garden", "Wild Garden", "C", "xanh", "Thu Hà", "Văn Long", "14 · 12 · 2026", "ĐÀ LẠT"],
  ["olive-story", "Olive Story", "G", "oliu", "Thu Hà", "Minh Quân", "19 · 10 · 2026", ""],
  ["lua-son", "Lụa Son", "A", "do", "Ngọc Hân", "Đức Huy", "20 · 11 · 2026", "NAM ĐỊNH"],
  ["thanh-ngoc", "Thanh Ngọc", "J", "xanh", "Thanh Hà", "Tuấn Kiệt", "05 · 01 · 2027", "HÀ NỘI"],
  ["thuy-mac", "Thủy Mặc", "I", "lam", "Ngọc Ánh", "Thế Bảo", "08 · 12 · 2026", "BẮC NINH"],
  ["so-xuan", "Sơ Xuân", "H", "dodam", "Thanh Tú", "Hoàng Nam", "22 · 11 · 2026", ""],
];
const MARQUEE = TPL.map(([legacy, name, family, pal, a, b, date, place]) => {
  const t = getTemplate(legacy);
  return { id: t?.id ?? legacy, name: t?.name ?? name, family, ...colors[pal], a, b, date, place };
});
const STEPS = [
  ["01", "Chọn mẫu", `${templates.length} mẫu thiết kế riêng với sáu phong cách. Đổi mẫu lúc nào cũng được, nội dung vẫn còn nguyên.`, 0],
  ["02", "Điền nội dung", "Tên, ngày, địa điểm, ảnh và nhạc. Mộc tự lưu khi bạn gõ và cho xem trước ngay bên cạnh.", 120],
  ["03", "Gửi link", "Mỗi khách một đường link mang tên họ. Gửi qua Zalo, Messenger hay tin nhắn, khách mở là xem.", 240],
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
const PETAL_COLORS = ["var(--petal-1)", "var(--petal-2)", "var(--petal-3)", "var(--petal-4)", "var(--petal-5)"];

// Deterministic pseudo-random (the design's own formulas) so server and client render the same petals / QR modules.
const rnd = (i: number, n: number) => {
  const x = Math.sin(i * 97.13 + n * 13.7) * 10000;
  return x - Math.floor(x);
};
const PETALS = Array.from({ length: 22 }, (_, i) => {
  const size = 9 + rnd(i, 1) * 12;
  const dur = 11 + rnd(i, 2) * 10;
  return {
    outer: { left: `${rnd(i, 3) * 100}%`, animation: `sway ${4 + rnd(i, 4) * 3}s ease-in-out infinite` },
    inner: {
      width: size,
      height: size * 0.8,
      background: PETAL_COLORS[i % 5],
      opacity: 0.55 + rnd(i, 5) * 0.35,
      "--dx": `${(rnd(i, 6) - 0.5) * 200}px`,
      "--rot": `${360 + rnd(i, 7) * 360}deg`,
      animation: `fall ${dur}s linear ${-rnd(i, 8) * dur}s infinite`,
    } as CSSProperties,
  };
});
const QR = Array.from({ length: 169 }, (_, i) => {
  const x = i % 13;
  const y = Math.floor(i / 13);
  const finder = (cx: number, cy: number) =>
    x >= cx && x < cx + 4 && y >= cy && y < cy + 4 &&
    !(x > cx && x < cx + 3 && y > cy && y < cy + 3 && !(x === cx + 1 && y === cy + 1) && !(x === cx + 2 && y === cy + 2) && !(x === cx + 1 && y === cy + 2) && !(x === cx + 2 && y === cy + 1));
  if (finder(0, 0) || finder(9, 0) || finder(0, 9)) return true;
  const v = Math.sin(i * 12.9898) * 43758.5453;
  return v - Math.floor(v) > 0.52;
});
const BARS = Array.from({ length: 9 }, (_, i) => ({ d: `${0.7 + ((i * 37) % 7) / 10}s`, dl: `${-(i * 0.13)}s` }));

export default function HomePage() {
  const red = colors.do;
  return (
    <div className="hm">
      <ScrollProgress />
      <SiteHeader />
      <ScrollReveal easeOpacity offset={36} transitionProp="transform" delay={60} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "MỘC Wedding", url: SITE_URL },
            { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "MỘC Wedding", inLanguage: "vi-VN", publisher: { "@id": `${SITE_URL}/#organization` } },
          ],
        }}
      />
      <main>
        <section className="hm-hero">
          <div className="hm-hero__petals" aria-hidden="true">
            {PETALS.map((p, i) => (
              <div key={i} style={p.outer}>
                <div style={p.inner} />
              </div>
            ))}
          </div>
          <div className="hm-hero__glow" aria-hidden="true" />
          <div className="hm-hero__inner">
            <div className="hm-hero__copy">
              <div className="hm-kicker hm-hero__kicker">
                <span aria-hidden="true" />
                THIỆP CƯỚI ONLINE · MIỄN PHÍ
              </div>
              <h1>
                <span className="hm-h1a">Một tấm thiệp,</span>
                <em className="hm-h1b">trao tận tay</em>
                <span className="hm-h1c">người thương.</span>
              </h1>
              <p className="hm-hero__lede">Chọn mẫu, điền thông tin, gửi cho mỗi vị khách một đường link mang tên họ. Xác nhận tham dự, sổ lưu bút và mừng cưới QR nằm gọn trong một tấm thiệp.</p>
              <div className="hm-hero__actions">
                <Link className="hm-btn-red" href="/studio">
                  Tạo thiệp miễn phí
                </Link>
                <Link className="hm-btn-line" href="/templates">
                  Xem {templates.length} mẫu thiệp
                </Link>
              </div>
              <div className="hm-hero__proof">
                <span>
                  <span aria-hidden="true" />
                  Không cần đăng nhập để bắt đầu
                </span>
                <span>
                  <span aria-hidden="true" />
                  Tự lưu khi bạn gõ
                </span>
              </div>
            </div>

            <Tilt className="hm-stage">
              <div className="hm-env__back" />
              <div className="hm-env__card">
                <div className="hm-env__bob">
                  <ThiepPreview family="A" deep={red.deep} paper={red.paper} gold={red.gold} a="Hạ Vy" b="Minh Khôi" date="09 · 11 · 2026" place="HÀ NỘI" />
                </div>
              </div>
              <div className="hm-env__front" />
              <div className="hm-env__shade" />
              <div className="hm-env__seal">M</div>
              <div className="hm-env__flap" />
              <div className="hm-chip hm-chip--rsvp">
                <div>
                  <span className="hm-chip__tick">✓</span>
                  <div>
                    <span>Cô Lan &amp; gia đình</span>
                    <span>Xác nhận tham dự · 3 người</span>
                  </div>
                </div>
              </div>
              <div className="hm-chip hm-chip--days">
                <div>
                  <span>CÒN LẠI</span>
                  <span>
                    <CountdownText />
                  </span>
                </div>
              </div>
              <div className="hm-chip hm-chip--wish">
                <div>
                  <span>“Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui nhé!”</span>
                  <span>Minh Thư · vừa gửi lời chúc</span>
                </div>
              </div>
            </Tilt>
          </div>
        </section>

        <section className="hm-marquee" aria-label="Mẫu thiệp">
          <div className="hm-marquee__track">
            {[...MARQUEE, ...MARQUEE].map((t, i) => (
              <Link href={`/templates/${t.id}`} key={`${t.id}-${i}`} tabIndex={i >= MARQUEE.length ? -1 : undefined} aria-hidden={i >= MARQUEE.length || undefined}>
                <div className="hm-marquee__card">
                  <ThiepPreview family={t.family} deep={t.deep} paper={t.paper} gold={t.gold} a={t.a} b={t.b} date={t.date} place={t.place} radius="8px" />
                </div>
                <span>{t.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="hm-quotes" aria-label="Cảm nhận">
          <div className="hm-quotes__track">
            {[...QUOTES, ...QUOTES].map((q, i) => (
              <div key={i} aria-hidden={i >= QUOTES.length || undefined}>
                <span>✦</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="hm-stats-wrap">
          <StatsRow stats={[[templates.length, "", "Mẫu thiệp"], [8, "", "Tính năng"], [7, "", "Công cụ miễn phí"], [0, "đ", "Chi phí"]]} />
        </section>

        <section className="hm-steps">
          <div className="hm-head" data-reveal="1">
            <span className="hm-kicker">BA BƯỚC</span>
            <h2>
              Từ ý tưởng đến tay khách <em>trong một buổi tối</em>
            </h2>
          </div>
          <div className="hm-steps__grid">
            {STEPS.map(([n, title, text, delay]) => (
              <div key={n} data-reveal="1" data-delay={delay}>
                <span>{n}</span>
                <span>{title}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="hm-feats">
          <div className="hm-feats__inner">
            <div className="hm-feats__top" data-reveal="1">
              <div className="hm-head">
                <span className="hm-kicker">TÍNH NĂNG</span>
                <h2>
                  Mọi thứ khách cần, <em>trong một tấm thiệp</em>
                </h2>
              </div>
              <Link className="hm-more" href="/tinh-nang">
                Xem tất cả tính năng →
              </Link>
            </div>
            <div className="hm-feats__grid">
              <Link className="hm-feat" href="/tinh-nang#xac-nhan-tham-du" data-reveal="1" data-delay="0">
                <div className="hm-feat__art hm-rsvp">
                  <div>
                    <span>Tham dự</span>
                    <span>96 / 128</span>
                  </div>
                  <div className="hm-rsvp__bar">
                    <div style={{ "--w": "75%" } as CSSProperties} />
                  </div>
                  <div>
                    <span>Chưa chắc</span>
                    <span>18</span>
                  </div>
                  <div className="hm-rsvp__bar">
                    <div className="hm-rsvp__maybe" style={{ "--w": "14%" } as CSSProperties} />
                  </div>
                </div>
                <span className="hm-feat__title">Xác nhận tham dự</span>
                <span className="hm-feat__text">Khách bấm xác nhận ngay trên thiệp, bạn thấy số người đến theo thời gian thực.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang#so-luu-but" data-reveal="1" data-delay="80">
                <div className="hm-feat__art hm-book">
                  <WishRotator />
                </div>
                <span className="hm-feat__title">Sổ lưu bút</span>
                <span className="hm-feat__text">Lời chúc của khách được lưu lại thành một cuốn sổ nhỏ để đọc về sau.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang#mung-cuoi-qr" data-reveal="1" data-delay="160">
                <div className="hm-feat__art hm-qr">
                  <div className="hm-qr__box">
                    <div className="hm-qr__grid">
                      {QR.map((on, i) => (
                        <span key={i} data-on={on || undefined} />
                      ))}
                    </div>
                    <div className="hm-qr__scan" />
                  </div>
                </div>
                <span className="hm-feat__title">Mừng cưới QR</span>
                <span className="hm-feat__text">Mã QR chuyển khoản nằm sẵn trong thiệp, khách ở xa gửi mừng dễ dàng.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang#ban-do-chi-duong" data-reveal="1" data-delay="240">
                <div className="hm-feat__art hm-map">
                  <div className="hm-map__road1" />
                  <div className="hm-map__road2" />
                  <div className="hm-map__ripple" />
                  <div className="hm-map__pin">
                    <div>
                      <span />
                    </div>
                  </div>
                </div>
                <span className="hm-feat__title">Bản đồ chỉ đường</span>
                <span className="hm-feat__text">Một chạm mở chỉ đường tới nhà hàng hay tư gia, không ai phải hỏi lại.</span>
              </Link>
              <Link className="hm-feat hm-feat--dark" href="/tinh-nang#dem-nguoc-lich" data-reveal="1" data-delay="0">
                <div className="hm-feat__art hm-cd">
                  <CountdownTiles />
                </div>
                <span className="hm-feat__title">Đếm ngược &amp; lịch</span>
                <span className="hm-feat__text">Đồng hồ đếm ngược tới giờ cưới và nút thêm sự kiện vào lịch điện thoại.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang#album-anh" data-reveal="1" data-delay="80">
                <div className="hm-feat__art hm-album">
                  <div className="hm-album__a">
                    <div />
                  </div>
                  <div className="hm-album__b">
                    <div />
                  </div>
                  <div className="hm-album__c">
                    <div />
                  </div>
                </div>
                <span className="hm-feat__title">Album ảnh</span>
                <span className="hm-feat__text">Kể câu chuyện của hai bạn bằng những tấm ảnh cưới đẹp nhất.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang#nhac-nen" data-reveal="1" data-delay="160">
                <div className="hm-feat__art hm-music">
                  <div className="hm-music__disc">
                    <span />
                  </div>
                  <div className="hm-music__bars">
                    {BARS.map((b, i) => (
                      <span key={i} style={{ animation: `eq ${b.d} ease-in-out ${b.dl} infinite` }} />
                    ))}
                  </div>
                </div>
                <span className="hm-feat__title">Nhạc nền</span>
                <span className="hm-feat__text">Bài hát của hai bạn vang lên khi khách mở thiệp.</span>
              </Link>
              <Link className="hm-feat" href="/tinh-nang#phong-bi-loi-moi" data-reveal="1" data-delay="240">
                <div className="hm-feat__art hm-mini">
                  <div className="hm-mini__env">
                    <div className="hm-mini__back" />
                    <div className="hm-mini__card">Vy &amp; Khôi</div>
                    <div className="hm-mini__front" />
                    <div className="hm-mini__flap" />
                  </div>
                </div>
                <span className="hm-feat__title">Phong bì lời mời</span>
                <span className="hm-feat__text">Thiệp mở ra từ phong bì, giống như nhận một tấm thiệp giấy.</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="hm-guest">
          <div className="hm-guest__glow" aria-hidden="true" />
          <div className="hm-guest__inner">
            <div className="hm-guest__copy" data-reveal="1">
              <span className="hm-kicker hm-kicker--gold">LINK RIÊNG CHO TỪNG KHÁCH</span>
              <h2>
                Mỗi vị khách, <em>một lời mời mang tên họ</em>
              </h2>
              <p>Thêm khách vào danh sách, Mộc tạo cho mỗi người một đường link riêng. Khi mở thiệp, khách thấy tên mình ngay dòng đầu. Thiệp hiển thị được cả tiếng Việt và tiếng Anh cho khách nước ngoài.</p>
              <div className="hm-guest__tags">
                <span>Nhập khách từ CSV</span>
                <span>Song ngữ Việt · Anh</span>
                <span>Theo dõi ai đã mở thiệp</span>
              </div>
            </div>
            <div className="hm-guest__card" data-reveal="1" data-delay="150">
              <GuestInvite />
            </div>
          </div>
        </section>

        <section className="hm-tools">
          <div className="hm-tools__grid">
            <div className="hm-tools__intro" data-reveal="1">
              <span className="hm-kicker">CÔNG CỤ MIỄN PHÍ</span>
              <h2>
                Bảy việc nhỏ <em>trước ngày cưới</em>
              </h2>
              <p>Chạy ngay trên trình duyệt, không cần đăng nhập. Dữ liệu của bạn ở lại trên máy của bạn.</p>
              <Link className="hm-more" href="/cong-cu-dam-cuoi">
                Xem tất cả công cụ →
              </Link>
            </div>
            <div className="hm-tools__list">
              {TOOLS.map(([name, desc, href], i) => (
                <Link href={href} key={href} data-reveal="1" data-delay={i * 60}>
                  <span className="hm-tools__n">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <span>{name}</span>
                    <span>{desc}</span>
                  </div>
                  <span className="hm-tools__arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="hm-price-wrap">
          <div className="hm-price" data-reveal="1">
            <div className="hm-price__ring1" aria-hidden="true" />
            <div className="hm-price__ring2" aria-hidden="true" />
            <div className="hm-price__head">
              <span className="hm-kicker hm-kicker--rose">BẢNG GIÁ</span>
              <h2>
                <span>Miễn phí.</span>
                <br />
                <em>Toàn bộ.</em>
              </h2>
            </div>
            <div className="hm-price__body">
              <p>Tất cả mẫu thiệp, tính năng và công cụ đều dùng miễn phí. Mộc được duy trì nhờ sự ủng hộ tự nguyện của những cặp đôi thấy nó có ích.</p>
              <div>
                <Link className="hm-price__cta" href="/studio">
                  Tạo thiệp ngay
                </Link>
                <Link className="hm-price__donate" href="/ung-ho">
                  <span aria-hidden="true">♥</span>Ủng hộ Mộc
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
