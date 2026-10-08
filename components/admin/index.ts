// Shared admin UI kit (spec §6). Slices import from here; the panel layout
// (app/admin/(panel)/layout.tsx) must import "./admin.css" once — Next.js
// only allows global CSS imports from server layouts/pages.
export { AdminShell } from "./AdminShell.tsx";
export type { AdminShellProps } from "./AdminShell.tsx";
export { AdminFrame } from "./AdminFrame.tsx";
export { AdminSidebar, ADMIN_NAV, adminInitials } from "./AdminSidebar.tsx";
export type { AdminNavKey, AdminSidebarProps } from "./AdminSidebar.tsx";
export { StatCard } from "./StatCard.tsx";
export type { StatCardProps, StatDelta } from "./StatCard.tsx";
export { BarChart } from "./BarChart.tsx";
export type { BarDatum } from "./BarChart.tsx";
export { Donut } from "./Donut.tsx";
export type { DonutSegment } from "./Donut.tsx";
export { FilterPills } from "./FilterPills.tsx";
export type { FilterPillsProps, PillOption } from "./FilterPills.tsx";
export { SearchInput } from "./SearchInput.tsx";
export type { SearchInputProps } from "./SearchInput.tsx";
export { Pagination } from "./Pagination.tsx";
export type { PaginationProps } from "./Pagination.tsx";
export { Toast } from "./Toast.tsx";
export type { AdminToast, ToastProps } from "./Toast.tsx";
export { ConfirmDialog } from "./ConfirmDialog.tsx";
export type { ConfirmDialogProps } from "./ConfirmDialog.tsx";
export { EmptyState, ErrorState } from "./States.tsx";
export type { EmptyStateProps, ErrorStateProps } from "./States.tsx";
