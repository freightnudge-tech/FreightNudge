"use server";

import { createClient } from "@/lib/supabase/server";

async function db() {
  return await createClient();
}

async function resolveForwarderId(): Promise<string | null> {
  const client = await db();

  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await client
    .from("forwarders")
    .select("id")
    .eq("user_id", user.id)
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
      error: "Your account isn't linked to a forwarder yet. Please contact support.",
    };
  }

  const displayName = opts.displayName.trim();
  if (!displayName) {
    return { ok: false, error: "Display name is required." };
  }

  const logoPath = opts.logoPath?.trim() || null;

  const { error } = await (await db())
    .from("forwarders")
    .update({ display_name: displayName, logo_path: logoPath })
    .eq("id", forwarderId);

  if (error) {
    console.error("Failed to save branding:", error);
    return { ok: false, error: "Failed to save branding. Please try again." };
  }

  return { ok: true };
}