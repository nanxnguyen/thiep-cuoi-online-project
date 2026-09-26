"use client";

import Link from "next/link";
import { useState } from "react";
import type { HelpGroup } from "@/lib/marketing/help";
import "./help.css";

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/đ/g, "d");

// design/Tro Giup.dc.html: topic list on the left, one open answer at a time (the first one to start with); a search
// opens every match.
export function HelpClient({ groups }: { groups: readonly HelpGroup[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(groups[0] ? `${groups[0].id}-0` : null);
  const phrase = normalize(query.trim());
  const total = groups.reduce((count, group) => count + group.items.length, 0);
  let shown = groups
    .map((group) => ({ ...group, items: group.items.map((item, i) => ({ ...item, id: `${group.id}-${i}` })).filter((item) => !phrase || normalize(`${item.q} ${item.a}`).includes(phrase)) }))
    .filter((group) => group.items.length);
  if (selected !== null && !phrase) shown = shown.filter((group) => group.id === selected);
  const topics = [{ id: null as string | null, title: "Tất cả", count: total }, ...groups.map((g) => ({ id: g.id as string | null, title: g.title, count: g.items.length }))];

  return (
    <>
      <section className="help-hero">
        <div className="help-hero__glow" aria-hidden="true" />
        <div className="help-hero__inner">
          <span className="help-hero__kicker">TRỢ GIÚP · {total} CÂU HỎI</span>
          <h1>
            Mộc có thể <em>giúp gì?</em>
          </h1>
          <div className="help-search">
            <input aria-label="Tìm câu hỏi" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm câu hỏi, ví dụ: đổi mẫu, QR, link khách…" />
          </div>
        </div>
      </section>
      <div className="help-layout">
        <aside className="help-sidebar">
          {topics.map((t) => (
            <button type="button" key={t.title} aria-pressed={selected === t.id} onClick={() => { setSelected(t.id); setQuery(""); }}>
              {t.title}
              <span>{t.count}</span>
            </button>
          ))}
          <div className="help-legal">
            <span>Vẫn chưa rõ?</span>
            <span>Xem điều khoản và chính sách quyền riêng tư của Mộc.</span>
            <Link href="/dieu-khoan">Điều khoản →</Link>
            <Link href="/quyen-rieng-tu">Quyền riêng tư →</Link>
          </div>
        </aside>
        <div className="help-results" aria-live="polite">
          {shown.length === 0 && <div className="help-empty">Chưa tìm thấy câu hỏi phù hợp</div>}
          {shown.map((group) => (
            <section key={group.id} id={group.id}>
              <h2>{group.title}</h2>
              <div>
                {group.items.map((item) => {
                  const isOpen = !!phrase || open === item.id;
                  return (
                    <div key={item.id} className="help-q">
                      <button type="button" aria-expanded={isOpen} onClick={() => setOpen((o) => (o === item.id ? null : item.id))}>
                        <span>{item.q}</span>
                        <span aria-hidden="true" style={{ transform: isOpen ? "rotate(45deg)" : "none" }}>
                          +
                        </span>
                      </button>
                      {isOpen && <p>{item.a}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
