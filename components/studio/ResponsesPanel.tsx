"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useCallback, useEffect, useState } from "react";
import { api, type ResponsesDto } from "@/lib/api";

type Props = { id: string; editKey: string; questions: { id: string; label: string }[]; published: boolean };

const time = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

// What guests sent back: who is coming (the latest answer of each name counts), and the guestbook, where the
// owner decides which wishes stay visible on the invitation.
export function ResponsesPanel({ id, editKey, questions, published }: Props) {
  const [rsvpList] = useAutoAnimate<HTMLUListElement>();
  const [wishList] = useAutoAnimate<HTMLUListElement>();
  const [data, setData] = useState<ResponsesDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api.getResponses(id, editKey));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa tải được phản hồi.");
    } finally {
      setLoading(false);
    }
  }, [id, editKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(wishId: string, hidden: boolean) {
    if (!data) return;
    const before = data;
    setData({ ...data, wishes: data.wishes.map((w) => (w.id === wishId ? { ...w, hidden } : w)) }); // optimistic
    try {
      await api.setWishHidden(id, editKey, wishId, hidden);
    } catch {
      setData(before);
      setError("Chưa đổi được trạng thái lời chúc, bạn thử lại nhé.");
    }
  }

  const label = (qid: string) => questions.find((q) => q.id === qid)?.label ?? qid;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 24 }}>Phản hồi của khách</h2>
        <button type="button" className="button-ghost" style={{ minHeight: 38, padding: "0 16px", fontSize: 13 }} onClick={load} disabled={loading}>
          {loading ? "Đang tải…" : "Làm mới"}
        </button>
      </div>

      {!published && <p className="panel-empty">Thiệp chưa xuất bản nên chưa có phản hồi. Xuất bản rồi gửi link cho khách nhé.</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {data && (
        <>
          <div className="resp-summary" aria-label="Tổng hợp">
            <div className="resp-stat">
              <strong>{data.summary.attending}</strong>
              <span>Sẽ đến</span>
            </div>
            <div className="resp-stat">
              <strong>{data.summary.headcount}</strong>
              <span>Tổng số khách</span>
            </div>
            <div className="resp-stat">
              <strong>{data.summary.declined}</strong>
              <span>Không đến</span>
            </div>
          </div>

          <h3 style={{ fontSize: 18, margin: "0 0 10px" }}>Xác nhận tham dự</h3>
          {data.rsvps.length === 0 ? (
            <p className="panel-empty">Chưa có ai xác nhận.</p>
          ) : (
            <ul className="resp-list" ref={rsvpList}>
              {data.rsvps.map((r) => (
                <li className="resp-item" key={r.id}>
                  <header>
                    <strong>{r.name}</strong>
                    <span className="resp-tag" data-no={!r.attending}>
                      {r.attending ? `Đến · ${r.guests} người` : "Không đến"}
                    </span>
                  </header>
                  {Object.entries(r.answers).map(([qid, value]) => (
                    <p key={qid}>
                      {label(qid)}: <strong style={{ color: "var(--ink)" }}>{value}</strong>
                    </p>
                  ))}
                  {r.note && <p>“{r.note}”</p>}
                  <p style={{ fontSize: 12 }}>
                    {time(r.createdAt)}
                    {r.guestLabel && ` · mở từ link của ${r.guestLabel}`}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <h3 style={{ fontSize: 18, margin: "0 0 10px" }}>Sổ lưu bút</h3>
          {data.wishes.length === 0 ? (
            <p className="panel-empty">Chưa có lời chúc nào.</p>
          ) : (
            <ul className="resp-list" ref={wishList}>
              {data.wishes.map((w) => (
                <li className="resp-item" key={w.id} data-hidden={w.hidden}>
                  <header>
                    <strong>{w.name}</strong>
                    <button type="button" className="link-quiet" onClick={() => toggle(w.id, !w.hidden)}>
                      {w.hidden ? "Hiện lại" : "Ẩn"}
                    </button>
                  </header>
                  <p style={{ color: "var(--ink)", whiteSpace: "pre-line" }}>{w.message}</p>
                  <p style={{ fontSize: 12 }}>
                    {time(w.createdAt)}
                    {w.hidden && " · đang ẩn khỏi thiệp"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
