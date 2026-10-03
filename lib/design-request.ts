import { z } from "zod";
import { normalizeDateInput } from "./datetime.ts";

// Custom-design request from /thiet-ke-thiep-rieng. Shared by the form (client) and the route (server).
export const BUDGETS = ["Dưới 1 triệu", "1 - 3 triệu", "3 - 5 triệu", "Trên 5 triệu", "Chưa biết, cần tư vấn"] as const;

// Vietnamese mobile (03/05/07/08/09, optionally +84 / 84) or any 8-15 digit number with spaces/dots/dashes.
const phoneOk = (v: string) => /^(\+?84|0)\d{8,10}$/.test(v.replace(/[\s.\-()]/g, ""));

const text = (max: number) => z.string().trim().max(max, "Nội dung quá dài.");

export const designRequestSchema = z.object({
  name: text(80).min(1, "Bạn nhập tên giúp mình nhé."),
  phone: text(30).refine(phoneOk, "Số điện thoại hoặc Zalo chưa đúng."),
  email: text(120).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email chưa đúng."),
  weddingDate: z.string().trim().max(10).transform((v, ctx) => {
    if (v === "") return "";
    const iso = normalizeDateInput(v);
    if (!iso) ctx.addIssue({ code: "custom", message: "Ngày cưới chưa hợp lệ." });
    return iso ?? "";
  }),
  budget: z.enum(BUDGETS).or(z.literal("")),
  details: text(2000).min(10, "Bạn mô tả ý tưởng thêm một chút nhé."),
  referenceLinks: text(1000),
  website: z.string().max(200).default(""), // honeypot: real people never fill it
});

export type DesignRequestInput = z.input<typeof designRequestSchema>;
export type DesignRequest = z.output<typeof designRequestSchema>;
