"use client";

import { useEffect, useRef, useState } from "react";
import { AddButton, Glyph, IconButton, PanelSection, TextField, useListFocus } from "@/components/studio/fields";
import { guestsToCsv, parseGuestsCsv, type GuestCsvRow } from "@/lib/csv";
import { GUEST_LIST_STORAGE_KEY, newGuestId, type LocalGuest } from "@/lib/tools/guestList";

// Standalone, browser-only guest list — NOT the Phase 3 guest manager (which has a backend, an
// invitation and personal ?g= links). This is a scratch pad for people who don't have a thiệp yet, or
// want an offline list; it shares no storage or API with Phase 3. Export uses the same lib/csv.ts
// column format Studio's importer reads, so a file made here can be re-imported there. The seating
// chart tool (/cong-cu/so-do-cho-ngoi) reads this same localStorage key — see lib/tools/guestList.ts.
function loadStored(): LocalGuest[] {
  try {
    const raw = localStorage.getItem(GUEST_LIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(list: LocalGuest[]) {
  try {
    localStorage.setItem(GUEST_LIST_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // localStorage bị chặn (chế độ riêng tư, hết hạn mức) — danh sách vẫn dùng được trong phiên này, chỉ không nhớ lại lần sau.
  }
}

type Form = { household: string; groupName: string; tableNo: string; phone: string; expectedPax: string; note: string };
const blankForm = (): Form => ({ household: "", groupName: "", tableNo: "", phone: "", expectedPax: "1", note: "" });
const formFrom = (g: LocalGuest): Form => ({ household: g.household, groupName: g.groupName, tableNo: g.tableNo, phone: g.phone, expectedPax: String(g.expectedPax), note: g.note });

export function GuestListTool() {
  const [guests, setGuests] = useState<LocalGuest[] | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Form>(blankForm());
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importReport, setImportReport] = useState<{ added: number; problems: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const focus = useListFocus<HTMLOListElement>();

  useEffect(() => {
    setGuests(loadStored());
  }, []);

  function save(next: LocalGuest[]) {
    setGuests(next);
    persist(next);
  }

  function startAdd() {
    setForm(blankForm());
    setError("");
    setEditingId("new");
  }
  function startEdit(g: LocalGuest) {
    setForm(formFrom(g));
    setError("");
    setEditingId(g.id);
  }

  function pax(): number {
    const n = Number(form.expectedPax.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) ? Math.min(20, Math.max(0, n)) : 1;
  }

  function submitForm() {
    if (!form.household.trim()) {
      setError("Tên hộ/nhóm không được để trống.");
      return;
    }
    setError("");
    const row: GuestCsvRow = { household: form.household.trim(), groupName: form.groupName.trim(), tableNo: form.tableNo.trim(), phone: form.phone.trim(), expectedPax: pax(), note: form.note.trim() };
    const current = guests ?? [];
    if (editingId === "new") {
      save([{ ...row, id: newGuestId() }, ...current]);
    } else if (editingId) {
      save(current.map((g) => (g.id === editingId ? { ...row, id: g.id } : g)));
    }
    setEditingId(null);
  }

  function remove(id: string) {
    save((guests ?? []).filter((g) => g.id !== id));
    setConfirmId(null);
  }

  function exportCsv() {
    if (!guests || guests.length === 0) return;
    const csv = guestsToCsv(guests.map((g) => ({ ...g, link: "" })));
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "danh-sach-khach.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(file: File) {
    setImportBusy(true);
    setImportReport(null);
    setError("");
    try {
      const text = await file.text();
      const parsed = parseGuestsCsv(text);
      const fileError = parsed.errors.find((e) => e.line === -1);
      if (fileError) {
        setError(fileError.message);
        return;
      }
      const problems = parsed.errors.map((e) => `Dòng ${e.line}: ${e.message}`);
      const added: LocalGuest[] = parsed.rows.map((r) => ({ id: newGuestId(), household: r.household, groupName: r.groupName, tableNo: r.tableNo, phone: r.phone, expectedPax: r.expectedPax, note: r.note }));
      if (added.length > 0) save([...added, ...(guests ?? [])]);
      setImportReport({ added: added.length, problems });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa đọc được file này, bạn thử lại nhé.");
    } finally {
      setImportBusy(false);
    }
  }

  const editForm = (
    <div className="pn-item__body">
      <TextField label="Tên hộ/nhóm" value={form.household} onChange={(household) => setForm((f) => ({ ...f, household }))} maxLength={80} placeholder="Gia đình chú Ba" autoFocus />
      <div className="pn-row">
        <TextField label="Nhóm" hint="Không bắt buộc." value={form.groupName} onChange={(groupName) => setForm((f) => ({ ...f, groupName }))} maxLength={60} placeholder="Họ nhà trai" />
        <TextField label="Bàn" hint="Không bắt buộc." value={form.tableNo} onChange={(tableNo) => setForm((f) => ({ ...f, tableNo }))} maxLength={20} placeholder="B1" />
      </div>
      <div className="pn-row">
        <TextField label="Số điện thoại" hint="Không bắt buộc." value={form.phone} onChange={(phone) => setForm((f) => ({ ...f, phone }))} maxLength={20} inputMode="numeric" />
        <TextField label="Số khách dự kiến" hint="Tính cả hộ." value={form.expectedPax} onChange={(expectedPax) => setForm((f) => ({ ...f, expectedPax }))} inputMode="numeric" maxLength={2} />
      </div>
      <TextField label="Ghi chú" hint="Không bắt buộc." value={form.note} onChange={(note) => setForm((f) => ({ ...f, note }))} maxLength={300} />
      <div className="actions">
        <button type="button" className="button-primary" onClick={submitForm}>
          Lưu
        </button>
        <button type="button" className="button-ghost" onClick={() => setEditingId(null)}>
          Huỷ
        </button>
      </div>
    </div>
  );

  return (
    <PanelSection
      title="Danh sách khách"
      description="Lưu ngay trên trình duyệt này — không đồng bộ máy khác, không cần tài khoản. Xuất CSV để mở lại ở Studio khi bạn đã có thiệp."
      action={guests ? <span className="pn-count">{guests.length}</span> : null}
    >
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {guests === null ? (
        <p className="pn-empty">Đang tải…</p>
      ) : (
        <>
          {guests.length > 0 && (
            <>
              <div className="pn-row" role="group" aria-label="Nhập và xuất danh sách">
                <button type="button" className="button-ghost pn-compact" onClick={() => fileInputRef.current?.click()} disabled={importBusy}>
                  {importBusy ? "Đang nhập…" : "Nhập CSV"}
                </button>
                <button type="button" className="button-ghost pn-compact" onClick={exportCsv}>
                  Xuất CSV
                </button>
              </div>
              <div className="resp-summary" aria-label="Tổng hợp">
                <div className="resp-stat">
                  <strong>{guests.length}</strong>
                  <span>Hộ/nhóm</span>
                </div>
                <div className="resp-stat">
                  <strong>{guests.reduce((n, g) => n + g.expectedPax, 0)}</strong>
                  <span>Khách dự kiến</span>
                </div>
              </div>
            </>
          )}
          {guests.length === 0 && (
            <div className="pn-row">
              <button type="button" className="button-ghost pn-compact" onClick={() => fileInputRef.current?.click()} disabled={importBusy}>
                {importBusy ? "Đang nhập…" : "Nhập CSV"}
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void importFile(file);
            }}
          />
          {importReport && (
            <p className="pn-empty" role="status">
              Đã thêm {importReport.added} khách.
              {importReport.problems.length > 0 && (
                <>
                  {" "}
                  {importReport.problems.length} dòng bị bỏ qua: {importReport.problems.join("; ")}
                </>
              )}
            </p>
          )}

          {editingId === "new" && (
            <div className="pn-item" data-key="new">
              <div className="pn-item__head">
                <h4 className="pn-item__title">Khách mới</h4>
              </div>
              {editForm}
            </div>
          )}

          {guests.length === 0 && editingId !== "new" && <p className="pn-empty">Chưa có khách nào. Thêm khách hoặc nhập CSV.</p>}

          {guests.length > 0 && (
            <ol className="pn-list" ref={focus.listRef}>
              {guests.map((g) => (
                <li key={g.id} className="pn-item" data-key={g.id}>
                  <div className="pn-item__head">
                    <h4 className="pn-item__title">
                      {g.household}
                      {g.groupName && ` · ${g.groupName}`}
                      {g.tableNo && ` · Bàn ${g.tableNo}`}
                    </h4>
                    <div className="pn-item__actions">
                      <button type="button" className="link-quiet" onClick={() => startEdit(g)}>
                        Sửa
                      </button>
                      <IconButton label={`Xoá ${g.household}`} tone="danger" data-act="remove" onClick={() => setConfirmId(g.id)}>
                        <Glyph name="trash" />
                      </IconButton>
                    </div>
                  </div>
                  {confirmId === g.id && (
                    <div className="pn-confirm" role="group" aria-label={`Xác nhận xoá ${g.household}`}>
                      <p>Xoá khách này khỏi danh sách?</p>
                      <button type="button" className="button-ghost pn-compact pn-danger" onClick={() => remove(g.id)}>
                        Xoá
                      </button>
                      <button type="button" className="button-ghost pn-compact" autoFocus onClick={() => setConfirmId(null)}>
                        Giữ lại
                      </button>
                    </div>
                  )}
                  {editingId === g.id && editForm}
                </li>
              ))}
            </ol>
          )}

          <AddButton onClick={startAdd} disabled={editingId !== null}>
            Thêm khách
          </AddButton>
        </>
      )}
    </PanelSection>
  );
}
