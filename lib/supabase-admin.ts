import "server-only";

import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service role key. It bypasses Row
// Level Security, so it must NEVER be imported from client components.
// Evaluates to null when SUPABASE_SERVICE_ROLE_KEY is not configured, in
// which case server actions fall back to the anon-key client.
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
  : null;