"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, type AdminList, type AdminTemplateRow } from "@/lib/api";
import {
  EmptyState,
  ErrorState,
  FilterPills,
  Pagination,
  SearchInput,
  StatCard,
  Toast,
  type AdminToast,
} from "./index.ts";
import {
  TEMPLATE_STYLES,
  badgeLabel,
  nextBadge,
  templateStripColors,
  type TemplateBadge,
} from "./templatePalette.ts";

const PER_PAGE = 12;
const SUMMARY_PAGE_SIZE = 50; // seed holds 50 rows, so one page covers every style for the KPI bars

type Patch = { name?: string; style?: string; badge?: TemplateBadge; hidden?: boolean };

// Layout below uses inline styles with var(--token) colours only — the repo
// guard (tests/design-system.test.ts) forbids raw hex in components, and
// components/admin/admin.css belongs to the Task 3 UI kit (not this slice).
const eyebrow: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: 12,
  letterSpacing: ".18em",
  color: "var(--muted)",
  fontWeight: 600,
};
const titleRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  flexWrap: "wrap",
  gap: 12,
  marginBottom: 20,
};
const publicLink: React.CSSProperties = { fontSize: 13, color: "var(--muted)", textDecoration: "none" };
const styleRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12 };
const styleLabel: React.CSSProperties = { fontSize: 13, width: 110, flex: "none" };
const styleTrack: React.CSSProperties = {
  flex: 1,
  height: 10,
  borderRadius: 999,
  background: "var(--paper-soft)",
  overflow: "hidden",
};
const styleFill: React.CSSProperties = { height: "100%", background: "var(--accent)", borderRadius: 999 };
const styleCount: React.CSSProperties = { fontSize: 12, color: "var(--muted)", width: 20, textAlign: "right" };
const tplGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 16,
};
const tplCard: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 18,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};
const tplStrip: React.CSSProperties = { display: "flex", height: 64 };
const tplStripBand: React.CSSProperties = { flex: 1 };
const tplBody: React.CSSProperties = { padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 };
const tplHead: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 };
const tplName: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 17,
  lineHeight: 1.2,
};
const tplBadgeBase: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 10,
  fontWeight: 600,
  padding: "4px 9px",
  borderRadius: 999,
  border: 0,
  cursor: "pointer",
  whiteSpace: "nowrap",
  minHeight: 32,
};
const tplMeta: React.CSSProperties = { fontSize: 12, color: "var(--muted)" };
const tplActions: React.CSSProperties = { marginTop: "auto", display: "flex", gap: 6 };
const tplBtn: React.CSSProperties = { flex: 1 };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--muted)", marginBottom: 14 };
const fieldInput: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 14,
  padding: 12,
  borderRadius: 12,
  border: "1px solid var(--line-strong)",
  background: "var(--field-bg)",
  color: "var(--ink)",
  minHeight: 44,
  boxSizing: "border-box",
  width: "100%",
};

function badgeStyle(badge: TemplateBadge): React.CSSProperties {
  if (badge === "HOT") return { ...tplBadgeBase, background: "var(--accent)", color: "var(--surface)" };
  if (badge === "MỚI") return { ...tplBadgeBase, background: "var(--paper-alt)", color: "var(--accent)" };
  return { ...tplBadgeBase, background: "var(--paper-soft)", color: "var(--muted)" };
}

async function readProblem(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: unknown };
    if (typeof body.detail === "string" && body.detail) return body.detail;
  } catch {
    /* non-JSON error body */
  }
  return fallback;
}

async function fetchTemplatePage(
  params: { q: string; style: string; page: number; perPage: number },
  signal: AbortSignal,
): Promise<AdminList<AdminTemplateRow>> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.style !== "all") sp.set("style", params.style);
  sp.set("page", String(params.page));
  sp.set("perPage", String(params.perPage));
  const res = await fetch(`/api/admin/templates?${sp}`, { cache: "no-store", signal });
  if (!res.ok) throw new Error(await readProblem(res, "Chưa tải được danh sách mẫu thiệp."));
  return (await res.json()) as AdminList<AdminTemplateRow>;
}

