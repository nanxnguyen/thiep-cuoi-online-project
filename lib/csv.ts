// CSV cho nhập/xuất sổ khách mời (Phase 3). Không dùng thư viện ngoài: danh sách khách một đám cưới
// thực tế nhỏ (vài trăm dòng), một trình phân tích RFC4180 gọn là đủ. Xem spec mục 8.
export const BOM = "﻿";

function sniffDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  let best = ",";
  let bestCount = -1;
  for (const d of [",", ";", "\t"]) {
    const count = firstLine.split(d).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return best;
}

// Trình phân tích RFC4180 thủ công (không split theo dấu phẩy): cần xử lý ô trong ngoặc kép chứa dấu
// phân cách, dấu ngoặc kép lặp ("") và xuống dòng. Tự dò dấu phân cách vì người dùng dán từ Google
// Sheets (phẩy) hoặc Excel theo vùng khác (chấm phẩy/tab).
export function parseCsv(text: string, delimiter?: string): string[][] {
  const body = text.startsWith(BOM) ? text.slice(1) : text;
  const delim = delimiter ?? sniffDelimiter(body);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let touched = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
    touched = false;
  };

  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (inQuotes) {
      if (c === '"') {
        if (body[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      touched = true;
    } else if (c === delim) {
      pushField();
      touched = true;
    } else if (c === "\r") {
      continue;
    } else if (c === "\n") {
      pushRow();
    } else {
      field += c;
      touched = true;
    }
  }
  if (touched || field !== "") pushRow();
  // Bỏ dòng trắng hoàn toàn (dòng cuối file thừa \n, hoặc dòng trống giữa file) — không phải dữ liệu.
  return rows.filter((r) => !r.every((c) => c === ""));
}

function escapeCsvField(value: string, delim: string): string {
  if (value.includes(delim) || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(rows: string[][], delimiter = ","): string {
  return rows.map((r) => r.map((cell) => escapeCsvField(cell, delimiter)).join(delimiter)).join("\r\n");
}

// Cột tiếng Việt không dấu, khớp với những gì xuất ra (không phân biệt hoa/thường khi đọc lại).
export const GUEST_CSV_COLUMNS = ["ho_gia_dinh", "nhom", "ban", "dien_thoai", "so_khach_du_kien", "ghi_chu"] as const;
export type GuestCsvRow = { household: string; groupName: string; tableNo: string; phone: string; expectedPax: number; note: string };
// line: số dòng trong file (dòng tiêu đề = 1), để báo lỗi đúng chỗ người dùng cần sửa; -1 = lỗi cả file.
export type GuestCsvError = { line: number; message: string };
export type ParsedGuestRow = GuestCsvRow & { line: number };
export type GuestCsvExportRow = GuestCsvRow & { link: string };

export function parseGuestsCsv(text: string): { rows: ParsedGuestRow[]; errors: GuestCsvError[] } {
  const table = parseCsv(text);
  if (table.length === 0) return { rows: [], errors: [] };
  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const idx = {
    household: col("ho_gia_dinh"),
    groupName: col("nhom"),
    tableNo: col("ban"),
    phone: col("dien_thoai"),
    expectedPax: col("so_khach_du_kien"),
    note: col("ghi_chu"),
  };
  if (idx.household === -1) {
    return { rows: [], errors: [{ line: -1, message: 'Thiếu cột "ho_gia_dinh" ở dòng tiêu đề.' }] };
  }

  const cell = (row: string[], i: number) => (i >= 0 ? (row[i] ?? "").trim() : "");
  const rows: ParsedGuestRow[] = [];
  const errors: GuestCsvError[] = [];
  for (let i = 1; i < table.length; i++) {
    const r = table[i];
    const line = i + 1; // dòng 1 là tiêu đề, dòng dữ liệu đầu tiên là dòng 2
    const household = cell(r, idx.household);
    if (!household) {
      errors.push({ line, message: "Tên hộ/nhóm không được để trống." });
      continue;
    }
    const paxRaw = cell(r, idx.expectedPax);
    const pax = paxRaw === "" ? 1 : Number(paxRaw);
    if (paxRaw !== "" && (!Number.isInteger(pax) || pax < 0 || pax > 20)) {
      errors.push({ line, message: "Số khách dự kiến phải là số nguyên từ 0 đến 20." });
      continue;
    }
    rows.push({
      line,
      household,
      groupName: cell(r, idx.groupName),
      tableNo: cell(r, idx.tableNo),
      phone: cell(r, idx.phone),
      expectedPax: pax,
      note: cell(r, idx.note),
    });
  }
  return { rows, errors };
}

// BOM ở đầu bắt buộc: Excel trên Windows làm hỏng dấu tiếng Việt khi mở CSV UTF-8 không có BOM.
export function guestsToCsv(guests: GuestCsvExportRow[]): string {
  const header = [...GUEST_CSV_COLUMNS, "link"];
  const rows = [header, ...guests.map((g) => [g.household, g.groupName, g.tableNo, g.phone, String(g.expectedPax), g.note, g.link])];
  return BOM + toCsv(rows);
}
