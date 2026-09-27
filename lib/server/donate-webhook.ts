import { createHmac, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "./http.ts";

export type DonationProvider = "casso" | "sepay";
export type Donation = {
  provider: DonationProvider;
  providerTransactionId: string;
  amount: number;
  content: string;
  occurredAt: string;
};

export function normalizeDonation(provider: DonationProvider, payload: Record<string, unknown>): Donation {
  const id = String(payload.id ?? payload.transactionId ?? payload.referenceCode ?? "").trim();
  const amount = Number(payload.amount ?? payload.transferAmount ?? 0);
  const content = String(payload.description ?? payload.content ?? payload.transferContent ?? "").trim();
  const occurredAt = String(payload.when ?? payload.transactionDate ?? payload.transactionDateTime ?? "").trim();
  if (!id || !Number.isSafeInteger(amount) || amount <= 0 || !occurredAt) throw new HttpError(400, "Dữ liệu giao dịch không hợp lệ.");
  return { provider, providerTransactionId: id, amount, content, occurredAt };
}

export async function verifyWebhookSignature(body: string, secret: string, header: string | null): Promise<boolean> {
  if (!header || !secret) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const actual = header.replace(/^sha256=/i, "").trim();
  if (!/^[0-9a-f]{64}$/i.test(actual)) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(actual, "hex"));
}

export function verifyWebhookToken(secret: string, provided: string | null): boolean {
  if (!secret || !provided) return false;
  const expected = Buffer.from(secret);
  const actual = Buffer.from(provided.trim());
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function recordDonation(client: SupabaseClient, donation: Donation, rawPayload: Record<string, unknown>): Promise<void> {
  const { error } = await client.from("donation_transactions").upsert({
    provider: donation.provider,
    provider_transaction_id: donation.providerTransactionId,
    amount: donation.amount,
    transfer_content: donation.content,
    occurred_at: donation.occurredAt,
    raw_payload: rawPayload,
  }, { onConflict: "provider,provider_transaction_id", ignoreDuplicates: true });
  if (error) throw new HttpError(500, "Chưa lưu được giao dịch Donate.");
}