// Content of /admin/templates (design/Admin Mau Thiep.dc.html). The panel
// layout (Task 4) wraps this in <AdminShell>; this component owns filters,
// the palette grid, badge cycling, hide/show, the edit modal and toasts.
export function TemplatesClient() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [nonce, setNonce] = useState(0);
  const [items, setItems] = useState<AdminTemplateRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [summary, setSummary] = useState<AdminTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<AdminToast | null>(null);
  const [mutating, setMutating] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminTemplateRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editStyle, setEditStyle] = useState<string>(TEMPLATE_STYLES[0]);
  const [saving, setSaving] = useState(false);
  const searchSignal = useRef<AbortSignal | null>(null);

  const flash = useCallback((message: string, onUndo?: () => void) => {
    setToast({ id: Date.now(), message, ...(onUndo ? { onUndo } : {}) });
  }, []);

  const handleSearch = useCallback((q: string, signal: AbortSignal) => {
    searchSignal.current = signal;
    setQuery(q);
    setPage(1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    searchSignal.current?.addEventListener("abort", abort);
    let alive = true;
    setLoading(true);
    setError("");
    Promise.all([
      fetchTemplatePage({ q: query, style: filter, page, perPage: PER_PAGE }, controller.signal),
      fetchTemplatePage({ q: "", style: "all", page: 1, perPage: SUMMARY_PAGE_SIZE }, controller.signal),
    ])
      .then(([paged, all]) => {
        if (!alive) return;
        setItems(paged.items);
        setTotal(paged.total);
        setPageCount(paged.pageCount);
        setSummary(all.items);
      })
      .catch((failure: unknown) => {
        if (!alive || controller.signal.aborted) return;
        setError(failure instanceof Error ? failure.message : "Chưa tải được danh sách mẫu thiệp.");
      })
      .finally(() => {
        if (alive && !controller.signal.aborted) setLoading(false);
      });
    return () => {
      alive = false;
      searchSignal.current?.removeEventListener("abort", abort);
      controller.abort();
    };
  }, [filter, query, page, nonce]);

  const mutate = useCallback(
    async (id: string, patch: Patch, prev: Patch | null, message: string) => {
      setMutating(id);
      try {
        const updated = await api.admin.patchTemplate(id, patch);
        setItems((current) => current.map((row) => (row.id === id ? updated : row)));
        setSummary((current) => current.map((row) => (row.id === id ? updated : row)));
        flash(message, prev ? () => void mutate(id, prev, null, "Đã hoàn tác thay đổi.") : undefined);
      } catch (failure) {
        flash(failure instanceof ApiError ? failure.message : "Chưa lưu được thay đổi, bạn thử lại nhé.");
      } finally {
        setMutating(null);
      }
    },
    [flash],
  );

  const cycleBadge = useCallback(
    (row: AdminTemplateRow) => {
      if (mutating) return;
      const next = nextBadge(row.badge);
      void mutate(row.id, { badge: next }, { badge: row.badge }, `Đã đổi nhãn ${row.name} thành "${badgeLabel(next)}".`);
    },
    [mutate, mutating],
  );

  const toggleHidden = useCallback(
    (row: AdminTemplateRow) => {
      if (mutating) return;
      const hidden = !row.hidden;
      void mutate(
        row.id,
        { hidden },
        { hidden: row.hidden },
        hidden ? `Đã ẩn mẫu ${row.name} khỏi trang Mẫu thiệp.` : `Đã hiện lại mẫu ${row.name}.`,
      );
    },
    [mutate, mutating],
  );

  const openEdit = useCallback((row: AdminTemplateRow) => {
    setEditing(row);
    setEditName(row.name);
    setEditStyle(
      (TEMPLATE_STYLES as readonly string[]).includes(row.style) ? row.style : TEMPLATE_STYLES[0],
    );
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editing || saving) return;
    const name = editName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const updated = await api.admin.patchTemplate(editing.id, { name, style: editStyle });
      setItems((current) => current.map((row) => (row.id === editing.id ? updated : row)));
      setSummary((current) => current.map((row) => (row.id === editing.id ? updated : row)));
      const prev = { name: editing.name, style: editing.style };
      setEditing(null);
      flash(`Đã lưu thay đổi mẫu ${updated.name}.`, () =>
        void mutate(editing.id, prev, null, "Đã hoàn tác thay đổi."),
      );
    } catch (failure) {
      flash(failure instanceof ApiError ? failure.message : "Chưa lưu được thay đổi, bạn thử lại nhé.");
    } finally {
      setSaving(false);
    }
  }, [editing, editName, editStyle, flash, mutate, saving]);

  useEffect(() => {
    if (!editing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditing(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editing]);

  const hiddenCount = summary.filter((row) => row.hidden).length;
  const hotCount = summary.filter((row) => row.badge === "HOT").length;
  const newCount = summary.filter((row) => row.badge === "MỚI").length;
  const styleCounts = TEMPLATE_STYLES.map((style) => ({
    label: style,
    value: summary.filter((row) => row.style === style).length,
  }));
  const topStyle = styleCounts.reduce((top, current) => (current.value > top.value ? current : top), styleCounts[0]);
  const maxStyle = Math.max(1, ...styleCounts.map((entry) => entry.value));

  return (
    <div>
      <p style={eyebrow}>QUẢN TRỊ · MẪU THIỆP</p>
      <div style={titleRow}>
        <h1 className="adm-h1">Mẫu thiệp ({total})</h1>
        <a className="adm-tpl-public-link" style={publicLink} href="/templates">
          Xem trang Mẫu thiệp công khai →
        </a>
      </div>

      {error && !loading ? (
        <ErrorState message={error} onRetry={() => setNonce((n) => n + 1)} />
      ) : (
        <>
          <div className="adm-grid-kpi" aria-busy={loading}>
            <StatCard label="Tổng số mẫu" value={summary.length} sub={`${hiddenCount} đang ẩn`} />
            <StatCard label="Nhãn HOT" value={hotCount} sub="Được chọn nhiều nhất" />
            <StatCard label="Nhãn MỚI" value={newCount} sub="Thêm gần đây" />
            <StatCard label="Phong cách nhiều nhất" value={topStyle.label} sub={`${topStyle.value} mẫu`} />
          </div>

          <section className="adm-card" aria-label="Phân bổ theo phong cách" style={{ marginBottom: 20 }}>
            <h2 className="adm-card-title">Phân bổ theo phong cách</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {styleCounts.map((entry) => (
                <div key={entry.label} style={styleRow}>
                  <span style={styleLabel}>{entry.label}</span>
                  <div style={styleTrack} role="img" aria-label={`${entry.label}: ${entry.value} mẫu`}>
                    <div style={{ ...styleFill, width: `${Math.round((entry.value / maxStyle) * 100)}%` }} />
                  </div>
                  <span style={styleCount}>{entry.value}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="adm-toolbar">
            <FilterPills
              ariaLabel="Lọc theo phong cách"
              active={filter}
              onChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Tất cả" },
                ...TEMPLATE_STYLES.map((style) => ({ value: style, label: style })),
              ]}
            />
            <SearchInput placeholder="Tìm theo tên mẫu…" ariaLabel="Tìm theo tên mẫu" onSearch={handleSearch} />
          </div>

          {items.length === 0 && !loading ? (
            <EmptyState title="Không có mẫu nào khớp." hint="Bạn thử đổi từ khoá hoặc bộ lọc phong cách nhé." />
          ) : (
            <div style={tplGrid}>
              {items.map((row) => {
                const [deep, paper, gold] = templateStripColors(row.id);
                return (
                  <article
                    key={row.id}
                    style={row.hidden ? { ...tplCard, opacity: 0.45 } : tplCard}
                    aria-label={`Mẫu ${row.name}`}
                  >
                    <div style={tplStrip} aria-hidden="true">
                      <span style={{ ...tplStripBand, background: deep }} />
                      <span style={{ ...tplStripBand, background: paper }} />
                      <span style={{ ...tplStripBand, background: gold }} />
                    </div>
                    <div style={tplBody}>
                      <div style={tplHead}>
                        <span style={tplName}>{row.name}</span>
                        <button
                          type="button"
                          className="adm-tpl-badge"
                          style={badgeStyle(row.badge)}
                          onClick={() => cycleBadge(row)}
                          disabled={mutating !== null}
                          title="Bấm để đổi nhãn"
                        >
                          {badgeLabel(row.badge)}
                        </button>
                      </div>
                      <span style={tplMeta}>
                        {row.style} · độ phổ biến {row.pop}
                      </span>
                      <div style={tplActions}>
                        <button
                          type="button"
                          className="adm-btn adm-btn-ghost"
                          style={tplBtn}
                          onClick={() => toggleHidden(row)}
                          disabled={mutating !== null}
                        >
                          {row.hidden ? "Hiện lại" : "Ẩn mẫu"}
                        </button>
                        <button
                          type="button"
                          className="adm-btn adm-btn-ghost"
                          style={tplBtn}
                          onClick={() => openEdit(row)}
                          disabled={mutating !== null}
                        >
                          Sửa
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <Pagination page={page} pageCount={pageCount} total={total} onPage={setPage} />
        </>
      )}

      {editing ? (
        <div className="adm-modal-scrim" onClick={() => setEditing(null)}>
          <div
            className="adm-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Sửa mẫu ${editing.name}`}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="adm-modal-title">Sửa mẫu thiệp</h2>
            <label style={field}>
              <span>Tên mẫu</span>
              <input
                style={fieldInput}
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                autoFocus
                maxLength={120}
              />
            </label>
            <label style={field}>
              <span>Phong cách</span>
              <select style={fieldInput} value={editStyle} onChange={(event) => setEditStyle(event.target.value)}>
                {TEMPLATE_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </label>
            <div className="adm-modal-actions">
              <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setEditing(null)} disabled={saving}>
                Huỷ
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={() => void saveEdit()}
                disabled={saving || !editName.trim()}
              >
                {saving ? "Đang lưu…" : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
