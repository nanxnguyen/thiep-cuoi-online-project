"use client";

export type PaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  onPage: (page: number) => void;
};

export function Pagination({ page, pageCount, total, onPage }: PaginationProps) {
  const last = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), last);
  return (
    <nav className="adm-pager" aria-label="Phân trang">
      <span className="adm-pager-info">
        Trang {current}/{last} · {total} mục
      </span>
      <span className="adm-pager-btns">
        <button
          type="button"
          className="adm-btn adm-btn-ghost"
          disabled={current <= 1}
          onClick={() => onPage(current - 1)}
        >
          ← Trước
        </button>
        <button
          type="button"
          className="adm-btn adm-btn-ghost"
          disabled={current >= last}
          onClick={() => onPage(current + 1)}
        >
          Sau →
        </button>
      </span>
    </nav>
  );
}
