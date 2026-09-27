"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { api, type AccountInvitation, type AccountUser } from "@/lib/api";
import { accountToken, parseClaimLink } from "@/lib/account";
import { AuthForm, broadcastAuth } from "./AuthForm";
import { getTemplate, getPalette } from "@/lib/templates";
import "./account.css";

const CLAIMED = "moc.account.claimed-links";
const readKeys = (): Record<string, string> => {
  try { return JSON.parse(sessionStorage.getItem(CLAIMED) ?? "{}"); } catch { return {}; }
};

export function AccountClient() {
  const [link, setLink] = useState("");
  const [items, setItems] = useState<AccountInvitation[]>([]);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AccountUser | null>(null);

  const refresh = async (value: string) => { setItems(await api.listAccountInvitations(value)); setKeys(readKeys()); };
  useEffect(() => {
    const saved = accountToken.get();
    api.me(saved).then(async (currentUser) => {
      setProfile(currentUser);
      accountToken.set("session");
      setToken("session");
      await refresh("session");
    }).catch(() => { accountToken.clear(); setToken(""); setProfile(null); }).finally(() => setLoading(false));
  }, []);

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
          <div className="acc-dash__identity">
            <div className="acc-avatar" aria-hidden={!profile?.avatarUrl}>
              {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" /> : profile?.email.slice(0, 1).toUpperCase()}
            </div>
            <span>{profile?.email}</span>
          </div>
          <div>
            <button type="button" className="acc-outline" onClick={() => { void api.logout().finally(() => { accountToken.clear(); setToken(""); setProfile(null); setItems([]); broadcastAuth(null); }); }}>
              Đăng xuất
            </button>
            <Link className="acc-new" href="/studio">
              + Tạo thiệp mới
            </Link>
          </div>
        </div>
        <form className="acc-claim" noValidate onSubmit={claim}>
          <div className="acc-claim__mark" aria-hidden="true">囍</div>
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
                      <button type="button" className="link-quiet" onClick={async () => {
                        if (!window.confirm(`Xoá vĩnh viễn thiệp “${names}”?\n\nDanh sách khách, RSVP, lời chúc và media sẽ bị xoá.`)) return;
                        try { await api.deleteInvitation(item.id); await refresh(token); }
                        catch (failure) { setError(failure instanceof Error ? failure.message : "Chưa xoá được thiệp."); }
                      }}>Xoá thiệp</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <section className="acc-empty-card">
            <div className="acc-empty-card__seal" aria-hidden="true">囍</div>
            <div>
              <span className="acc-kicker">CHƯA CÓ THIỆP</span>
              <h2>Bắt đầu câu chuyện của bạn</h2>
              <p>Tạo một tấm thiệp mang dấu ấn riêng, rồi gửi đến những người bạn thương.</p>
              <Link className="acc-empty-card__cta" href="/studio">Tạo thiệp đầu tiên <span aria-hidden="true">→</span></Link>
            </div>
          </section>
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
        <AuthForm />
      </div>
    </section>
  );
}
