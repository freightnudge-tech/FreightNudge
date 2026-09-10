"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";

// Simple RFC-style sanity check for client email input.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function db() {
  return await createSupabaseClient();
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

  const client = await db();

  // Authenticated forwarder only — a user can never assign a client to
  // another forwarder, even if a forwarderId is passed in the payload.
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be logged in to create a client." };
  }

  const { data: forwarderRow, error: forwarderError } = await client
    .from("forwarders")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (forwarderError || !forwarderRow) {
    return { ok: false, error: "No forwarder account is linked to your login." };
  }
  const forwarderId = String(forwarderRow.id);

  // Reuse the client when the email is already registered.
  const { data: existing } = await client.from("clients").select("id").eq("email", email).maybeSingle();
  if (existing?.id) {
    return { ok: false, error: "A client with this email already exists." };
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