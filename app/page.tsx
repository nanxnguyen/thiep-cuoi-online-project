import Link from "next/link";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { Carousel } from "@/components/home/Carousel";
import { Icon } from "@/components/home/Icons";
import { FadeUp, FadeUpArticle, MotionProvider } from "@/components/motion/Motion";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_URL } from "@/lib/site";
import { ScaledFrame } from "@/components/templates/ScaledFrame";
import { sampleContent } from "@/lib/content";
import { allFontClasses } from "@/lib/fonts";
import { getTemplate } from "@/lib/templates";
import "@/components/home/home.css";
import "@/components/templates/gallery.css";

const features = [
  { icon: "phone", tone: "lilac", title: "Đẹp trên mọi điện thoại", text: "Thiết kế cho màn hình nhỏ trước. Khách mở link Zalo là đọc được ngay, không cần cài gì." },
  { icon: "pin", tone: "peach", title: "Chỉ đường một chạm", text: "Nút Google Maps cho từng địa điểm, có bản đồ nhúng khi khách muốn xem. Kèm đếm ngược và thêm vào lịch." },
  { icon: "image", tone: "mint", title: "Album ảnh cưới", text: "Ảnh hiện gọn trên thiệp, chạm vào để xem lớn từng tấm." },
  { icon: "heart", tone: "sky", title: "Sổ lưu bút", text: "Khách để lại lời chúc ngay trên thiệp. Bạn chọn lời nào hiện, lời nào ẩn." },
  { icon: "gift", tone: "night", title: "Hộp mừng cưới", text: "Mã QR chuyển khoản cho cô dâu và chú rể. Khách chỉ cần quét bằng app ngân hàng." },
  { icon: "check", tone: "lilac", title: "Xác nhận tham dự", text: "Biết ai đến, đi mấy người, cần chuẩn bị gì mà không phải nhắn hỏi từng người." },
];

const steps = [
  { title: "Chọn một mẫu", text: "Các mẫu thiết kế riêng, từ tối giản đến đỏ son truyền thống. Đổi mẫu lúc nào cũng được." },
  { title: "Điền thông tin", text: "Tên, ngày giờ, địa điểm, ảnh và lời mời. Xem thiệp cập nhật ngay bên cạnh khi gõ." },
  { title: "Gửi qua Zalo", text: "Xuất bản để có một đường link. Gửi cho từng người, thêm tên khách để lời chào riêng." },
];

const showcase = ["lua-son", "gallery-noir", "maison-blanc", "wild-garden", "afterglow", "soft-type"];

export default function HomePage() {
  const content = sampleContent();
  const front = getTemplate("lua-son")!;
  const back = getTemplate("gallery-noir")!;

  return (
    <div className={allFontClasses}>
      <SiteHeader />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "MỘC Wedding", url: SITE_URL },
          { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "MỘC Wedding", inLanguage: "vi-VN", publisher: { "@id": `${SITE_URL}/#organization` } },
        ],
      }} />
      <MotionProvider>
      <main>
        <section className="home-hero">
          <div className="home-hero__inner">
            <div>
              <p className="eyebrow rise" style={{ "--i": 0 } as React.CSSProperties}>Thiệp cưới online · làm trong 10 phút</p>
              <h1 className="rise" style={{ "--i": 1 } as React.CSSProperties}>
                Thiệp cưới đẹp
                <br />
                như chính <em className="foil">ngày hỷ</em> của bạn.
              </h1>
              <p className="lede rise" style={{ "--i": 2 } as React.CSSProperties}>Chọn mẫu, thêm ảnh và câu chuyện rồi gửi qua Zalo. Khách xác nhận tham dự, gửi lời chúc và mừng cưới ngay trên thiệp.</p>
              <div className="actions rise" style={{ "--i": 3 } as React.CSSProperties}>
                <Link className="button-primary" href="/studio">
                  Tạo thiệp của bạn →
                </Link>
                <Link className="button-ghost" href="/templates">
                  Xem các mẫu
                </Link>
              </div>
              <p className="home-proof rise" style={{ "--i": 4 } as React.CSSProperties}>
                <span>Không cần cài ứng dụng</span>
                <span>Xem tốt trên mọi điện thoại</span>
              </p>
            </div>

            <div className="hero-phones" aria-hidden="true">
              <div className="moon">
                <span className="xi">囍</span>
              </div>
              <div className="phone phone--back">
                <ScaledFrame className="phone__screen">
                  <InvitationRenderer only="cover" mode="preview" gate={false} template={back} content={content} />
                </ScaledFrame>
              </div>
              <div className="phone phone--front">
                <ScaledFrame className="phone__screen">
                  <InvitationRenderer only="cover" mode="preview" gate={false} template={front} content={content} />
                </ScaledFrame>
              </div>
              <div className="float-chip float-chip--rsvp">
                <i>✓</i>
                <span>
                  24 khách sẽ đến
                  <small>3 chưa trả lời</small>
                </span>
              </div>
              <div className="float-chip float-chip--days">
                <i>♡</i>
                <span>
                  Còn 74 ngày
                  <small>Thêm vào lịch</small>
                </span>
              </div>
              <div className="float-chip float-chip--qr">
                <i>◎</i>
                <span>
                  Mừng cưới bằng QR
                  <small>Quét là chuyển</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section">
