import { randomUUID } from "crypto";

import { NextResponse } from "next/server";
import { Resend } from "resend";

import { supabase } from "@/lib/supabase";

type CreateRequestBody = {
  client_id: string;
  document_name: string;
  deadline: string;
};

type ClientInfo = {
  name: string;
  email: string;
};

async function fetchClient(clientId: string): Promise<{ client: ClientInfo | null; error: string | null }> {
  const { data, error } = await supabase
    .from("clients")
    .select("name, email")
    .eq("id", clientId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch client:", error);
    return { client: null, error: "Failed to fetch client information" };
  }

  if (!data) {
    return { client: null, error: "Client not found" };
  }

  return { client: { name: data.name, email: data.email }, error: null };
}

function buildUploadLink(uploadLinkToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/upload/${uploadLinkToken}`;
}

function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { client_id, document_name, deadline } = (body ?? {}) as Partial<CreateRequestBody>;

  if (
    typeof client_id !== "string" ||
    client_id.trim() === "" ||
    typeof document_name !== "string" ||
    document_name.trim() === "" ||
    typeof deadline !== "string" ||
    deadline.trim() === "" ||
    Number.isNaN(Date.parse(deadline))
  ) {
    return NextResponse.json(
      { error: "client_id, document_name and a valid deadline are required" },
      { status: 400 }
    );
  }

  const upload_link_token = randomUUID();

  const { data: createdRequest, error: insertError } = await supabase
    .from("document_requests")
    .insert({
      client_id,
      document_name,
      deadline: new Date(deadline).toISOString(),
      status: "pending",
      upload_link_token,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to create document request:", insertError);
    return NextResponse.json(
      { error: "Failed to create document request" },
      { status: 500 }
    );
  }

  const { client, error: clientError } = await fetchClient(client_id);

  if (!client) {
    return NextResponse.json(
      {
        ...createdRequest,
        email: {
          status: "error",
          error: clientError ?? "Client not found",
        },
      },
      { status: 201 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not configured; skipping email send");
    return NextResponse.json(
      {
        ...createdRequest,
        email: { status: "error", error: "RESEND_API_KEY is not configured" },
      },
      { status: 201 }
    );
  }

  const resend = new Resend(resendApiKey);

  const uploadLink = buildUploadLink(upload_link_token);
  const formattedDeadline = formatDeadline(createdRequest.deadline);

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: "FreightNudge <onboarding@resend.dev>",
    to: client.email,
    subject: `Document request: ${createdRequest.document_name}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1a1a1a;">
        <h2 style="margin-bottom: 16px;">Document request</h2>
        <p>Hello ${client.name},</p>
        <p>
          The forwarder has requested a document from you. Please upload it before the deadline:
        </p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 12px; background: #f4f4f5; font-weight: 600;">Document</td>
            <td style="padding: 8px 12px;">${createdRequest.document_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #f4f4f5; font-weight: 600;">Deadline</td>
            <td style="padding: 8px 12px;">${formattedDeadline}</td>
          </tr>
        </table>
        <p>Use the link below to upload your document:</p>
        <p>
          <a
            href="${uploadLink}"
            style="display: inline-block; padding: 12px 20px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;"
          >
            Upload Document
          </a>
        </p>
        <p style="font-size: 13px; color: #6b7280;">
          Or copy and paste this URL into your browser: <span style="word-break: break-all;">${uploadLink}</span>
        </p>
      </div>
    `,
  });

  if (emailError) {
    console.error("Failed to send request email:", emailError);
    return NextResponse.json(
      {
        ...createdRequest,
        email: {
          status: "error",
          error: "Failed to send request email",
        },
      },
      { status: 201 }
    );
  }

  return NextResponse.json(
    {
      ...createdRequest,
      email: {
        status: "sent",
        id: emailData?.id ?? null,
      },
    },
    { status: 201 }
  );
}
