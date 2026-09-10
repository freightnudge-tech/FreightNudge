import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client bound to the current request's auth session
// cookies. Use this in Server Components and Server Actions to read the
// authenticated user and run queries scoped to them.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — the proxy refreshes cookies
            // on the next request instead.
          }
        },
      },
    },
  );
}