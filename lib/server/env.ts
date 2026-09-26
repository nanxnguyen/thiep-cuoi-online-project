export type ServerEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  edgeFunctionUrl: string;
  edgeSharedSecret: string;
  rateLimitHmacSecret: string;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Thiếu biến môi trường ${name}`);
  return value;
}

export function serverEnv(): ServerEnv {
  const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL").replace(/\/+$/, "");
  new URL(supabaseUrl);

  return {
    supabaseUrl,
    supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    edgeFunctionUrl: `${supabaseUrl}/functions/v1/public-write`,
    edgeSharedSecret: required("EDGE_SHARED_SECRET"),
    rateLimitHmacSecret: required("RATE_LIMIT_HMAC_SECRET"),
  };
}
