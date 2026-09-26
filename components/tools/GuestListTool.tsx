"use client";

import { useEffect, useRef, useState } from "react";
import { guestsToCsv, parseGuestsCsv, type GuestCsvRow } from "@/lib/csv";
import { GUEST_LIST_STORAGE_KEY, newGuestId, type GuestStatus, type LocalGuest } from "@/lib/tools/guestList";

// design/CC Danh Sach Khach.dc.html. Browser-only scratch list (not the backend guest manager); the seating tool
// reads the same localStorage key. CSV keeps the Studio import columns, so a file made here re-imports there.
function loadStored(): LocalGuest[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_LIST_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function persist(list: LocalGuest[]) {
  try {
    localStorage.setItem(GUEST_LIST_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // localStorage blocked (private mode, quota): the list still works for this session.
  }
}

const STATUS: Record<GuestStatus, string> = { pending: "Chưa trả lời", yes: "Tham dự", no: "Vắng mặt" };
type Detail = Pick<GuestCsvRow, "tableNo" | "phone" | "note"> & { expectedPax: string };

export function GuestListTool() {
  const [guests, setGuests] = useState<LocalGuest[] | null>(null);
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail>({ tableNo: "", phone: "", note: "", expectedPax: "1" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setGuests(loadStored()), []);
  const list = guests ?? [];
  const save = (next: LocalGuest[]) => {
    setGuests(next);
    persist(next);
  };

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    save([...list, { id: newGuestId(), household: name.trim(), groupName: group.trim(), tableNo: "", phone: "", expectedPax: 1, note: "", status: "pending" }]);
    setName("");
    setGroup("");
  }

  function openDetail(g: LocalGuest) {
    setEditing(editing === g.id ? null : g.id);
    setDetail({ tableNo: g.tableNo, phone: g.phone, note: g.note, expectedPax: String(g.expectedPax) });
  }
  function saveDetail(id: string) {
    const n = Number(detail.expectedPax.replace(/[^0-9]/g, ""));
    const expectedPax = Number.isFinite(n) ? Math.min(20, Math.max(0, n)) : 1;
    save(list.map((g) => (g.id === id ? { ...g, tableNo: detail.tableNo.trim(), phone: detail.phone.trim(), note: detail.note.trim(), expectedPax } : g)));
    setEditing(null);
  }

  function exportCsv() {
    if (list.length === 0) return;
    const url = URL.createObjectURL(new Blob([guestsToCsv(list.map((g) => ({ ...g, link: "" })))], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "danh-sach-khach.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(file: File) {
    setError("");
    setNotice("");
    try {
      const parsed = parseGuestsCsv(await file.text());
      const fileError = parsed.errors.find((e) => e.line === -1);
      if (fileError) return setError(fileError.message);
      const added: LocalGuest[] = parsed.rows.map((r) => ({ ...r, id: newGuestId(), status: "pending" }));
      if (added.length > 0) save([...list, ...added]);
      const skipped = parsed.errors.map((e) => `dòng ${e.line}: ${e.message}`);
      setNotice(`Đã thêm ${added.length} khách.${skipped.length ? ` Bỏ qua ${skipped.join("; ")}` : ""}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa đọc được file này, bạn thử lại nhé.");
    }
  }

  return (
    <>
      <div className="tool-titlebar">
        <h1>Danh sách khách</h1>
        <div>
          <button type="button" className="tool-outline" onClick={exportCsv} disabled={list.length === 0}>
            Xuất CSV
          </button>
          <label className="tool-outline">
            Nhập CSV
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void importFile(file);
              }}
            />
          </label>
        </div>
      </div>
      <p className="tool-meta">
        Lưu tự động trên máy của bạn ({list.length} khách · {list.filter((g) => g.status === "yes").length} đã xác nhận).
      </p>
      {error && (
        <p className="tool-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="tool-note" role="status">
          {notice}
        </p>
      )}
      <form className="tool-add" onSubmit={add}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên khách" aria-label="Tên khách" maxLength={80} />
        <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Nhóm (nhà trai, bạn bè…)" aria-label="Nhóm" maxLength={60} />
        <button type="submit" className="tool-add__btn">
          + Thêm khách
        </button>
      </form>
      {guests !== null && list.length === 0 && <div className="tool-empty">Chưa có khách nào, thêm khách đầu tiên ở trên.</div>}
      {list.length > 0 && (
        <div className="tool-guests">
          {list.map((g) => {
            const status = g.status ?? "pending";
            return (
              <div key={g.id}>
                <div className="tool-guests__row">
                  <span className="tool-guests__name">{g.household}</span>
                  <span className="tool-guests__group">{g.groupName || "Chưa phân nhóm"}</span>
                  <select
                    className={`tool-guests__status tool-guests__status--${status}`}
                    value={status}
                    aria-label={`Trạng thái của ${g.household}`}
                    onChange={(e) => save(list.map((x) => (x.id === g.id ? { ...x, status: e.target.value as GuestStatus } : x)))}
                  >
                    {Object.entries(STATUS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="tool-guests__link" title="Tạo thiệp trong Studio rồi thêm danh sách này vào tab Khách để lấy link riêng">link riêng ?g=… trong Studio</span>
                  <button type="button" className="tool-link" aria-expanded={editing === g.id} onClick={() => openDetail(g)}>
                    Chi tiết
                  </button>
                  <button type="button" className="tool-link tool-link--danger" onClick={() => save(list.filter((x) => x.id !== g.id))}>
                    Xoá
                  </button>
                </div>
                {editing === g.id && (
                  <div className="tool-guests__detail">
                    <label className="tool-field">
                      Bàn
                      <input className="input" value={detail.tableNo} maxLength={20} onChange={(e) => setDetail((d) => ({ ...d, tableNo: e.target.value }))} />
                    </label>
                    <label className="tool-field">
                      Số khách
                      <input className="input" value={detail.expectedPax} maxLength={2} inputMode="numeric" onChange={(e) => setDetail((d) => ({ ...d, expectedPax: e.target.value }))} />
                    </label>
                    <label className="tool-field">
                      Số điện thoại
                      <input className="input" value={detail.phone} maxLength={20} inputMode="tel" onChange={(e) => setDetail((d) => ({ ...d, phone: e.target.value }))} />
                    </label>
                    <label className="tool-field">
                      Ghi chú
                      <input className="input" value={detail.note} maxLength={300} onChange={(e) => setDetail((d) => ({ ...d, note: e.target.value }))} />
                    </label>
                    <button type="button" className="tool-add__btn" onClick={() => saveDetail(g.id)}>
                      Lưu
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
