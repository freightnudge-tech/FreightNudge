import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16: the `middleware.ts` convention was renamed to `proxy.ts`.
// Refreshes the Supabase session cookies and guards protected routes.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Page routes only — API routes are excluded because they enforce their own
  // trust boundaries (service-role intake route, token-scoped endpoints) and
  // must answer with JSON, never a login redirect.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};