"use server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Server actions run on the server, so prefer the service-role client
// (bypasses RLS) when configured; otherwise fall back to the anon key.
function db() {
  return supabaseAdmin ?? supabase;
}

async function resolveForwarderId(): Promise<string | null> {
  const { data, error } = await db()
    .from("forwarders")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to resolve the forwarder for branding:", error);
    return null;
  }
  return data ? String(data.id) : null;
}

export async function saveBranding(opts: {
  displayName: string;
  logoPath?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const forwarderId = await resolveForwarderId();
  if (!forwarderId) {
    return {
      ok: false,
      error: "No forwarder account found yet. Create your first document request to set one up.",
    };
  }

  const displayName = opts.displayName.trim();
  if (!displayName) {
    return { ok: false, error: "Display name is required." };
  }

  const logoPath = opts.logoPath?.trim() || null;

  const { error } = await db()
    .from("forwarders")
    .update({ display_name: displayName, logo_path: logoPath })
    .eq("id", forwarderId);

  if (error) {
    console.error("Failed to save branding:", error);
    return { ok: false, error: "Failed to save branding. Please try again." };
  }

  return { ok: true };
}