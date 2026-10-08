"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type AdminList, type AdminUserRow } from "@/lib/api";
import {
  BarChart,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FilterPills,
  Pagination,
  SearchInput,
  StatCard,
  Toast,
  adminInitials,
  type AdminToast,
  type BarDatum,
} from "./index.ts";

type UsersResponse = AdminList<AdminUserRow> & {
  weekly: number[];
  summary: { total: number; active: number; suspended: number; cards: number };
};

const PER_PAGE = 8;

const STATUS_PILLS = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Hoạt động" },
  { value: "suspended", label: "Đã khoá" },
] as const;

function weekLabel(index: number, weeks: number): string {
  const date = new Date();
  date.setDate(date.getDate() - (weeks - 1 - index) * 7);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function formatJoined(iso: string): string {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "—";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(time));
}

function errorMessage(failure: unknown): string {
  return failure instanceof Error ? failure.message : "Có lỗi xảy ra, bạn thử lại nhé.";
}

// Users content for /admin/users (design/Admin Nguoi Dung.dc.html). The panel
// layout owns <AdminShell> (sidebar + logout) and the admin name, so this
// component renders content only. A 401/403 on the data fetch still bounces to
// /admin/login in case the session expires mid-use.
export function UsersClient() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<AdminToast | null>(null);
  const [confirm, setConfirm] = useState<{ row: AdminUserRow; busy: boolean } | null>(null);
  const [mutating, setMutating] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async (query: string, filter: string, targetPage: number, signal?: AbortSignal) => {
    const mine = ++requestId.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        status: filter,
        page: String(targetPage),
        perPage: String(PER_PAGE),
      });
      const res = await fetch(`/api/admin/users?${params}`, { cache: "no-store", signal });
      if (!res.ok) {
        let message = `Lỗi ${res.status}`;
        try {
          const body = await res.json();
          if (typeof body.detail === "string" && body.detail) message = body.detail;
        } catch { /* non-JSON error body */ }
        throw new ApiError(res.status, message);
      }
      const body = (await res.json()) as UsersResponse;
      if (signal?.aborted || requestId.current !== mine) return;
      setData(body);
      setPage(body.page);
      setError("");
    } catch (failure) {
      if (failure instanceof DOMException && failure.name === "AbortError") return;
      if (requestId.current !== mine) return;
      if (failure instanceof ApiError && (failure.status === 401 || failure.status === 403)) {
        router.replace("/admin/login");
        return;
      }
      setError(errorMessage(failure));
    } finally {
      if (requestId.current === mine) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load(q, status, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, page]);

  const flash = (message: string, onUndo?: () => void) =>
    setToast({ id: Date.now(), message, ...(onUndo ? { onUndo } : {}) });

  async function toggleStatus(row: AdminUserRow) {
    const action = row.status === "active" ? "ban" : "unban";
    setMutating(row.id);
    try {
      const updated = await api.admin.patchUser(row.id, action);
      setData((prev) => prev && {
        ...prev,
        items: prev.items.map((item) => (item.id === row.id ? { ...item, status: updated.status } : item)),
        summary: action === "ban"
          ? { ...prev.summary, active: prev.summary.active - 1, suspended: prev.summary.suspended + 1 }
          : { ...prev.summary, active: prev.summary.active + 1, suspended: prev.summary.suspended - 1 },
      });
      flash(
        action === "ban" ? `Đã khoá tài khoản ${row.name}` : `Đã mở khoá tài khoản ${row.name}`,
        () => { void toggleStatus({ ...row, status: updated.status }); },
      );
    } catch (failure) {
      flash(errorMessage(failure));
    } finally {
      setMutating(null);
    }
  }

  async function removeUser() {
    if (!confirm) return;
    const row = confirm.row;
    setConfirm({ row, busy: true });
    try {
      await api.admin.deleteUser(row.id);
      setData((prev) => {
        if (!prev) return prev;
        const items = prev.items.filter((item) => item.id !== row.id);
        return {
          ...prev,
          items,
          total: Math.max(0, prev.total - 1),
          summary: {
            ...prev.summary,
            total: Math.max(0, prev.summary.total - 1),
            active: row.status === "active" ? prev.summary.active - 1 : prev.summary.active,
            suspended: row.status === "suspended" ? prev.summary.suspended - 1 : prev.summary.suspended,
            cards: Math.max(0, prev.summary.cards - row.inviteCount),
          },
        };
      });
      setConfirm(null);
      flash(`Đã xoá tài khoản ${row.name}`);
      if (data && data.items.length === 1 && data.page > 1) setPage(data.page - 1);
    } catch (failure) {
      setConfirm({ row, busy: false });
      flash(errorMessage(failure));
    }
  }

  const summary = data?.summary;
  const bars: readonly BarDatum[] = (data?.weekly ?? []).map((value, index, arr) => ({
    label: weekLabel(index, arr.length),
    value,
  }));
  const avgCards = summary && summary.total > 0 ? (summary.cards / summary.total).toFixed(1) : "0";

  return (
    <>
      <p className="adm-sub" style={{ marginBottom: 6 }}>QUẢN TRỊ · NGƯỜI DÙNG</p>
      <h1 className="adm-h1">Người dùng{summary ? ` (${summary.total})` : ""}</h1>
      <p className="adm-sub">Khoá, mở khoá và xoá tài khoản. Xoá là vĩnh viễn — hãy xác nhận trước khi xoá.</p>

      <div className="adm-grid-2">
        <section className="adm-card" aria-label="Người dùng mới theo tuần">
          <h2 className="adm-card-title">Người dùng mới theo tuần</h2>
          <BarChart data={bars} ariaLabel="Biểu đồ người dùng mới 8 tuần gần nhất" />
        </section>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", alignContent: "start" }}>
          <StatCard label="Đang hoạt động" value={summary?.active ?? "—"} />
          <StatCard label="Đã khoá" value={summary?.suspended ?? "—"} />
          <StatCard label="Tổng số thiệp" value={summary?.cards ?? "—"} />
          <StatCard label="TB thiệp / người" value={avgCards} />
        </div>
      </div>

      <div className="adm-toolbar">
        <FilterPills
          options={STATUS_PILLS.map((p) => ({ ...p }))}
          active={status}
          ariaLabel="Lọc theo trạng thái"
          onChange={(value) => { setStatus(value); setPage(1); }}
        />
        <SearchInput
          placeholder="Tìm theo tên hoặc email…"
          ariaLabel="Tìm người dùng theo tên hoặc email"
          onSearch={(value, signal) => {
            setPage(1);
            setQ(value);
            void load(value, status, 1, signal);
          }}
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => load(q, status, page)} />
      ) : loading && !data ? (
        <p className="adm-sub" aria-busy="true">Đang tải danh sách người dùng…</p>
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="Không có người dùng nào khớp." hint="Thử đổi từ khoá hoặc bộ lọc trạng thái." />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Người dùng</th>
                <th scope="col">Ngày tham gia</th>
                <th scope="col">Số thiệp</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span style={{ display: "flex", gap: "10px", alignItems: "center", minWidth: 0 }}>
                      {row.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.avatarUrl}
                          alt=""
                          width={32}
                          height={32}
                          style={{ width: 32, height: 32, borderRadius: "50%", flex: "none", objectFit: "cover" }}
                        />
                      ) : (
                        <span className="adm-avatar" aria-hidden="true">{adminInitials(row.name)}</span>
                      )}
                      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span className="adm-cell-main">{row.name}</span>
                        <span className="adm-cell-sub">{row.email}</span>
                      </span>
                    </span>
                  </td>
                  <td>{formatJoined(row.createdAt)}</td>
                  <td><span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17 }}>{row.inviteCount}</span></td>
                  <td>
                    <span className={row.status === "active" ? "adm-status adm-status-active" : "adm-status adm-status-suspended"}>
                      {row.status === "active" ? "Hoạt động" : "Đã khoá"}
                    </span>
                  </td>
                  <td>
                    <span className="adm-actions">
                      <button
                        type="button"
                        className="adm-btn adm-btn-ghost"
                        disabled={mutating === row.id}
                        onClick={() => toggleStatus(row)}
                      >
                        {row.status === "active" ? "Khoá" : "Mở khoá"}
                      </button>
                      <button
                        type="button"
                        className="adm-btn adm-btn-ghost"
                        style={{ color: "var(--accent)" }}
                        disabled={mutating === row.id}
                        onClick={() => setConfirm({ row, busy: false })}
                      >
                        Xoá
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > 0 ? (
        <Pagination page={data.page} pageCount={data.pageCount} total={data.total} onPage={setPage} />
      ) : null}

      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmDialog
        open={confirm !== null}
        title="Xoá tài khoản này?"
        message={confirm ? `Tài khoản ${confirm.row.name} (${confirm.row.email}) sẽ bị xoá vĩnh viễn và không thể hoàn tác.` : ""}
        confirmLabel="Xoá vĩnh viễn"
        busy={confirm?.busy ?? false}
        onConfirm={removeUser}
        onCancel={() => { if (!confirm?.busy) setConfirm(null); }}
      />
    </>
  );
}
