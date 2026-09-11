import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

import UploadForm from "./upload-form";

type UploadPageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusTone(status: string): string {
  if (status === "uploaded") {
    return "green";
  }
  if (status === "pending") {
    return "amber";
  }
  return "slate";
}

type UploadRequestRow = {
  request_id: string;
  document_name: string;
  deadline: string | null;
  status: string;
  opened_at: string | null;
  client_id: string;
  client_name: string | null;
  client_email: string | null;
  forwarder_id: string;
  forwarder_display_name: string | null;
  forwarder_logo_path: string | null;
};

export default async function UploadPage({ params }: UploadPageProps) {
  const { token } = await params;

  // Token-matched SECURITY DEFINER RPC: anonymous visitors can only read the
  // single request their link token points at — never the table at large.
  // get_upload_request has LIMIT 1, so the result is a 0/1-row array.
  const { data: rpcData, error } = await supabase.rpc("get_upload_request", { p_token: token });
  const requestRecord = (rpcData as UploadRequestRow[] | null)?.[0] ?? null;

  if (error) {
    console.error("Failed to fetch document request:", error);
    return (
      <div className="fn-shell fn-stack">
        <main className="fn-center">
          <div className="fn-card" style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
            <h1 className="fn-card-title">Something went wrong</h1>
            <p className="fn-card-sub">We could not load the document request. Please try again later.</p>
          </div>
        </main>
      </div>
    );
  }

  if (!requestRecord) {
    notFound();
  }

  // When the link is opened for the first time, timestamp the open so the
  // forwarder can see whether (and when) the client viewed the request.
  // Matched by token via RPC — no direct anonymous UPDATE exists on the table.
  const { error: openError } = await supabase
    .rpc("mark_upload_opened", { p_token: token });

  if (openError) {
    console.error("Failed to record link open:", openError);
  }

  const deadlineLabel = requestRecord.deadline ? formatDeadline(requestRecord.deadline) : "Not set";

  const statusLabel = typeof requestRecord.status === "string" ? requestRecord.status : "unknown";

  // Branding comes straight from the RPC result (joined server-side), so this
  // page performs exactly one anonymous read for the whole render.
  const forwarder = requestRecord.forwarder_display_name
    ? String(requestRecord.forwarder_display_name)
    : "FreightNudge";
  const brandLogoUrl = requestRecord.forwarder_logo_path
    ? supabase.storage
        .from("branding")
        .getPublicUrl(String(requestRecord.forwarder_logo_path)).data.publicUrl
    : null;

  return (
    <div className="fn-shell fn-stack">
      <main className="fn-center">
        <div className="fn-card" style={{ maxWidth: 640, width: "100%" }}>
          <div className="brand">
            {brandLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brandLogoUrl} alt={`${forwarder} logo`} className="brand-logo" />
            ) : (
              <span className="brand-mark">{forwarder.charAt(0).toUpperCase()}</span>
            )}
            <span>
              <strong>{forwarder}</strong>
              <small>Secure document upload</small>
            </span>
          </div>

          <h1 className="fn-card-title" style={{ marginTop: 14 }}>Upload Document</h1>
          <p className="fn-card-sub">
            {forwarder} has requested the following document from you. Please upload it before the deadline.
          </p>

          <dl className="fn-row-2col" style={{ marginTop: 20 }}>
            <div className="fn-tile">
              <dt>Document</dt>
              <dd>{requestRecord.document_name}</dd>
            </div>
            <div className="fn-tile">
              <dt>Status</dt>
              <dd>
                <span className={`badge ${getStatusTone(statusLabel)}`}>
                  <i />
                  {statusLabel}
                </span>
              </dd>
            </div>
            <div className="fn-tile" style={{ gridColumn: "1 / -1" }}>
              <dt>Deadline</dt>
              <dd className="channel">{deadlineLabel}</dd>
            </div>
          </dl>

          <UploadForm requestId={requestRecord.request_id} token={token} />

          <p className="powered-by">
            Powered by FreightNudge
          </p>
        </div>
      </main>
    </div>
  );
}