"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, api, type AdminCardRow, type AdminList } from "@/lib/api";
import { BarChart } from "./BarChart.tsx";
import { ConfirmDialog } from "./ConfirmDialog.tsx";
import { Donut } from "./Donut.tsx";
import { EmptyState, ErrorState } from "./States.tsx";
import { FilterPills } from "./FilterPills.tsx";
import { Pagination } from "./Pagination.tsx";
import { SearchInput } from "./SearchInput.tsx";
import { Toast, type AdminToast } from "./Toast.tsx";

const PER_PAGE = 8;

const STATUS_LABEL: Record<AdminCardRow["status"], string> = {
  published: "Đã xuất bản",
  draft: "Bản nháp",
  reported: "Bị báo cáo",
};

// Donut colours mirror design/Admin Thiep Cuoi.dc.html via site tokens
// (design-system test forbids raw hex outside tokens.css).
const DONUT_COLOR: Record<AdminCardRow["status"], string> = {
  published: "var(--ok-fg)",
  draft: "var(--gold)",
  reported: "var(--accent)",
};

type StatusFilter = "all" | AdminCardRow["status"];

const PILLS: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "published", label: "Đã xuất bản" },
  { value: "draft", label: "Bản nháp" },
  { value: "reported", label: "Bị báo cáo" },
];

function formatDate(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return iso;
  return new Date(time).toLocaleDateString("vi-VN");
}

function messageOf(failure: unknown, fallback: string): string {
  return failure instanceof Error ? failure.message : fallback;
}

