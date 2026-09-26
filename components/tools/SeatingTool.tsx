"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BOM, toCsv } from "@/lib/csv";
import { GUEST_LIST_STORAGE_KEY, newGuestId, type LocalGuest } from "@/lib/tools/guestList";
import { assignGuest, countByTable, unassignGuest, unassignedGuestIds, SEATING_STORAGE_KEY, type Assignments, type Table } from "@/lib/tools/seating";

// Đọc/ghi cùng khoá localStorage với GuestListTool (moc:tools:guest-list) — xem lib/tools/guestList.ts.
function loadGuests(): LocalGuest[] {
  try {
    const raw = localStorage.getItem(GUEST_LIST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveGuests(list: LocalGuest[]) {
  try {
    localStorage.setItem(GUEST_LIST_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // vô hại: chỉ mất khả năng nhớ lại lần sau, danh sách vẫn dùng được trong phiên này.
  }
}

type Seating = { tables: Table[]; assignments: Assignments };
function loadSeating(): Seating {
  try {
    const raw = localStorage.getItem(SEATING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      tables: Array.isArray(parsed?.tables) ? parsed.tables : [],
      assignments: parsed?.assignments && typeof parsed.assignments === "object" ? parsed.assignments : {},
    };
  } catch {
    return { tables: [], assignments: {} };
  }
}
function saveSeating(s: Seating) {
  try {
    localStorage.setItem(SEATING_STORAGE_KEY, JSON.stringify(s));
  } catch {
    // vô hại, xem loadGuests().
  }
}

const UNASSIGNED_ZONE = "__unassigned__";
const DRAG_THRESHOLD = 6; // px trước khi coi là kéo thay vì chạm/bấm

export function SeatingTool() {
  // Bắt đầu rỗng (không phải null + màn "Đang tải…") để khớp hệt bản SSR — localStorage chỉ đọc được ở
  // client nên vẫn cần useEffect, nhưng tránh cả trang nhảy bố cục lớn lúc mount (bài học CLS ở đợt 4a).
  const [guests, setGuests] = useState<LocalGuest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [newGuestName, setNewGuestName] = useState("");
  const [tableForm, setTableForm] = useState({ name: "", capacity: "8" });
  const [notice, setNotice] = useState("");
  const [drag, setDrag] = useState<{ guestId: string; x: number; y: number } | null>(null);
  const dragInfo = useRef<{ guestId: string; startX: number; startY: number; moved: boolean } | null>(null);

  useEffect(() => {
    setGuests(loadGuests());
    const s = loadSeating();
    // First visit: start with the design's six tables of eight, so the page is usable immediately.
    setTables(s.tables.length > 0 ? s.tables : Array.from({ length: 6 }, (_, i) => ({ id: newGuestId() + i, name: `Bàn ${i + 1}`, capacity: 8 })));
    setAssignments(s.assignments);
  }, []);

  function persistSeating(nextTables: Table[], nextAssignments: Assignments) {
    setTables(nextTables);
    setAssignments(nextAssignments);
    saveSeating({ tables: nextTables, assignments: nextAssignments });
  }

  function addGuest() {
    const household = newGuestName.trim();
    if (!household) return;
    const row: LocalGuest = { id: newGuestId(), household, groupName: "", tableNo: "", phone: "", expectedPax: 1, note: "" };
    const next = [row, ...guests];
    setGuests(next);
    saveGuests(next);
    setNewGuestName("");
  }

  function addTable() {
    const name = tableForm.name.trim() || `Bàn ${tables.length + 1}`;
    const capacity = Math.min(30, Math.max(1, Number(tableForm.capacity.replace(/[^0-9]/g, "")) || 8));
    persistSeating([...tables, { id: newGuestId(), name, capacity }], assignments);
    setTableForm({ name: "", capacity: "8" });
  }

  function removeTable(tableId: string) {
    const rest = { ...assignments };
    for (const gid of Object.keys(rest)) if (rest[gid] === tableId) delete rest[gid];
    persistSeating(
      tables.filter((t) => t.id !== tableId),
      rest,
    );
  }

  function tryAssign(guestId: string, tableId: string) {
    const next = assignGuest(assignments, guestId, tableId, tables);
    if (!next) {
      setNotice("Bàn đã đủ chỗ, chọn bàn khác hoặc tăng sức chứa.");
      return;
    }
    setNotice("");
    persistSeating(tables, next);
  }
  function tryUnassign(guestId: string) {
    persistSeating(tables, unassignGuest(assignments, guestId));
  }

  // ---- chọn-rồi-bấm: cách không cần kéo, dùng được bằng bàn phím/trợ năng ----
  function onGuestClick(guestId: string) {
    setSelectedGuest((cur) => (cur === guestId ? null : guestId));
  }
  function onTableClick(tableId: string) {
    if (selectedGuest) {
      tryAssign(selectedGuest, tableId);
      setSelectedGuest(null);
    }
  }
  function onUnassignedZoneClick() {
    if (selectedGuest) {
      tryUnassign(selectedGuest);
      setSelectedGuest(null);
    }
  }

  // ---- kéo-thả bằng Pointer Events (chuột lẫn cảm ứng) ----
  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>, guestId: string) {
    dragInfo.current = { guestId, startX: e.clientX, startY: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    const info = dragInfo.current;
    if (!info) return;
    const dx = e.clientX - info.startX;
    const dy = e.clientY - info.startY;
    if (!info.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) info.moved = true;
    if (info.moved) setDrag({ guestId: info.guestId, x: e.clientX, y: e.clientY });
  }
  function onPointerUp(e: ReactPointerEvent<HTMLButtonElement>) {
    const info = dragInfo.current;
    dragInfo.current = null;
    if (!info || !info.moved) {
      setDrag(null);
      return; // không phải kéo — để onClick tự nhiên xử lý (chọn/bỏ chọn)
    }
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const tableEl = under?.closest<HTMLElement>("[data-table-id]");
    const unassignedEl = under?.closest<HTMLElement>("[data-unassign]");
    if (tableEl) tryAssign(info.guestId, tableEl.dataset.tableId!);
    else if (unassignedEl) tryUnassign(info.guestId);
    setDrag(null);
    // Kéo thật xong thì bỏ qua click theo sau (trình duyệt vẫn bắn click sau pointerup) để không chọn nhầm.
    setSelectedGuest(null);
  }

  function exportCsv() {
    if (guests.length === 0) return;
    const rows = [["ho_gia_dinh", "ban"], ...guests.map((g) => [g.household, tables.find((t) => t.id === assignments[g.id])?.name ?? ""])];
    const csv = BOM + toCsv(rows);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "so-do-cho-ngoi.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const guestIds = guests.map((g) => g.id);
  const unassigned = unassignedGuestIds(guestIds, assignments);
  const counts = countByTable(assignments);
  const byId = new Map(guests.map((g) => [g.id, g] as const));

  const chip = (id: string, seated: boolean) => (
    <button
      key={id}
      type="button"
      className="tool-seat-guest"
      aria-pressed={selectedGuest === id}
      onPointerDown={(e) => onPointerDown(e, id)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={(e) => {
        if (seated) e.stopPropagation();
        onGuestClick(id);
      }}
    >
      {byId.get(id)?.household}
    </button>
  );

  // design/CC So Do Cho Ngoi.dc.html: unassigned list on the left, table cards on the right.
  return (
    <>
      {notice && (
        <p className="tool-error" role="alert">
          {notice}
        </p>
      )}
      <div className="tool-seating">
        <div className="tool-seating__side">
          <h3>Khách chưa xếp bàn</h3>
          <div className="tool-seating__pool" data-unassign="true" onClick={onUnassignedZoneClick}>
            {unassigned.map((id) => chip(id, false))}
            {guests.length > 0 && unassigned.length === 0 && <span className="tool-note">Mọi khách đã có bàn.</span>}
            {guests.length === 0 && (
              <span className="tool-note">
                Chưa có khách. Thêm nhanh bên dưới, hoặc nhập cả loạt ở <a href="/cong-cu/danh-sach-khach">Danh sách khách</a>.
              </span>
            )}
          </div>
          <form
            className="tool-seating__add"
            onSubmit={(e) => {
              e.preventDefault();
              addGuest();
            }}
          >
            <input className="input" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} maxLength={80} placeholder="Thêm khách…" aria-label="Tên khách mới" />
            <button type="submit" className="tool-copy" disabled={!newGuestName.trim()}>
              Thêm
            </button>
          </form>
          {guests.length > 0 && (
            <button type="button" className="tool-copy" onClick={exportCsv}>
              Xuất CSV (khách + bàn)
            </button>
          )}
        </div>
        <div className="tool-seating__tables">
          {tables.map((t) => {
            const occupantIds = guestIds.filter((id) => assignments[id] === t.id);
            return (
              <div key={t.id} className="tool-seat-table" data-table-id={t.id} data-armed={selectedGuest !== null} onClick={() => onTableClick(t.id)}>
                <div className="tool-seat-table__head">
                  <strong>{t.name}</strong>
                  <span>
                    {occupantIds.length}/{t.capacity}
                  </span>
                </div>
                {occupantIds.map((id) => (
                  <div className="tool-seat-table__seat" key={id}>
                    {chip(id, true)}
                    <button
                      type="button"
                      aria-label={`Bỏ ${byId.get(id)?.household} khỏi ${t.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        tryUnassign(id);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="tool-link tool-seat-table__remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTable(t.id);
                  }}
                >
                  Xoá bàn
                </button>
              </div>
            );
          })}
          <form
            className="tool-seat-table tool-seat-table--new"
            onSubmit={(e) => {
              e.preventDefault();
              addTable();
            }}
          >
            <input className="input" value={tableForm.name} onChange={(e) => setTableForm((f) => ({ ...f, name: e.target.value }))} maxLength={20} placeholder={`Bàn ${tables.length + 1}`} aria-label="Tên bàn mới" />
            <input className="input" value={tableForm.capacity} onChange={(e) => setTableForm((f) => ({ ...f, capacity: e.target.value }))} inputMode="numeric" maxLength={2} aria-label="Sức chứa" />
            <button type="submit" className="tool-copy">
              + Thêm bàn
            </button>
          </form>
        </div>
      </div>
      {drag && (
        <div className="tool-seat-guest tool-seat-guest--ghost" style={{ left: drag.x + 12, top: drag.y + 12 }} aria-hidden="true">
          {byId.get(drag.guestId)?.household}
        </div>
      )}
    </>
  );
}
