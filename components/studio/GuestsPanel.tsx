"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddButton, Glyph, IconButton, PanelSection, SelectField, TextField } from "@/components/studio/fields";
import { api, type GuestDto, type GuestRsvpStatus } from "@/lib/api";
import { guestsToCsv, parseGuestsCsv } from "@/lib/csv";

type Props = { id: string; editKey: string; published: boolean };
const ALL = ""; // giá trị bộ lọc "tất cả" (không giới hạn nhóm/bàn)

// Tab riêng, không đi qua draft.content/useAutosave: khách mời là tài nguyên BE riêng (bảng guests), mỗi
// thao tác gọi API ngay, giống ResponsesPanel — không phải PanelProps như các tab nội dung khác.
type Form = { household: string; groupName: string; tableNo: string; phone: string; expectedPax: string; note: string };
const blankForm = (): Form => ({ household: "", groupName: "", tableNo: "", phone: "", expectedPax: "1", note: "" });
const formFrom = (g: GuestDto): Form => ({
  household: g.household,
  groupName: g.groupName,
  tableNo: g.tableNo,
  phone: g.phone,
  expectedPax: String(g.expectedPax),
  note: g.note,
});

const STATUS_LABEL: Record<GuestRsvpStatus, string> = { pending: "Chưa phản hồi", attending: "Đến", declined: "Không đến" };

// dự kiến = expectedPax chủ thiệp tự ước lượng; đã xác nhận = guests của RSVP mới nhất nếu attending
// (BE GuestService), không cộng dồn hai chiều thành một tổng — xem spec mục 7.
type Bucket = { key: string; households: number; expectedPax: number; attending: number; declined: number; pending: number; confirmedPax: number };
function bucketBy(guests: GuestDto[], keyOf: (g: GuestDto) => string): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const g of guests) {
    const key = keyOf(g).trim() || "(chưa gán)";
    const b = map.get(key) ?? { key, households: 0, expectedPax: 0, attending: 0, declined: 0, pending: 0, confirmedPax: 0 };
    b.households++;
    b.expectedPax += g.expectedPax;
    if (g.rsvpStatus === "attending") {
      b.attending++;
      b.confirmedPax += g.confirmedPax ?? 0;
    } else if (g.rsvpStatus === "declined") {
      b.declined++;
    } else {
      b.pending++;
    }
    map.set(key, b);
  }
  return [...map.values()].sort((a, b) => b.households - a.households);
}

