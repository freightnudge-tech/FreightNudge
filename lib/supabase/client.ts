"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client used by client components for auth actions
// (sign up / sign in). It stores the session in HttpOnly cookies so the
// server-side client can read it on subsequent requests.
export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);