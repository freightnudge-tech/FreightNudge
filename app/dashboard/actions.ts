"use server";

import { randomUUID } from "crypto";

import { Resend } from "resend";

import { createClient } from "@/lib/supabase/server";

const REJECTION_CYCLE_DAYS = 7;

// Simple RFC-style sanity check for client email input.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Server actions run inside the request context, so use the cookie-bound
// client to act as the authenticated forwarder.
async function db() {
  return await createClient();
}

type ClientInfo = {
  email: string;
  name: string;
};

async function getClientEmailAndName(clientId: string): Promise<ClientInfo | null> {
  const { data, error } = await (await db())
    .from("clients")
    .select("email, name")
    .eq("id", clientId)
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to fetch client for notification:", error);
    return null;
  }

  return { email: String(data.email), name: String(data.name) };
}

function buildUploadLink(uploadLinkToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/upload/${uploadLinkToken}`;
}

async function sendRequestEmail(opts: {
  clientEmail: string;
  clientName: string;
  items: { documentName: string; uploadLinkToken: string }[];
  deadline: string;
  context: "new" | "rejected";
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not configured; skipping client notification email.");
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }

  const resend = new Resend(apiKey);
  const intro =
    opts.context === "rejected"
      ? "A previous document submission was rejected and a new request has been created."
      : opts.items.length > 1
        ? `The forwarder has requested ${opts.items.length} documents from you. Please upload all of them before the deadline.`
        : "The forwarder has requested a document from you. Please upload it before the deadline.";
  const deadlineLabel = new Date(opts.deadline).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const subject =
    opts.items.length === 1
      ? `New document request: ${opts.items[0].documentName}`
      : `New document requests: ${opts.items.length} documents`;

  const tableRows = opts.items
    .map((item) => {
      const uploadLink = buildUploadLink(item.uploadLinkToken);
      return `
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${item.documentName}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">
              <a href="${uploadLink}" style="color: #2563eb; font-weight: 600;">Upload Document</a>
            </td>
          </tr>`;
    })
    .join("");

  const linkList = opts.items
    .map((item) => {
      const uploadLink = buildUploadLink(item.uploadLinkToken);
      return `<li style="word-break: break-all;">${item.documentName}: ${uploadLink}</li>`;
    })
    .join("");

  const { error } = await resend.emails.send({
    from: "FreightNudge <onboarding@resend.dev>",
    to: opts.clientEmail,
    subject,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1a1a1a;">
        <h2 style="margin-bottom: 16px;">Document request</h2>
        <p>Hello ${opts.clientName},</p>
        <p>${intro}</p>
        <p style="font-weight: 600;">Deadline: ${deadlineLabel}</p>
        <table style="border-collapse: collapse; margin: 16px 0; width: 100%;">
          <tr>
            <th align="left" style="padding: 8px 12px; background: #f4f4f5;">Document</th>
            <th align="left" style="padding: 8px 12px; background: #f4f4f5;">Upload link</th>
          </tr>
          ${tableRows}
        </table>
        <p style="font-size: 13px; color: #6b7280;">Or copy and paste these URLs into your browser:</p>
        <ul style="font-size: 13px; color: #6b7280; padding-left: 18px;">${linkList}</ul>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send new request email:", error);
    return { sent: false, reason: "Failed to send the email" };
  }

  return { sent: true };
}

export async function approveRequest(requestId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await db();
  const { error } = await supabase
    .from("document_requests")
    .update({ status: "completed" })
    .eq("id", requestId);

  if (error) {
    console.error("Failed to approve request:", error);
    return { ok: false, error: "Failed to approve the request." };
  }

  return { ok: true };
}

export async function rejectRequest(
  requestId: string,
  rejectionReason: string,
): Promise<{ ok: boolean; error?: string; email?: { sent: boolean; reason?: string } }> {
  const supabase = await db();
  const { data: request, error: fetchError } = await supabase
    .from("document_requests")
    .select("client_id, document_name")
    .eq("id", requestId)
    .maybeSingle();

  if (fetchError || !request) {
    console.error("Failed to fetch request for rejection:", fetchError ?? "Request not found");
    return { ok: false, error: "Failed to load the request." };
  }

  const trimmedReason = rejectionReason.trim();

  const { error: updateError } = await supabase
    .from("document_requests")
    .update({ status: "rejected", rejection_reason: trimmedReason })
    .eq("id", requestId);

  if (updateError) {
    console.error("Failed to mark request as rejected:", updateError);
    return { ok: false, error: "Failed to update the request." };
  }

  const newDeadline = new Date(
    Date.now() + REJECTION_CYCLE_DAYS * 24 *  60 *  60 *  1000,
  ).toISOString();

  const { data: newRequest, error: insertError } = await supabase
    .from("document_requests")
    .insert({
      client_id: request.client_id,
      document_name: request.document_name,
      deadline: newDeadline,
      status: "pending",
      upload_link_token: randomUUID(),
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to create the new request cycle:", insertError);
    return { ok: false, error: "Failed to create the new request cycle." };
  }

  const client = await getClientEmailAndName(request.client_id);
  let emailResult: { sent: boolean; reason?: string } | undefined;

  if (client) {
    emailResult = await sendRequestEmail({
      clientEmail: client.email,
      clientName: client.name,
      items: [
        {
          documentName: request.document_name,
          uploadLinkToken: newRequest.upload_link_token,
        },
      ],
      deadline: newDeadline,
      context: "rejected",
    });
  }

  return { ok: true, email: emailResult };
}

export type CreateRequestResult = {
  ok: boolean;
  error?: string;
  links?: string[];
  email?: { sent: boolean; reason?: string };
};

async function insertRequestsAndNotify(opts: {
  clientId: string;
  documentNames: string[];
  deadline: string;
  containerNumber?: string;
  blNumber?: string;
  route?: string;
}): Promise<CreateRequestResult> {
  const rows = opts.documentNames.map((documentName) => ({
    client_id: opts.clientId,
    document_name: documentName,
    deadline: opts.deadline,
    status: "pending",
    upload_link_token: randomUUID(),
    container_number: opts.containerNumber?.trim() || null,
    bl_number: opts.blNumber?.trim() || null,
    route: opts.route?.trim() || null,
  }));

  const { error: insertError } = await (await db())
    .from("document_requests")
    .insert(rows);

  if (insertError) {
    console.error("Failed to create document requests:", insertError);
    return { ok: false, error: "Failed to create the document request(s)." };
  }

  // Dispatch the notification email right after the requests are saved.
  const client = await getClientEmailAndName(opts.clientId);
  let emailResult: { sent: boolean; reason?: string } | undefined;

  if (client) {
    emailResult = await sendRequestEmail({
      clientEmail: client.email,
      clientName: client.name,
      items: rows.map((row) => ({
        documentName: row.document_name,
        uploadLinkToken: row.upload_link_token,
      })),
      deadline: opts.deadline,
      context: "new",
    });
  }

  return {
    ok: true,
    links: rows.map((row) => buildUploadLink(row.upload_link_token)),
    email: emailResult,
  };
}

// Resolve the authenticated forwarder via the session (forwarders.user_id).
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
    console.error("Failed to look up the forwarder for the session:", error);
    return null;
  }
  return data ? String(data.id) : null;
}

export async function createBatchRequests(opts: {
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  documentNames: string[];
  deadline: string;
  containerNumber?: string;
  blNumber?: string;
  route?: string;
}): Promise<CreateRequestResult> {
  const documentNames = Array.from(
    new Set(
      opts.documentNames
        .map((name) => name.trim())
        .filter((name) => name.length > 0),
    ),
  );

  if (documentNames.length === 0) {
    return { ok: false, error: "Select or enter at least one document." };
  }
  if (!opts.deadline.trim() || Number.isNaN(Date.parse(opts.deadline))) {
    return { ok: false, error: "A valid deadline is required." };
  }

  const deadlineIso = new Date(opts.deadline).toISOString();
  const trimmedClientId = opts.clientId?.trim() ?? "";

  if (trimmedClientId) {
    return insertRequestsAndNotify({
      clientId: trimmedClientId,
      documentNames,
      deadline: deadlineIso,
      containerNumber: opts.containerNumber,
      blNumber: opts.blNumber,
      route: opts.route,
    });
  }

  const trimmedClientName = opts.clientName?.trim() ?? "";
  const trimmedClientEmail = opts.clientEmail?.trim().toLowerCase() ?? "";

  if (!trimmedClientName || !EMAIL_PATTERN.test(trimmedClientEmail)) {
    return { ok: false, error: "Select an existing client or provide a new client name and email." };
  }

  // Auth is not wired up yet, so new clients are linked to the first
  // forwarder record. A default forwarder is created automatically if none exists.
  const forwarderId = await resolveForwarderId();
  if (!forwarderId) {
    return { ok: false, error: "Failed to resolve the forwarder account." };
  }

  // Reuse the existing client if the email is already registered.
  const { data: existingClient } = await (await db())
    .from("clients")
    .select("id")
    .eq("email", trimmedClientEmail)
    .maybeSingle();

  const existingId = existingClient?.id;
  let clientId: string;

  if (typeof existingId === "string" && existingId.length > 0) {
    clientId = existingId;
  } else {
    const { data: insertedClient, error: clientInsertError } = await (await db())
      .from("clients")
      .insert({
        forwarder_id: forwarderId,
        name: trimmedClientName,
        email: trimmedClientEmail,
      })
      .select("id")
      .single();

    if (clientInsertError || !insertedClient) {
      console.error("Failed to create the client:", clientInsertError);
      return { ok: false, error: "Failed to create the client. Check the insert policy on the clients table." };
    }

    clientId = String(insertedClient.id);
  }

  return insertRequestsAndNotify({
    clientId,
    documentNames,
    deadline: deadlineIso,
    containerNumber: opts.containerNumber,
    blNumber: opts.blNumber,
    route: opts.route,
  });
}