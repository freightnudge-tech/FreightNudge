"use server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Simple RFC-style sanity check for client email input.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fallback forwarder created automatically when the forwarders table is empty
// (same behavior as the dashboard's document request flow).
const DEFAULT_FORWARDER = {
  name: "Demo Forwarder",
  email: "demo@freightnudge.com",
};

// Server actions always run on the server, so prefer the service-role client
// (bypasses RLS) when it is configured; otherwise fall back to the anon key.
function db() {
  return supabaseAdmin ?? supabase;
}

export type CreateClientResult = {
  ok: boolean;
  error?: string;
  clientId?: string;
};

export async function createClient(opts: {
  name: string;
  email: string;
  forwarderId?: string;
}): Promise<CreateClientResult> {
  const name = opts.name.trim();
  const email = opts.email.trim().toLowerCase();

  if (!name) {
    return { ok: false, error: "Client name is required." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "A valid client email is required." };
  }

  const client = db();

  // Reuse the client when the email is already registered.
  const { data: existing } = await client.from("clients").select("id").eq("email", email).maybeSingle();
  if (existing?.id) {
    return { ok: false, error: "A client with this email already exists." };
  }

  // Resolve the forwarder: the one picked in the form, otherwise the first
  // available record, otherwise ensure the default forwarder exists.
  let forwarderId = opts.forwarderId?.trim() ?? "";

  if (!forwarderId) {
    const { data: firstForwarder } = await client
      .from("forwarders")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    forwarderId = firstForwarder?.id ? String(firstForwarder.id) : "";
  }

  if (!forwarderId) {
    const { data: upserted, error: upsertError } = await client
      .from("forwarders")
      .upsert(DEFAULT_FORWARDER, { onConflict: "email" })
      .select("id")
      .single();

    if (upserted?.id) {
      console.log("Ensured default forwarder:", DEFAULT_FORWARDER.email);
      forwarderId = String(upserted.id);
    } else {
      console.error("Failed to ensure the default forwarder:", upsertError);
      return { ok: false, error: "Failed to resolve the forwarder account." };
    }
  }

  const { data: inserted, error: insertError } = await client
    .from("clients")
    .insert({
      forwarder_id: forwarderId,
      name,
      email,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("Failed to create the client:", insertError);
    return { ok: false, error: "Failed to create the client. Check the insert policy on the clients table." };
  }

  return { ok: true, clientId: String(inserted.id) };
}