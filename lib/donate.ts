// Real bank account of the project owner, shown on /ung-ho. Not a per-invitation gift account.
export const DONATE_ACCOUNT = {
  bankCode: "970423", // TPBank, see lib/banks.ts
  accountNumber: "04123513201",
  accountName: "Nguyễn Anh Nhựt",
};

export const DONATE_MESSAGE = "Ủng hộ MỘC Wedding";

// Suggested amounts on /ung-ho (design/Ung Ho.dc.html): [VND, label, what it pays for].
export const DONATE_AMOUNTS = [
  [50000, "50.000đ", "Duy trì máy chủ cho khoảng 1.000 lượt xem thiệp"],
  [100000, "100.000đ", "Giữ máy chủ hoạt động thêm 1 ngày cho mọi người dùng"],
  [200000, "200.000đ", "Góp phần thiết kế một mẫu thiệp mới"],
  [500000, "500.000đ", "Giữ Mộc miễn phí thêm một tuần cho hàng nghìn cặp đôi"],
] as const;
