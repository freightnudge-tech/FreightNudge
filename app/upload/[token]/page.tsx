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

  // Resolve the forwarder who owns this request via client → forwarder, so the
  // upload page can show their branding instead of generic FreightNudge marks.
  let forwarder = "FreightNudge";
  let brandLogoUrl: string | null = null;

  if (requestRecord.client_id) {
    const { data: clientRecord } = await supabase
      .from("clients")
      .select("forwarder_id")
      .eq("id", requestRecord.client_id)
      .maybeSingle();

    if (clientRecord?.forwarder_id) {
      // Reads the forwarder_branding view (id, display_name, logo_path) rather
      // than the base table: this page is viewed by anonymous visitors, and
      // the view is the only publicly readable surface for branding data.
      const { data: forwarderRecord } = await supabase
        .from("forwarder_branding")
        .select("display_name, logo_path")
        .eq("id", clientRecord.forwarder_id)
        .maybeSingle();

      if (forwarderRecord?.display_name) {
        forwarder = String(forwarderRecord.display_name);
      }
      if (forwarderRecord?.logo_path) {
        brandLogoUrl = supabase.storage
          .from("branding")
          .getPublicUrl(String(forwarderRecord.logo_path)).data.publicUrl;
      }
    }
  }

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

          <UploadForm requestId={requestRecord.id} />

          <p className="powered-by">
            Powered by FreightNudge
          </p>
        </div>
      </main>
    </div>
  );
}