export function GuestsPanel({ id, editKey, published }: Props) {
  const [guests, setGuests] = useState<GuestDto[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Form>(blankForm());
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [filterGroup, setFilterGroup] = useState(ALL);
  const [filterTable, setFilterTable] = useState(ALL);
  const [importBusy, setImportBusy] = useState(false);
  const [importReport, setImportReport] = useState<{ created: number; problems: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setGuests((await api.listGuests(id, editKey)).guests);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa tải được danh sách khách.");
    } finally {
      setLoading(false);
    }
  }, [id, editKey]);

  useEffect(() => {
    void load();
  }, [load]);

  function startAdd() {
    setForm(blankForm());
    setError("");
    setEditingId("new");
  }
  function startEdit(g: GuestDto) {
    setForm(formFrom(g));
    setError("");
    setEditingId(g.id);
  }

  function pax(): number {
    const n = Number(form.expectedPax.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) ? Math.min(20, Math.max(0, n)) : 1;
  }

  async function save() {
    if (!form.household.trim()) {
      setError("Tên hộ/nhóm không được để trống.");
      return;
    }
    setSaving(true);
    setError("");
    const input = {
      household: form.household.trim(),
      groupName: form.groupName.trim(),
      tableNo: form.tableNo.trim(),
      phone: form.phone.trim(),
      expectedPax: pax(),
      note: form.note.trim(),
    };
    try {
      if (editingId === "new") {
        const created = await api.createGuest(id, editKey, input);
        setGuests((gs) => [created, ...(gs ?? [])]);
      } else if (editingId) {
        const updated = await api.updateGuest(id, editKey, editingId, input);
        setGuests((gs) => (gs ?? []).map((g) => (g.id === editingId ? updated : g)));
      }
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa lưu được, bạn thử lại nhé.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(guestId: string) {
    setSaving(true);
    setError("");
    try {
      await api.deleteGuest(id, editKey, guestId);
      setGuests((gs) => (gs ?? []).filter((g) => g.id !== guestId));
      setConfirmId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa xoá được, bạn thử lại nhé.");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(g: GuestDto) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${g.link}`);
      setCopiedId(g.id);
      setTimeout(() => setCopiedId((c) => (c === g.id ? null : c)), 2000);
    } catch {
      setError("Trình duyệt không cho sao chép tự động, bạn tự chọn link để sao chép nhé.");
    }
  }

  async function copyAllLinks() {
    if (!guests || guests.length === 0) return;
    const text = guests.map((g) => `${g.household} — ${window.location.origin}${g.link}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      setError("Trình duyệt không cho sao chép tự động, bạn tự chọn để sao chép nhé.");
    }
  }

  function exportCsv() {
    if (!guests || guests.length === 0) return;
    const csv = guestsToCsv(guests.map((g) => ({ ...g, link: `${window.location.origin}${g.link}` })));
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "khach-moi.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Parse ở FE (lib/csv.ts) rồi gửi JSON đã sạch lên BE — BE không parse CSV (xem spec mục 8). Lỗi đọc file
  // (thiếu cột, dòng trống tên) và lỗi khi lưu (BE từ chối một dòng) đều quy về "Dòng N trong file" để
  // chủ thiệp sửa đúng chỗ, dù hai loại lỗi đến từ hai nơi khác nhau.
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
      if (parsed.rows.length > 0) {
        const payload = parsed.rows.map((r) => ({
          household: r.household,
          groupName: r.groupName,
          tableNo: r.tableNo,
          phone: r.phone,
          expectedPax: r.expectedPax,
          note: r.note,
        }));
        const result = await api.importGuests(id, editKey, payload);
        for (const e of result.errors) {
          const line = parsed.rows[e.index]?.line;
          problems.push(line ? `Dòng ${line}: ${e.message}` : e.message);
        }
        setImportReport({ created: result.created, problems });
        await load();
      } else {
        setImportReport({ created: 0, problems });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa nhập được file, bạn thử lại nhé.");
    } finally {
      setImportBusy(false);
    }
  }

  const groupOptions = useMemo(() => [...new Set((guests ?? []).map((g) => g.groupName).filter(Boolean))].sort(), [guests]);
  const tableOptions = useMemo(() => [...new Set((guests ?? []).map((g) => g.tableNo).filter(Boolean))].sort(), [guests]);
  const byGroup = useMemo(() => bucketBy(guests ?? [], (g) => g.groupName), [guests]);
  const byTable = useMemo(() => bucketBy(guests ?? [], (g) => g.tableNo), [guests]);
  const visible = useMemo(
    () => (guests ?? []).filter((g) => (filterGroup === ALL || g.groupName === filterGroup) && (filterTable === ALL || g.tableNo === filterTable)),
    [guests, filterGroup, filterTable],
  );

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
      <TextField label="Ghi chú riêng" hint="Chỉ chủ thiệp thấy, không hiện với khách." value={form.note} onChange={(note) => setForm((f) => ({ ...f, note }))} maxLength={300} />
      <div className="actions">
        <button type="button" className="button-primary" onClick={save} disabled={saving}>
          {saving ? "Đang lưu…" : "Lưu"}
        </button>
        <button type="button" className="button-ghost" onClick={() => setEditingId(null)} disabled={saving}>
          Huỷ
        </button>
      </div>
    </div>
  );

  return (
    <div className="pn-stack">
      <PanelSection
        title="Khách mời"
        description="Mỗi dòng là một hộ/nhóm được mời. Sao chép link riêng để gửi; khách mở ra sẽ thấy tên điền sẵn."
        action={guests ? <span className="pn-count">{guests.length}</span> : null}
      >
        {!published && <p className="pn-empty">Thiệp chưa xuất bản nên link khách mời chưa mở được với khách. Vẫn thêm được danh sách trước, xuất bản khi sẵn sàng.</p>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {loading && !guests ? <p className="pn-empty">Đang tải…</p> : null}

        {guests && guests.length > 0 && (
          <div className="pn-row" role="group" aria-label="Nhập, xuất và sao chép danh sách">
            <button type="button" className="button-ghost pn-compact" onClick={() => fileInputRef.current?.click()} disabled={importBusy}>
              {importBusy ? "Đang nhập…" : "Nhập CSV"}
            </button>
            <button type="button" className="button-ghost pn-compact" onClick={exportCsv}>
              Xuất CSV
            </button>
            <button type="button" className="button-ghost pn-compact" onClick={copyAllLinks}>
              {copiedAll ? "Đã sao chép" : "Sao chép tất cả link"}
            </button>
          </div>
        )}
        {guests && guests.length === 0 && (
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
            Đã thêm {importReport.created} khách.
            {importReport.problems.length > 0 && (
              <>
                {" "}
                {importReport.problems.length} dòng bị bỏ qua:
                <br />
                {importReport.problems.join("; ")}
              </>
            )}
          </p>
        )}

        {guests && guests.length > 0 && (
          <div className="resp-summary" aria-label="Tổng hợp">
            <div className="resp-stat">
              <strong>{guests.length}</strong>
              <span>Hộ/nhóm</span>
            </div>
            <div className="resp-stat">
              <strong>{guests.reduce((n, g) => n + g.expectedPax, 0)}</strong>
              <span>Khách dự kiến</span>
            </div>
            <div className="resp-stat">
              <strong>{guests.filter((g) => g.rsvpStatus === "attending").length}</strong>
              <span>Đã xác nhận đến</span>
            </div>
            <div className="resp-stat">
              <strong>{guests.filter((g) => g.rsvpStatus === "pending").length}</strong>
              <span>Chưa phản hồi</span>
            </div>
          </div>
        )}
        {byGroup.length > 1 && (
          <div className="pn-empty">
            <strong>Theo nhóm: </strong>
            {byGroup.map((b) => `${b.key} (${b.households} hộ, ${b.expectedPax} dự kiến, ${b.attending} đã xác nhận)`).join(" · ")}
          </div>
        )}
        {byTable.length > 1 && (
          <div className="pn-empty">
            <strong>Theo bàn: </strong>
            {byTable.map((b) => `${b.key} (${b.households} hộ, ${b.expectedPax} dự kiến, ${b.attending} đã xác nhận)`).join(" · ")}
          </div>
        )}

        {(groupOptions.length > 1 || tableOptions.length > 1) && (
          <div className="pn-row">
            {groupOptions.length > 1 && (
              <SelectField
                label="Lọc theo nhóm"
                value={filterGroup}
                onChange={setFilterGroup}
                placeholder="Tất cả nhóm"
                options={groupOptions.map((g) => ({ value: g, label: g }))}
              />
            )}
            {tableOptions.length > 1 && (
              <SelectField
                label="Lọc theo bàn"
                value={filterTable}
                onChange={setFilterTable}
                placeholder="Tất cả bàn"
                options={tableOptions.map((t) => ({ value: t, label: t }))}
              />
            )}
          </div>
        )}

        {editingId === "new" && (
          <div className="pn-item" data-key="new">
            <div className="pn-item__head">
              <h4 className="pn-item__title">Khách mới</h4>
            </div>
            {editForm}
          </div>
        )}

        {guests && guests.length === 0 && editingId !== "new" && <p className="pn-empty">Chưa có khách nào. Thêm khách hoặc nhập CSV để lấy link riêng gửi từng người/hộ.</p>}
        {guests && guests.length > 0 && visible.length === 0 && <p className="pn-empty">Không có khách nào khớp bộ lọc đang chọn.</p>}

        {visible.length > 0 && (
          <ol className="pn-list">
            {visible.map((g) => (
              <li key={g.id} className="pn-item" data-key={g.id}>
                <div className="pn-item__head">
                  <h4 className="pn-item__title">
                    {g.household}
                    {g.groupName && ` · ${g.groupName}`}
                    {g.tableNo && ` · Bàn ${g.tableNo}`}
                  </h4>
                  <span className="resp-tag" data-no={g.rsvpStatus === "declined"}>
                    {STATUS_LABEL[g.rsvpStatus]}
                    {g.rsvpStatus === "attending" && g.confirmedPax != null ? ` · ${g.confirmedPax} người` : ""}
                  </span>
                  <div className="pn-item__actions">
                    <button type="button" className="link-quiet" onClick={() => copyLink(g)}>
                      {copiedId === g.id ? "Đã sao chép" : "Sao chép link"}
                    </button>
                    <button type="button" className="link-quiet" onClick={() => startEdit(g)}>
                      Sửa
                    </button>
                    <IconButton label={`Xoá ${g.household}`} tone="danger" onClick={() => setConfirmId(g.id)}>
                      <Glyph name="trash" />
                    </IconButton>
                  </div>
                </div>
                {confirmId === g.id && (
                  <div className="pn-confirm" role="group" aria-label={`Xác nhận xoá ${g.household}`}>
                    <p>Xoá khách này? Link đã gửi sẽ không dùng được nữa.</p>
                    <button type="button" className="button-ghost pn-compact pn-danger" onClick={() => remove(g.id)} disabled={saving}>
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
      </PanelSection>
    </div>
  );
}
