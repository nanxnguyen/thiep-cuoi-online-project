// Banks print account names in capitals without diacritics ("NGUYEN VAN MINH"), and that is the
// form the VietQR image should carry. NFD does not split đ/Đ, so they are mapped by hand.
export function toBankName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}
