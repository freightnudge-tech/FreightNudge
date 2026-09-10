import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthForwarder = {
  id: string;
  name: string;
  email: string;
  displayName: string | null;
  logoPath: string | null;
  isAdmin: boolean;
};

export type AuthContext = {
  userId: string;
  forwarder: AuthForwarder | null;
};

// Full column set; the minimal set is used as a fallback for databases that
// haven't run the latest migration SQL yet (display_name / logo_path / is_admin).
const FORWARDER_COLUMNS = "id, name, email, display_name, logo_path, is_admin";
const FORWARDER_COLUMNS_MINIMAL = "id, name, email";

// Guards a protected page: redirects to /login when there is no session and
// resolves the authenticated forwarder (looked up via forwarders.user_id).
export async function requireAuth(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // .limit(1) keeps maybeSingle() from erroring out if the signup trigger
  // (or older placeholder logic) ever left more than one row per user.
  const full = await supabase
    .from("forwarders")
    .select(FORWARDER_COLUMNS)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  let row = full.data;

  if (full.error) {
    // Never swallow lookup errors — the previous behavior silently returned
    // null here, which made the settings page claim "No forwarder account yet"
    // even when the row existed (e.g. a missing is_admin column from an
    // un-run migration, or duplicate rows tripping maybeSingle()).
    console.error("[requireAuth] forwarders lookup failed:", full.error.message);

    // Retry with the minimal column set so the account still resolves when
    // only the newer optional columns are missing. isAdmin defaults to false
    // in that case — the safe direction for the /admin gate.
    const retry = await supabase
      .from("forwarders")
      .select(FORWARDER_COLUMNS_MINIMAL)
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (retry.error) {
      console.error(
        "[requireAuth] minimal forwarders lookup also failed — run the migrations from the task notes (user_id, display_name, logo_path, is_admin) and check RLS SELECT policies on forwarders:",
        retry.error.message,
      );
    }
    // The retry row only carries the minimal columns; the mapping below
    // guards each optional key with `in` checks.
    row = (retry.data ?? null) as typeof full.data;
  }

  if (!row) {
    // The lookup succeeded but found nothing. This is expected when the user
    // genuinely has no forwarders row yet — but if the row exists in the
    // Table Editor with a matching user_id, RLS on forwarders is silently
    // filtering it out (empty result, no error). The fix is the
    // "forwarders: select own" policy from the auth migration SQL.
    console.warn(
      `[requireAuth] no forwarders row resolved for user ${user.id}. If the row exists with this user_id, RLS on forwarders is blocking SELECT — add the "forwarders: select own" policy.`,
    );
  }

  return {
    userId: user.id,
    forwarder: row
      ? {
          id: String(row.id),
          name: String(row.name),
          email: String(row.email),
          displayName: "display_name" in row && row.display_name ? String(row.display_name) : null,
          logoPath: "logo_path" in row && row.logo_path ? String(row.logo_path) : null,
          isAdmin: "is_admin" in row ? row.is_admin === true : false,
        }
      : null,
  } satisfies AuthContext;
}

// Guards platform-admin pages (/admin): beyond a valid session, the signed-in
// forwarder must have forwarders.is_admin = true. Everyone else is sent back
// to their own dashboard instead of getting a 404 or an error page.
export async function requireAdmin(supabase: SupabaseClient) {
  const context = await requireAuth(supabase);

  if (!context.forwarder?.isAdmin) {
    redirect("/dashboard");
  }

  return context;
}