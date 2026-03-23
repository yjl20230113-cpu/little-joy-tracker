"use client";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type BrowserSupabaseClient = SupabaseClient;

let cachedClient: BrowserSupabaseClient | null = null;

function requireSupabaseClient(): BrowserSupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Important: don't throw at module evaluation time.
    // Vercel/Next may evaluate modules during prerender/build. We only need
    // these env vars when the client actually calls Supabase.
    throw new Error(
      "缺少 Supabase 环境变量：NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return cachedClient;
}

export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const realClient = requireSupabaseClient();
      const record = realClient as unknown as Record<PropertyKey, unknown>;
      const value = record[prop];

      if (typeof value === "function") {
        return (value as (...args: unknown[]) => unknown).bind(realClient);
      }

      return value;
    },
  },
) as unknown as BrowserSupabaseClient;
