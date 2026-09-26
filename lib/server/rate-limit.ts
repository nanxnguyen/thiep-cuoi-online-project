import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "./http.ts";

export async function consumeRateLimit(
  client: Pick<SupabaseClient, "rpc">,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await client.rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new HttpError(500, "Chưa kiểm tra được giới hạn yêu cầu.");
  return data === true;
}