// Cards admin page (spec §6): status donut + top-template bars, filter pills +
// debounced search, 5-column table (Thiệp, Chủ TK, Trạng thái, Xác nhận, Hành
// động), pagination, toast with undo for reversible toggles and a blocking
// confirm for real deletes (no fake undo — deletes hit the DB).
export function CardsClient() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminList<AdminCardRow> | null>(null);
  const [counts, setCounts] = useState<Record<AdminCardRow["status"], number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<AdminToast | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminCardRow | null>(null);
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const toastId = useRef(0);

  const pushToast = useCallback((message: string, onUndo?: () => void) => {
    toastId.current += 1;
    setToast({ id: toastId.current, message, ...(onUndo ? { onUndo } : {}) });
  }, []);

  const load = useCallback(async () => {
    const gen = generation.current;
    setLoading(true);
    try {
      const [list, published, draft, reported] = await Promise.all([
        api.admin.listCards({ q: query || undefined, status, page, perPage: PER_PAGE }),
        api.admin.listCards({ q: query || undefined, status: "published", page: 1, perPage: 1 }),
        api.admin.listCards({ q: query || undefined, status: "draft", page: 1, perPage: 1 }),
        api.admin.listCards({ q: query || undefined, status: "reported", page: 1, perPage: 1 }),
      ]);
      if (generation.current !== gen) return; // a newer filter/search/page won
      setData(list);
      setCounts({ published: published.total, draft: draft.total, reported: reported.total });
      setError("");
    } catch (failure) {
      if (generation.current !== gen) return;
      if (failure instanceof ApiError && failure.status === 0) setError("Không kết nối được máy chủ.");
      else setError(messageOf(failure, "Chưa tải được danh sách thiệp."));
    } finally {
      if (generation.current === gen) setLoading(false);
    }
  }, [query, status, page]);

  useEffect(() => {
    generation.current += 1;
    void load();
  }, [load]);

  const mutateRow = useCallback(
    async (row: AdminCardRow, patch: { published?: boolean; is_flagged?: boolean }) => {
      try {
        const updated = await api.admin.patchCard(row.id, patch);
        setData((current) =>
          current ? { ...current, items: current.items.map((item) => (item.id === row.id ? updated : item)) } : current,
        );
        return updated;
      } catch (failure) {
        pushToast(messageOf(failure, "Chưa cập nhật được thiệp."));
        return null;
      }
    },
    [pushToast],
  );

  const togglePublish = useCallback(
    async (row: AdminCardRow) => {
      const next = row.status === "draft";
      const updated = await mutateRow(row, { published: next });
      if (!updated) return;
      pushToast(next ? `Đã xuất bản thiệp ${row.couple}` : `Đã ẩn xuất bản thiệp ${row.couple}`, () => {
        void mutateRow(updated, { published: !next }).then((reverted) => {
          if (reverted) {
            pushToast(next ? `Đã ẩn xuất bản thiệp ${row.couple}` : `Đã xuất bản thiệp ${row.couple}`);
            void load();
          }
        });
      });
      void load(); // refresh the status donut + totals from the server
    },
    [mutateRow, pushToast, load],
  );

  const clearReport = useCallback(
    async (row: AdminCardRow) => {
      const updated = await mutateRow(row, { is_flagged: false });
      if (updated) {
        pushToast(`Đã bỏ báo cáo cho thiệp ${row.couple}`);
        void load();
      }
    },
    [mutateRow, pushToast, load],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await api.admin.deleteCard(pendingDelete.id);
      setPendingDelete(null);
      pushToast(`Đã xoá thiệp ${pendingDelete.couple}`);
      // Deleting the last row of a page would leave an empty page behind.
      if (data && data.items.length === 1 && data.page > 1) setPage(data.page - 1);
      else {
        generation.current += 1;
        await load();
      }
    } catch (failure) {
      pushToast(messageOf(failure, "Chưa xoá được thiệp."));
    } finally {
      setBusy(false);
    }
  }, [pendingDelete, pushToast, load, data]);

  const pills = useMemo(
    () =>
      PILLS.map((pill) => ({
        value: pill.value,
        label: pill.label,
        ...(pill.value !== "all" && counts ? { count: counts[pill.value] } : {}),
      })),
    [counts],
  );

  const donutSegments = useMemo(() => {
    const source = counts ?? { published: 0, draft: 0, reported: 0 };
    return (Object.keys(STATUS_LABEL) as AdminCardRow["status"][]).map((key) => ({
      label: STATUS_LABEL[key],
      value: source[key],
      color: DONUT_COLOR[key],
    }));
  }, [counts]);

  // Top templates, aggregated client-side from the loaded page (§5 task brief:
  // API-side aggregation lives in the stats slice; V1 keeps this page to one
  // list fetch + three count fetches).
  const topTemplates = useMemo(() => {
    const byTemplate = new Map<string, { name: string; count: number }>();
    for (const item of data?.items ?? []) {
      const slot = byTemplate.get(item.templateId) ?? { name: item.templateName, count: 0 };
      slot.count += 1;
      byTemplate.set(item.templateId, slot);
    }
    return [...byTemplate.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((entry) => ({ label: entry.name, value: entry.count }));
  }, [data]);

  const onSearch = useCallback((_q: string, _signal: AbortSignal) => {
    setQuery(_q);
    setPage(1);
  }, []);

  return (
    <div>
      <p className="adm-sub">QUẢN TRỊ · THIỆP CƯỚI</p>
      <h1 className="adm-h1">Thiệp cưới{data ? ` (${data.total})` : ""}</h1>
      <p className="adm-sub">
        {loading && !data ? "Đang tải…" : `${data?.total ?? 0} thiệp · trang ${data?.page ?? page}`}
      </p>

      <div className="adm-grid-2">
        <section className="adm-card" aria-label="Trạng thái thiệp">
          <h2 className="adm-card-title">Trạng thái</h2>
          <Donut segments={donutSegments} ariaLabel="Phân bố trạng thái thiệp" />
        </section>
        <section className="adm-card" aria-label="Mẫu được dùng nhiều nhất">
          <h2 className="adm-card-title">Mẫu được dùng nhiều nhất</h2>
          {topTemplates.length > 0 ? (
            <BarChart data={topTemplates} ariaLabel="Top mẫu thiệp trong trang hiện tại" />
          ) : (
            <p className="adm-sub">Chưa có dữ liệu.</p>
          )}
        </section>
      </div>

      <div className="adm-toolbar">
        <FilterPills
          options={pills}
          active={status}
          onChange={(value) => {
            setStatus(value as StatusFilter);
            setPage(1);
          }}
          ariaLabel="Lọc theo trạng thái"
        />
        <SearchInput placeholder="Tìm theo tên hoặc mẫu…" onSearch={onSearch} ariaLabel="Tìm thiệp" />
      </div>

      {error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            generation.current += 1;
            void load();
          }}
        />
      ) : !data || data.items.length === 0 ? (
        loading ? null : (
          <EmptyState title="Không có thiệp nào khớp." hint="Thử đổi bộ lọc hoặc từ khoá khác." />
        )
      ) : (
        <>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">Thiệp</th>
                  <th scope="col">Chủ tài khoản</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Xác nhận</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="adm-cell-main">{row.couple}</div>
                      <div className="adm-cell-sub">
                        {row.templateName} · {formatDate(row.createdAt)}
                      </div>
                    </td>
                    <td title={row.ownerEmail}>{row.ownerEmail}</td>
                    <td>
                      <span className={`adm-status adm-status-${row.status}`}>{STATUS_LABEL[row.status]}</span>
                    </td>
                    <td>{row.confirmed}</td>
                    <td>
                      <div className="adm-actions">
                        <a className="adm-btn adm-btn-ghost" href={`/invite/${encodeURIComponent(row.slug)}`}>
                          Xem
                        </a>
                        <button
                          type="button"
                          className="adm-btn adm-btn-ghost"
                          onClick={() => void togglePublish(row)}
                        >
                          {row.status === "draft" ? "Xuất bản" : "Ẩn"}
                        </button>
                        {row.status === "reported" ? (
                          <button
                            type="button"
                            className="adm-btn adm-btn-ghost"
                            onClick={() => void clearReport(row)}
                          >
                            Bỏ báo cáo
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="adm-btn adm-btn-ghost"
                          onClick={() => setPendingDelete(row)}
                        >
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pageCount={data.pageCount} total={data.total} onPage={setPage} />
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Xoá thiệp này?"
        message={
          pendingDelete
            ? `Thiệp “${pendingDelete.couple}” và toàn bộ danh sách khách, RSVP, lời chúc sẽ bị xoá vĩnh viễn.`
            : ""
        }
        confirmLabel="Xoá thiệp"
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!busy) setPendingDelete(null);
        }}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
