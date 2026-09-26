"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { HelpGroup } from "@/lib/marketing/help";
import "./help.css";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d");

export function HelpClient({ groups }: { groups: readonly HelpGroup[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const phrase = normalize(query.trim());
  const shown = groups.map((group) => ({ ...group, items: group.items.filter((item) => !phrase || normalize(`${item.q} ${item.a}`).includes(phrase)) })).filter((group) => group.items.length && (phrase || !selected || selected === group.id));
  const total = groups.reduce((count, group) => count + group.items.length, 0);

  return <>
    <section className="help-hero"><div><p>TRỢ GIÚP · {total} CÂU HỎI</p><h1>MỘC có thể <em>giúp gì?</em></h1><div className="help-search"><label className="inv-sr-only" htmlFor="help-query">Tìm câu hỏi</label><input id="help-query" ref={search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm câu hỏi, ví dụ: đổi mẫu, QR, link khách…" />{query && <button type="button" onClick={() => { setQuery(""); search.current?.focus(); }} aria-label="Xóa tìm kiếm">×</button>}</div></div></section>
    <div className="help-layout"><aside className="help-sidebar"><nav aria-label="Chủ đề trợ giúp"><button type="button" aria-pressed={!selected} onClick={() => { setSelected(""); setQuery(""); }}>Tất cả <span>{total}</span></button>{groups.map((group) => <button type="button" key={group.id} aria-pressed={selected === group.id && !query} onClick={() => { setSelected(group.id); setQuery(""); }}>{group.title}<span>{group.items.length}</span></button>)}</nav><div className="help-legal"><strong>Vẫn chưa rõ?</strong><p>Xem điều khoản và chính sách quyền riêng tư của MỘC.</p><Link href="/dieu-khoan">Điều khoản →</Link><Link href="/quyen-rieng-tu">Quyền riêng tư →</Link></div></aside><div className="help-results" aria-live="polite">{shown.length ? shown.map((group) => <section key={group.id} id={group.id}><h2>{group.title}</h2><div>{group.items.map((item) => <details key={item.q} open={phrase ? true : undefined}><summary>{item.q}<span aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</div></section>) : <p className="help-empty">Chưa tìm thấy câu hỏi phù hợp</p>}</div></div>
  </>;
}
