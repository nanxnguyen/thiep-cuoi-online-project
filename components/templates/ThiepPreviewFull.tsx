"use client";

import { useEffect, useState } from "react";

// The design's `full` sample invitation under the cover (design/Thiep Preview.dc.html, `sc-if full`): fixed sample
// content (families, schedule, story, dress code, wishes) at the design's 240px scale. Showcase only — not wired to
// contentSchema. The countdown is computed after mount so server and client markup agree.
const PH = "/photos/";
const WEEKDAYS = ["CHỦ NHẬT", "THỨ HAI", "THỨ BA", "THỨ TƯ", "THỨ NĂM", "THỨ SÁU", "THỨ BẢY"];
const ALBUM = ["cua-so-vom", "han-phuc-co-trang", "voan-hoa-kho", "nang-chieu", "khoi-hong", "studio-hoa-trang", "o-hoa", "lau-dai-trang", "hoa-hong-phan"];
const SCHEDULE = [
  ["09:00", "Lễ gia tiên", "Tại tư gia nhà gái"],
  ["11:00", "Lễ rước dâu", "Về nhà trai"],
  ["17:30", "Đón khách", "Sảnh Ngọc Lan"],
  ["18:30", "Khai tiệc", "Cùng nâng ly chúc mừng"],
];
const STORY = [
  ["2019", "Lần đầu gặp", "Một buổi chiều mưa ở quán cà phê quen.", "vuon-bong-bong"],
  ["2022", "Chính thức hẹn hò", "Chuyến đi Đà Lạt đầu tiên cùng nhau.", "nang-chieu"],
  ["2026", "Lời cầu hôn", "Dưới cơn mưa hoa trong khu vườn nhỏ.", "khoi-hong"],
];
const WISHES = [
  ["Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui nhé!", "Minh Anh"],
  ["Cuối cùng cũng đến ngày này rồi. Hạnh phúc thật nhiều!", "Hội bạn cấp 3"],
  ["Mong hai con luôn yêu thương, nhường nhịn nhau.", "Cô Hoa"],
];
const pad = (n: number) => String(n).padStart(2, "0");

function Img({ src, alt = "" }: { src?: string; alt?: string }) {
  if (src) return <img className="tpf-img" src={src} alt={alt} />;
  return (
    <span className="tp-slot" aria-hidden="true">
      <span className="tp-slot__cap">QR</span>
      <i className="tp-slot__ring" />
    </span>
  );
}

