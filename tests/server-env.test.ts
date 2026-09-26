import assert from "node:assert/strict";
import test from "node:test";
import { serverEnv } from "../lib/server/env.ts";
import { createAdminClient, createAnonClient, createRequestClient } from "../lib/server/supabase.ts";

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
  "EDGE_SHARED_SECRET",
  "RATE_LIMIT_HMAC_SECRET",
] as const;

function withEnv(values: Partial<Record<(typeof KEYS)[number], string>>, run: () => void) {
  const before = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));
  for (const key of KEYS) delete process.env[key];
  Object.assign(process.env, values);
  try {
    run();
  } finally {
    for (const key of KEYS) {
      const value = before[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("serverEnv returns validated Supabase values and derives the Edge URL", () => {
  withEnv(
    {
      NEXT_PUBLIC_SUPABASE_URL: "https://iehmucsshklgjmxqygqp.supabase.co/",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
      EDGE_SHARED_SECRET: "edge-secret",
      RATE_LIMIT_HMAC_SECRET: "hmac-secret",
    },
    () =>
      assert.deepEqual(serverEnv(), {
        supabaseUrl: "https://iehmucsshklgjmxqygqp.supabase.co",
        supabaseAnonKey: "anon-key",
        supabaseServiceRoleKey: "service-key",
        edgeFunctionUrl: "https://iehmucsshklgjmxqygqp.supabase.co/functions/v1/public-write",
        edgeSharedSecret: "edge-secret",
        rateLimitHmacSecret: "hmac-secret",
      }),
  );
});

test("serverEnv rejects each missing private or public setting", () => {
  const valid = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    EDGE_SHARED_SECRET: "edge-secret",
    RATE_LIMIT_HMAC_SECRET: "hmac-secret",
  };

  for (const missing of Object.keys(valid) as (keyof typeof valid)[]) {
    const values = { ...valid };
    delete values[missing];
    withEnv(values, () => assert.throws(() => serverEnv(), new RegExp(missing)));
  }
});

test("serverEnv never accepts a service-role key from a public variable", () => {
  withEnv(
    {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: "leaked-service-key",
      EDGE_SHARED_SECRET: "edge-secret",
      RATE_LIMIT_HMAC_SECRET: "hmac-secret",
    },
    () => assert.throws(() => serverEnv(), /SUPABASE_SERVICE_ROLE_KEY/),
  );
});

test("Supabase client factories keep anon, request, and admin credentials separated", () => {
  withEnv(
    {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
      EDGE_SHARED_SECRET: "edge-secret",
      RATE_LIMIT_HMAC_SECRET: "hmac-secret",
    },
    () => {
      const anon = createAnonClient();
      const request = createRequestClient({ getAll: () => [], setAll: () => undefined });
      const admin = createAdminClient();
      const keyOf = (client: unknown) => (client as { supabaseKey: string }).supabaseKey;

      assert.equal(keyOf(anon), "anon-key");
      assert.equal(keyOf(request), "anon-key");
      assert.equal(keyOf(admin), "service-key");
      assert.equal((admin.auth as unknown as { persistSession: boolean }).persistSession, false);
      assert.equal((admin.auth as unknown as { autoRefreshToken: boolean }).autoRefreshToken, false);
    },
  );
});
