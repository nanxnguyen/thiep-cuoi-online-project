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

  if (loading && !token) return <main className="acc-loading" aria-busy="true"><p>Đang mở tài khoản…</p></main>;

  // design/Tai Khoan.dc.html, value for value. RSVP/wish counts on the cards and the sign-up name field wait for the
  // Supabase content contract (blocked in PROGRESS.md).
  if (token)
    return (
      <main className="acc-dash">
        <div className="acc-dash__head">
          <div>
            <span className="acc-kicker">XIN CHÀO</span>
            <h1>Thiệp của bạn</h1>
          </div>
          <div>
            <button type="button" className="acc-outline" onClick={() => { void api.logout().finally(() => { accountToken.clear(); setToken(""); setItems([]); }); }}>
              Đăng xuất
            </button>
            <Link className="acc-new" href="/studio">
              + Tạo thiệp mới
            </Link>
          </div>
        </div>
        <form className="acc-claim" noValidate onSubmit={claim}>
          <div>
            <span>Nhận thiệp cũ vào tài khoản</span>
            <span>
              Dán link sửa có dạng <code>…#k=…</code> để thiệp hiện trong danh sách.
            </span>
          </div>
          <div>
            <input aria-label="Link chỉnh sửa" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://moc.vn/studio/abc#k=…" />
            <button disabled={loading || !link.trim()}>Nhận thiệp</button>
          </div>
        </form>
        {error && <p className="form-error" role="alert">{error}</p>}
        {items.length ? (
          <div className="acc-cards">
            {items.map((item) => {
              const template = getTemplate(item.templateId);
              const palette = template ? getPalette(template, item.paletteKey) : null;
              const names = [item.brideName, item.groomName].filter(Boolean).join(" & ") || "Thiệp của bạn";
              const date = /^\d{4}-\d{2}-\d{2}$/.test(item.weddingDate) ? item.weddingDate.split("-").reverse().join(".") : "Chưa đặt ngày";
              return (
                <div key={item.id} className="acc-card">
                  <div className="acc-card__cover" style={palette ? { background: palette.bg, color: palette.ink } : undefined}>
                    <span>{names}</span>
                    <span className={item.published ? "acc-status acc-status--live" : "acc-status"}>{item.published ? "Đang gửi" : "Bản nháp"}</span>
                  </div>
                  <div className="acc-card__body">
                    <div>
                      <span>{template?.name ?? "Mẫu thiệp"}</span>
                      <span>{date}</span>
                    </div>
                    <div>
                      <Link href={keys[item.id] ? `/studio/${item.id}#k=${encodeURIComponent(keys[item.id])}` : `/studio/${item.id}`}>Chỉnh sửa</Link>
                      {item.published && <Link href={`/invite/${item.slug}`}>Xem thiệp</Link>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="acc-empty">
            Chưa có thiệp trong tài khoản. <Link href="/studio">Tạo thiệp đầu tiên →</Link>
          </p>
        )}
      </main>
    );

  return (
    <section className="acc">
      <div className="acc-story">
        <div className="acc-story__a" aria-hidden="true">囍</div>
        <div className="acc-story__b" aria-hidden="true">
          <span>SAVE THE DATE</span>
          <span>Vy &amp; Khôi</span>
        </div>
        <span className="acc-kicker acc-kicker--gold">TÀI KHOẢN MỘC</span>
        <div className="acc-story__copy">
          <h1>
            Giữ mọi tấm thiệp <em>ở một nơi.</em>
          </h1>
          <p>Không bắt buộc. Tài khoản giúp bạn mở thiệp trên nhiều thiết bị và không lo mất link sửa.</p>
        </div>
      </div>
      <div className="acc-access">
        <div>
          <div className="acc-tabs" role="group" aria-label="Chọn đăng nhập hoặc đăng ký">
            <button type="button" aria-pressed={!register} onClick={() => { setRegister(false); setError(""); }}>
              Đăng nhập
            </button>
            <button type="button" aria-pressed={register} onClick={() => { setRegister(true); setError(""); }}>
              Đăng ký
            </button>
          </div>
          <div className="acc-access__title">
            <h2>{register ? "Tạo tài khoản" : "Chào mừng trở lại"}</h2>
            <span>{register ? "Chỉ cần email và mật khẩu." : "Đăng nhập để xem thiệp của bạn."}</span>
          </div>
          <form className="acc-form" noValidate onSubmit={submit}>
            <label>
              Email
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@email.com" />
            </label>
            <label>
              Mật khẩu
              <input type="password" autoComplete={register ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Ít nhất 8 ký tự" />
            </label>
            <button disabled={loading}>
              {loading && <span className="acc-spin" aria-hidden="true" />}
              {loading ? "Đang xử lý…" : register ? "Tạo tài khoản" : "Đăng nhập"}
            </button>
          </form>
          {error && <p className="form-error" role="alert">{error}</p>}
          <span className="acc-alt">
            Chưa muốn đăng ký? <Link href="/studio">Tạo thiệp không cần tài khoản</Link>
          </span>
        </div>
      </div>
    </section>
  );
}