export function ThiepPreviewFull({ a, b, date, place }: { a: string; b: string; date: string; place: string }) {
  const [d, m, y] = date.split("·").map((s) => Number(s.trim()));
  const when = new Date(y || 2026, (m || 1) - 1, d || 1);
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => setLeft(Math.max(0, Math.floor((when.getTime() - Date.now()) / 1000))), [when.getTime()]);
  const s = left ?? 0;
  const tiles = [[Math.floor(s / 86400), "NGÀY"], [Math.floor((s % 86400) / 3600), "GIỜ"], [Math.floor((s % 3600) / 60), "PHÚT"], [s % 60, "GIÂY"]] as const;

  return (
    <div className="tpf">
      <div className="tpf-intro">
        <span className="tpf-k">TRÂN TRỌNG BÁO TIN</span>
        <span className="tpf-intro__title">
          Lễ thành hôn của
          <br />
          chúng mình
        </span>
        <span className="tpf-intro__rule" />
        <span className="tpf-intro__quote">“Yêu nhau không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.”</span>
      </div>
      <div className="tpf-fam">
        <div>
          <span className="tpf-fam__k">NHÀ TRAI</span>
          <span className="tpf-fam__n">
            Ông Nguyễn Văn Tuấn
            <br />
            Bà Trần Thị Mai
          </span>
          <span className="tpf-fam__a">23 Nguyễn Trãi, Thanh Xuân, Hà Nội</span>
        </div>
        <div className="tpf-fam__r">
          <span className="tpf-fam__k">NHÀ GÁI</span>
          <span className="tpf-fam__n">
            Ông Lê Văn Hùng
            <br />
            Bà Hồ Thị Lan
          </span>
          <span className="tpf-fam__a">68 Sư Vạn Hạnh, Q.10, TP.HCM</span>
        </div>
      </div>
      <div className="tpf-dark tpf-couple">
        <span className="tpf-k tpf-k--gold">CHÚ RỂ &amp; CÔ DÂU</span>
        <div className="tpf-couple__row">
          <div className="tpf-couple__who">
            <div className="tpf-couple__ph">
              <Img src={`${PH}quan-phuc-studio.jpg`} />
            </div>
            <span className="tpf-couple__name">{b}</span>
            <span className="tpf-couple__rank">Trưởng nam</span>
          </div>
          <span className="tpf-couple__amp">&amp;</span>
          <div className="tpf-couple__who">
            <div className="tpf-couple__ph">
              <Img src={`${PH}bieu-thu-canh-hoa.jpg`} />
            </div>
            <span className="tpf-couple__name">{a}</span>
            <span className="tpf-couple__rank">Út nữ</span>
          </div>
        </div>
      </div>
      <div className="tpf-cer">
        <span className="tpf-k">LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI TƯ GIA</span>
        <span className="tpf-cer__time">VÀO LÚC 09:00</span>
        <div className="tpf-cer__date">
          <span>{Number.isNaN(when.getTime()) ? "" : WEEKDAYS[when.getDay()]}</span>
          <i />
          <span className="tpf-cer__day">{pad(d || 1)}</span>
          <i />
          <span>THÁNG {pad(m || 1)}</span>
        </div>
        <span className="tpf-cer__year">{Number.isNaN(y) ? "" : y}</span>
        <span className="tpf-cer__place">{place}</span>
      </div>
      <div className="tpf-party">
        <span className="tpf-k">TIỆC CƯỚI</span>
        <span className="tpf-party__venue">Trung tâm Tiệc cưới Hoa Sen</span>
        <span className="tpf-party__addr">Sảnh Ngọc Lan · 18 Lý Thường Kiệt, Hoàn Kiếm</span>
        <div className="tpf-party__times">
          <div>
            <span>ĐÓN KHÁCH</span>
            <span>17:30</span>
          </div>
          <div>
            <span>KHAI TIỆC</span>
            <span>18:30</span>
          </div>
        </div>
        <span className="tpf-party__map">Xem chỉ đường</span>
      </div>
      <div className="tpf-sched">
        <span className="tpf-k">LỊCH TRÌNH</span>
        <div>
          {SCHEDULE.map(([t, n, dsc]) => (
            <div className="tpf-sched__row" key={t}>
              <span className="tpf-sched__t">{t}</span>
              <span className="tpf-sched__dot" />
              <div>
                <span className="tpf-sched__n">{n}</span>
                <span className="tpf-sched__d">{dsc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="tpf-dark tpf-cd">
        <span className="tpf-k tpf-k--gold">CÒN LẠI</span>
        <div className="tpf-cd__tiles">
          {tiles.map(([v, l]) => (
            <div key={l}>
              <span>{pad(v)}</span>
              <span>{l}</span>
            </div>
          ))}
        </div>
        <span className="tpf-cd__add">+ Thêm vào lịch</span>
      </div>
      <div className="tpf-album">
        <span className="tpf-k">ALBUM ẢNH</span>
        <div className="tpf-album__grid">
          {ALBUM.map((p, i) => (
            <div key={p} style={i === 0 ? { gridColumn: "span 2", gridRow: "span 2" } : undefined}>
              <Img src={`${PH}${p}.jpg`} />
            </div>
          ))}
        </div>
      </div>
      <div className="tpf-story">
        <span className="tpf-k">CHUYỆN CỦA CHÚNG MÌNH</span>
        {STORY.map(([yr, n, dsc, p]) => (
          <div className="tpf-story__row" key={yr}>
            <div className="tpf-story__ph">
              <Img src={`${PH}${p}.jpg`} />
            </div>
            <div>
              <span className="tpf-story__y">{yr}</span>
              <span className="tpf-story__n">{n}</span>
              <span className="tpf-story__d">{dsc}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="tpf-dress">
        <span className="tpf-k">TRANG PHỤC GỢI Ý</span>
        <div>
          <span style={{ background: "var(--tp-deep)" }} />
          <span style={{ background: "var(--tp-gold)" }} />
          <span className="tpf-dress__white" />
          <span style={{ background: "var(--ink)" }} />
        </div>
      </div>
      <div className="tpf-rsvp">
        <span className="tpf-k">XÁC NHẬN THAM DỰ</span>
        <span className="tpf-rsvp__input">Tên của bạn</span>
        <div className="tpf-rsvp__btns">
          <span>Sẽ đến</span>
          <span>Rất tiếc</span>
        </div>
        <div />
      </div>
      <div className="tpf-wish">
        <span className="tpf-k">SỔ LƯU BÚT</span>
        {WISHES.map(([msg, n]) => (
          <div key={n}>
            <span className="tpf-wish__m">“{msg}”</span>
            <span className="tpf-wish__n">— {n}</span>
          </div>
        ))}
      </div>
      <div className="tpf-dark tpf-gift">
        <span className="tpf-k tpf-k--gold">HỘP MỪNG CƯỚI</span>
        <span className="tpf-gift__lead">Sự có mặt của bạn là lời chúc quý giá nhất.</span>
        <div className="tpf-gift__grid">
          {[["NHÀ TRAI", "Vietcombank"], ["NHÀ GÁI", "Techcombank"]].map(([k, bank]) => (
            <div key={k}>
              <span className="tpf-gift__k">{k}</span>
              <div className="tpf-gift__qr">
                <Img />
              </div>
              <span className="tpf-gift__bank">{bank}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="tpf-thanks">
        <Img src={`${PH}cua-so-vom.jpg`} />
        <div className="tpf-thanks__shade" />
        <div className="tpf-thanks__text">
          <span className="tpf-thanks__big">Thank you</span>
          <span>Cảm ơn vì đã là một phần của ngày này</span>
          <span className="tpf-thanks__names">
            {a} &amp; {b}
          </span>
        </div>
      </div>
    </div>
  );
}
