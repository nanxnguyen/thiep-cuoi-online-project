import type { GuestCsvRow } from "../csv.ts";

// Shared shape between /cong-cu/danh-sach-khach (GuestListTool) and /cong-cu/so-do-cho-ngoi (seating tool) —
// both are browser-only, localStorage-backed scratch pads (not the Phase 3 BE guest manager). Kept here so
// the storage key and row shape have a single source of truth instead of drifting between the two tools.
export const GUEST_LIST_STORAGE_KEY = "moc:tools:guest-list";
// `status` is the design's RSVP marker (design/CC Danh Sach Khach). It lives in localStorage only; the CSV keeps the
// Studio import format so a file made here still re-imports there.
export type GuestStatus = "pending" | "yes" | "no";
export type LocalGuest = GuestCsvRow & { id: string; status?: GuestStatus };
export const newGuestId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
