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

function getStatusBadgeClass(status: string): string {
  if (status === "uploaded") {
    return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  }
  if (status === "pending") {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  }
  return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
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
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-zinc-500">
            We could not load the document request. Please try again later.
          </p>
        </div>
      </main>
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
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold">Upload Document</h1>
        <p className="mt-1 text-sm text-zinc-500">
          A forwarder has requested the following document from you. Please upload it before the deadline.
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Document</dt>
            <dd className="mt-1 break-words font-medium">{requestRecord.document_name}</dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Status</dt>
            <dd className="mt-1">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(statusLabel)}`}>
                {statusLabel}
              </span>
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900 sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Deadline</dt>
            <dd className="mt-1 font-medium">{deadlineLabel}</dd>
          </div>
        </dl>

        <UploadForm requestId={requestRecord.id} />
      </div>
    </main>
  );
}