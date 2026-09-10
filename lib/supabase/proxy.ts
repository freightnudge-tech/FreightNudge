import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Public routes that don't require a session.
const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/pricing"]);

// Routes that require an authenticated session.
const PROTECTED_PREFIXES = ["/dashboard", "/requests", "/clients", "/settings", "/reports", "/admin"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // Client-facing upload pages are reached via emailed links — keep them open.
  return pathname.startsWith("/upload/");
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Verifies the access token and refreshes it when expired.
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user) {
    if (!isPublicPath(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // Authenticated users visiting the auth pages go straight to the dashboard.
  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}