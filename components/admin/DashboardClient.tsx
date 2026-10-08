"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiError, api, type AdminStats } from "@/lib/api";
import { getTemplate } from "@/lib/templates";
import {
  BarChart,
  Donut,
  EmptyState,
  ErrorState,
  StatCard,
  adminInitials,
  type StatDelta,
} from "./index.ts";

const STATUS_LABEL: Record<AdminStats["recentCards"][number]["status"], string> = {
  published: "Đã xuất bản",
  draft: "Bản nháp",
  reported: "Bị báo cáo",
};

function formatDay(iso: string): string {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function weekDelta(value: number): StatDelta {
  return value > 0 ? { text: `+${value} tuần này`, tone: "up" } : { text: "Không tăng", tone: "flat" };
}

// Dashboard content (spec §6): greeting + date, 4 StatCards, weekly bars +
// status donut, 2 recent lists. The panel layout owns <AdminShell> (sidebar +
// logout); the admin name arrives via props from the server page so this
// component never calls /api/admin/me itself. No admin.css import: the panel
// layout owns it.
export function DashboardClient({ adminName }: { adminName: string }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStats(await api.admin.stats());
    } catch (failure) {
      if (failure instanceof ApiError && (failure.status === 401 || failure.status === 403)) {
        window.location.href = "/admin/login";
        return;
      }
      setError(failure instanceof Error ? failure.message : "Chưa tải được tổng quan, bạn thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const firstName = adminName.trim().split(" ")[0] || "quản trị viên";
  const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.18em", color: "var(--gold-deep)", fontWeight: 600 }}>
            QUẢN TRỊ · TỔNG QUAN
          </div>
          <h1 className="adm-h1" style={{ marginTop: 6 }}>Chào, {firstName}</h1>
        </div>
        <span style={{ fontSize: 13, color: "var(--faint)" }}>{today}</span>
      </div>

      {loading && !stats ? (
        <p role="status" aria-busy="true" className="adm-sub">Đang tải tổng quan…</p>
      ) : error && !stats ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : stats ? (
        <>
          <div className="adm-grid-kpi">
            <StatCard
              label="Tổng người dùng"
              value={stats.users.total}
              sub={`${stats.users.suspended} tài khoản bị khoá`}
              delta={weekDelta(stats.usersWeekly[7] ?? 0)}
              spark={stats.usersWeekly}
            />
            <StatCard
              label="Tổng số thiệp"
              value={stats.cards.total}
              sub={`${stats.cards.draft} bản nháp`}
              delta={weekDelta(stats.cardsWeekly[7] ?? 0)}
              spark={stats.cardsWeekly}
            />
            <StatCard
              label="Đã xuất bản"
              value={stats.cards.published}
              sub={stats.cards.total > 0 ? `${Math.round((stats.cards.published / stats.cards.total) * 100)}% tổng số thiệp` : "Chưa có thiệp nào"}
            />
            <StatCard
              label="Lời chúc cần duyệt"
              value={stats.pendingWishes}
              sub="Chờ quản trị viên duyệt"
              delta={stats.pendingWishes > 0 ? { text: "Cần xử lý", tone: "flat" } : undefined}
            />
          </div>

          <div className="adm-grid-2">
            <section className="adm-card" aria-label="Thiệp tạo mới theo tuần">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                <h2 className="adm-card-title" style={{ margin: 0 }}>Thiệp tạo mới theo tuần</h2>
                <span style={{ fontSize: 12, color: "var(--faint)" }}>8 tuần gần nhất</span>
              </div>
              <BarChart
                ariaLabel="Thiệp tạo mới theo tuần, 8 tuần gần nhất"
                data={stats.cardsWeekly.map((value, i) => ({ label: `T${i + 1}`, value }))}
              />
            </section>
            <section className="adm-card" aria-label="Trạng thái thiệp">
              <h2 className="adm-card-title">Trạng thái thiệp</h2>
              <Donut
                ariaLabel={`Trạng thái thiệp: ${stats.cards.published} đã xuất bản, ${stats.cards.draft} bản nháp, ${stats.cards.flagged} bị báo cáo`}
                segments={[
                  { label: "Đã xuất bản", value: stats.cards.published, color: "var(--ok-fg)" },
                  { label: "Bản nháp", value: stats.cards.draft, color: "var(--gold)" },
                  { label: "Bị báo cáo", value: stats.cards.flagged, color: "var(--accent)" },
                ]}
              />
            </section>
          </div>

          <div className="adm-grid-2">
            <section className="adm-card" aria-label="Người dùng mới">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <h2 className="adm-card-title" style={{ margin: 0 }}>Người dùng mới</h2>
                <Link href="/admin/users" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>
                  Xem tất cả →
                </Link>
              </div>
              {stats.recentUsers.length ? (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {stats.recentUsers.map((user) => (
                    <li
                      key={user.id}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid var(--line)" }}
                    >
                      <span className="adm-avatar" aria-hidden="true">{adminInitials(user.name)}</span>
                      <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user.name}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user.email}
                        </span>
                      </span>
                      <span style={{ fontSize: 12, color: "var(--faint)", flex: "none" }}>{formatDay(user.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="Chưa có người dùng" hint="Tài khoản đăng ký mới sẽ hiện ở đây." />
              )}
            </section>
            <section className="adm-card" aria-label="Thiệp gần đây">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <h2 className="adm-card-title" style={{ margin: 0 }}>Thiệp gần đây</h2>
                <Link href="/admin/cards" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>
                  Xem tất cả →
                </Link>
              </div>
              {stats.recentCards.length ? (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {stats.recentCards.map((card) => (
                    <li
                      key={card.id}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid var(--line)" }}
                    >
                      <span className={`adm-status adm-status-${card.status}`} style={{ flex: "none" }}>
                        {STATUS_LABEL[card.status]}
                      </span>
                      <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {card.couple}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--faint)" }}>
                          {getTemplate(card.templateId)?.name ?? card.templateId}
                        </span>
                      </span>
                      <span style={{ fontSize: 12, color: "var(--faint)", flex: "none" }}>{formatDay(card.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="Chưa có thiệp" hint="Thiệp mới tạo hoặc cập nhật sẽ hiện ở đây." />
              )}
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}