<FadeUp className="section-intro">
          <p className="eyebrow">Bộ sưu tập</p>
          <h2>
            Mỗi mẫu,
            <br />
            <em>một tâm trạng.</em>
          </h2>
          <p className="lede">Mỗi mẫu là một cách kể khác nhau về ngày cưới. Chọn cái khiến bạn thấy “đúng là mình”.</p>
          </FadeUp>
          <Carousel label="Các mẫu thiệp nổi bật">
            {showcase.map((id) => {
              const t = getTemplate(id)!;
              return (
                <div className="carousel__slide" key={t.id}>
                  <Link className="tpl-card" href={`/templates/${t.id}`}>
                    <ScaledFrame className="tpl-thumb">
                      <InvitationRenderer only="cover" mode="preview" gate={false} template={t} content={content} />
                    </ScaledFrame>
                    <div className="tpl-card__meta">
                      <strong>{t.name}</strong>
                      <p>{t.blurb}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </Carousel>
          <Link className="more-link" href="/templates">
            Xem tất cả mẫu →
          </Link>
        </section>

        <section className="home-section">
<FadeUp className="section-intro">
          <p className="eyebrow">Tính năng</p>
          <h2>
            Mọi thứ khách cần,
            <br />
            <em>ngay trên thiệp.</em>
          </h2>
          <p className="lede">Không còn ghi chú rải rác trong tin nhắn. Mọi thông tin và phản hồi nằm gọn ở một chỗ.</p>
          </FadeUp>
          <div className="bento">
            {features.map((f, i) => (
              <FadeUpArticle className={`tile tile--${f.tone}`} key={f.title} delay={(i % 3) * 0.08}>
                <span className="tile__icon">
                  <Icon name={f.icon} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </FadeUpArticle>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
            <Link className="button-ghost" href="/tinh-nang">
              Xem chi tiết từng tính năng
            </Link>
          </div>
        </section>

        <section className="home-section">
<FadeUp className="section-intro">
          <p className="eyebrow">Cách làm</p>
          <h2>
            Ba bước,
            <br />
            <em>mười phút.</em>
          </h2>
          <p className="lede">Không cần biết thiết kế. Bạn chỉ cần điền thông tin, phần còn lại đã có mẫu lo.</p>
          </FadeUp>
          <div className="steps">
            {steps.map((s, i) => (
              <FadeUpArticle className="step" key={s.title} delay={i * 0.1}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </FadeUpArticle>
            ))}
          </div>
        </section>

        <section className="home-section">
<FadeUp className="section-intro">
          <p className="eyebrow">Đang làm thêm</p>
          <h2>
            Còn nhiều thứ
            <br />
            <em>sắp đến.</em>
          </h2>
          <p className="lede">Chúng mình đang hoàn thiện thêm những phần dưới đây.</p>
          </FadeUp>
          <div className="soon">
            <span>Quản lý khách mời và nhóm bàn</span>
            <span>Thiệp song ngữ</span>
            <span>Video thiệp cho Story</span>
            <Link href="/cong-cu-dam-cuoi">
              <span>Công cụ đám cưới miễn phí →</span>
            </Link>
          </div>
        </section>

        <section className="home-cta on-dark">
          <span className="xi" aria-hidden="true">囍</span>
          <p className="eyebrow">Sẵn sàng chưa?</p>
          <h2>
            Một lời mời
            <br />
            <em>thật riêng.</em>
          </h2>
          <p className="lede">Bắt đầu bằng một mẫu bạn thích. Chỉnh sửa và xem thiệp ngay khi gõ.</p>
          <div className="actions">
            <Link className="button-primary" href="/studio">
              Tạo thiệp của bạn →
            </Link>
          </div>
        </section>
      </main>
      </MotionProvider>
      <SiteFooter />
    </div>
  );
}
