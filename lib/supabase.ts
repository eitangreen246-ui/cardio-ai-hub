import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service-role key.
 * Never import this from a "use client" component — the key must not reach the browser.
 * All tables have RLS enabled with no policies, so this client is the only way in.
 */
export function supabase(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables.");
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
