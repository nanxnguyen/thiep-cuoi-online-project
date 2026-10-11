import { parseEditLink } from "./local-invitations";
const TOKEN = "moc.account.token";
// Hint đăng nhập chung cho mọi tab (localStorage, không phải sessionStorage theo tab):
// tab mới hoặc lượt ghé sau vẫn thấy hint và hỏi /api/auth/me để hiện avatar.
// Phiên thật nằm ở httpOnly cookie; đây chỉ là cờ "có thể đã đăng nhập".
// Không fetch khi không có hint: Chrome log console.error cho response 401
// (.catch chỉ nuốt promise rejection, không nuốt network log) và e2e bắt 0 console error.
export const accountToken = { get: () => typeof localStorage === "undefined" ? "" : localStorage.getItem(TOKEN) ?? "", set: (v: string) => localStorage.setItem(TOKEN, v), clear: () => localStorage.removeItem(TOKEN) };
export const parseClaimLink = (input: string, origin: string) => parseEditLink(input, origin);
