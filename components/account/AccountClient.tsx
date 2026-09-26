"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { api, type AccountInvitation } from "@/lib/api";
import { accountToken, parseClaimLink } from "@/lib/account";
import { getTemplate, getPalette } from "@/lib/templates";
import "./account.css";

const CLAIMED = "moc.account.claimed-links";
const readKeys = (): Record<string, string> => {
  try { return JSON.parse(sessionStorage.getItem(CLAIMED) ?? "{}"); } catch { return {}; }
};

export function AccountClient() {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [link, setLink] = useState("");
  const [items, setItems] = useState<AccountInvitation[]>([]);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = async (value: string) => { setItems(await api.listAccountInvitations(value)); setKeys(readKeys()); };
  useEffect(() => {
    const saved = accountToken.get();
    api.me(saved).then(async () => {
      accountToken.set("session");
      setToken("session");
      await refresh("session");
    }).catch(() => { accountToken.clear(); setToken(""); }).finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) { setError("Nhập email hợp lệ và mật khẩu ít nhất 8 ký tự."); return; }
    setLoading(true);
    setError("");
    try {
      await (register ? api.register(email, password) : api.login(email, password));
      accountToken.set("session");
      setToken("session");
      await refresh("session");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Chưa thực hiện được, hãy thử lại.");
    } finally { setLoading(false); }
  }

  async function claim(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    const parsed = parseClaimLink(link, window.location.origin);
    if (!parsed) { setError("Link chỉnh sửa không hợp lệ. Hãy dán link có #k=."); return; }
    setLoading(true);
    setError("");
    try {
      await api.claimInvitation(token, parsed.id, parsed.key);
      sessionStorage.setItem(CLAIMED, JSON.stringify({ ...readKeys(), [parsed.id]: parsed.key }));
      setLink("");
      await refresh(token);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Chưa nhận được thiệp, hãy thử lại.");
    } finally { setLoading(false); }
  }

  if (loading && !token) return <main className="account-page account-page--loading" aria-busy="true"><p>Đang mở tài khoản…</p></main>;

  if (token) return <main className="account-dashboard">
    <div className="account-dashboard__head"><div><p className="eyebrow">Xin chào</p><h1>Thiệp của bạn</h1></div><div><button type="button" className="button-ghost" onClick={() => { void api.logout().finally(() => { accountToken.clear(); setToken(""); setItems([]); }); }}>Đăng xuất</button><Link className="button-primary" href="/studio">+ Tạo thiệp mới</Link></div></div>
    <form className="account-claim" noValidate onSubmit={claim}><div><h2>Nhận thiệp cũ vào tài khoản</h2><p>Dán link sửa có dạng <code>…#k=…</code> để thiệp hiện trong danh sách.</p></div><label><span className="inv-sr-only">Link chỉnh sửa</span><input className="input" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://…/studio/…#k=…" /></label><button className="button-primary" disabled={loading || !link.trim()}>Nhận thiệp</button></form>
    {error && <p className="form-error" role="alert">{error}</p>}
    {items.length ? <ul className="account-list">{items.map((item) => {
      const template = getTemplate(item.templateId);
      const palette = template ? getPalette(template, item.paletteKey) : null;
      const names = [item.groomName, item.brideName].filter(Boolean).join(" & ") || "Thiệp của bạn";
      const date = /^\d{4}-\d{2}-\d{2}$/.test(item.weddingDate) ? item.weddingDate.split("-").reverse().join(".") : "Chưa đặt ngày";
      return <li key={item.id} className="account-invitation"><div className="account-invitation__cover" style={palette ? { background: palette.bg, color: palette.ink } : undefined}><span>{names}</span><small>{item.published ? "Đang gửi" : "Bản nháp"}</small></div><div className="account-invitation__body"><strong>{names}</strong><p>{template?.name ?? "Mẫu thiệp"} · {date}</p><div><Link href={keys[item.id] ? `/studio/${item.id}#k=${encodeURIComponent(keys[item.id])}` : `/studio/${item.id}`}>Chỉnh sửa</Link>{item.published && <Link href={`/invite/${item.slug}`}>Xem thiệp</Link>}</div></div></li>;
    })}</ul> : <p className="account-empty">Chưa có thiệp trong tài khoản. <Link href="/studio">Tạo thiệp đầu tiên →</Link></p>}
  </main>;

  return <main className="account-page">
    <section className="account-story"><div className="account-story__cards" aria-hidden="true"><span>囍</span><span><small>SAVE THE DATE</small>Vy &amp; Khôi</span></div><p className="eyebrow">Tài khoản MỘC</p><div><h1>Giữ mọi tấm thiệp <em>ở một nơi.</em></h1><p>Không bắt buộc. Tài khoản giúp bạn mở thiệp trên nhiều thiết bị và không lo mất link sửa.</p></div></section>
    <section className="account-access" aria-label="Đăng nhập hoặc đăng ký"><div className="account-access__inner"><div className="account-tabs" role="group" aria-label="Chọn đăng nhập hoặc đăng ký"><button type="button" aria-pressed={!register} onClick={() => { setRegister(false); setError(""); }}>Đăng nhập</button><button type="button" aria-pressed={register} onClick={() => { setRegister(true); setError(""); }}>Đăng ký</button></div><div><h2>{register ? "Tạo tài khoản" : "Chào mừng trở lại"}</h2><p>{register ? "Chỉ cần email và mật khẩu." : "Đăng nhập để xem thiệp của bạn."}</p></div><form className="account-form" noValidate onSubmit={submit}><label>Email<input className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@email.com" /></label><label>Mật khẩu<span className="account-password"><input className="input" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Ít nhất 8 ký tự" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{showPassword ? "Ẩn" : "Hiện"}</button></span></label><button className="button-primary" disabled={loading}>{loading ? "Đang xử lý…" : register ? "Tạo tài khoản" : "Đăng nhập"}</button></form>{error && <p className="form-error" role="alert">{error}</p>}<p>Chưa muốn đăng ký? <Link href="/studio">Tạo thiệp không cần tài khoản</Link></p></div></section>
  </main>;
}
