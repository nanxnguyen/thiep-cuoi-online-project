import { parseEditLink } from "./local-invitations";
const TOKEN = "moc.account.token";
export const accountToken = { get: () => typeof sessionStorage === "undefined" ? "" : sessionStorage.getItem(TOKEN) ?? "", set: (v: string) => sessionStorage.setItem(TOKEN, v), clear: () => sessionStorage.removeItem(TOKEN) };
export const parseClaimLink = (input: string, origin: string) => parseEditLink(input, origin);
