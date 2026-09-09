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

export default async function UploadPage({ params }: UploadPageProps) {
  const { token } = await params;

  const { data: requestRecord, error } = await supabase
    .from("document_requests")
    .select("*")
    .eq("upload_link_token", token)
    .maybeSingle();

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

  // When the link is opened for the first time, timestamp the open so the forwarder
  // can see whether (and when) the client viewed the request.
  if (!requestRecord.opened_at) {

    const { error: openError } = await supabase
      .from("document_requests")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", requestRecord.id);

    if (openError) {
      console.error("Failed to record link open:", openError);
    }
  }

  const deadlineLabel = requestRecord.deadline ? formatDeadline(requestRecord.deadline) : "Not set";

  const statusLabel = typeof requestRecord.status === "string" ? requestRecord.status : "unknown";

  return (
    <div className="fn-shell fn-stack">
      <main className="fn-center">
        <div className="fn-card" style={{ maxWidth: 640, width: "100%" }}>
          <div className="brand">
            <span className="brand-mark">F</span>
            <span>
              <strong>
                Freight<span>Nudge</span>
              </strong>
              <small>Secure document upload</small>
            </span>
          </div>

          <h1 className="fn-card-title" style={{ marginTop: 14 }}>Upload Document</h1>
          <p className="fn-card-sub">
            A forwarder has requested the following document from you. Please upload it before the deadline.
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

          <UploadForm requestId={requestRecord.id} />
        </div>
      </main>
    </div>
  );
}