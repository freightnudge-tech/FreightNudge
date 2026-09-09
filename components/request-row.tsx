"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Download, FileText, History, X } from "lucide-react";

import { Badge } from "@/components/console-bits";

import { approveRequest, rejectRequest } from "@/app/dashboard/actions";

export type DashboardRequest = {
  id: string;
  clientName: string | null;
  clientEmail: string | null;
  documentName: string;
  deadline: string | null;
  status: string;
  downloadUrl: string | null;
  rejectionReason: string | null;
};

export type StatusFilter = "all" | "pending" | "uploaded" | "completed" | "expired" | "rejected";

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "uploaded", label: "Uploaded" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_TONE: Record<string, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "amber" },
  uploaded: { label: "Uploaded", tone: "indigo" },
  completed: { label: "Completed", tone: "green" },
  expired: { label: "Expired", tone: "rose" },
  rejected: { label: "Rejected", tone: "rose" },
};

export function formatDeadline(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RequestRow({ request, onExportAudit }: { request: DashboardRequest; onExportAudit?: () => void; }) {
  const router = useRouter();
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setBusy(true);
    setError(null);
    try {
      const result = await approveRequest(request.id);
      if (!result.ok) {
        setError(result.error ?? "Failed to approve the request.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (busy) return;
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please provide a rejection reason.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await rejectRequest(request.id, trimmed);
      if (!result.ok) {
        setError(result.error ?? "Failed to reject the request.");
        return;
      }
      setReason("");
      setReasonOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const meta = STATUS_TONE[request.status] ?? { label: request.status, tone: "slate" };
  const canReview = request.status === "uploaded";

  return (
    <>
      <tr>
        <td>
          <div className="shipment">
            <span>
              <b>{request.clientName ?? "Unknown client"}</b>
              <small>{request.clientEmail ?? "—"}</small>
            </span>
          </div>
        </td>
        <td className="shipment-id">#{request.id.slice(0, 8)}</td>
        <td>
          <span className="doc">
            <FileText />
            {request.documentName}
          </span>
          <small className="due">Due {request.deadline ? formatDeadline(request.deadline) : "—"}</small>
        </td>
        <td>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </td>
        <td>
          {request.status === "rejected" && request.rejectionReason ? (
            <span className="channel" title={request.rejectionReason}>
              <X />
              <span className="fn-truncate">{request.rejectionReason}</span>
            </span>
          ) : (
            <span className="channel">
              <Clock />
              {request.deadline ? formatDeadline(request.deadline) : "No deadline"}
            </span>
          )}
        </td>
        <td>
          <div className="row-actions-cell">
            {canReview ? (
              <>
                {request.downloadUrl ? (
                  <a
                    className="row-action"
                    href={request.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View or download the uploaded document"
                    title="View / download"
                  >
                    <Download />
                  </a>
                ) : (
                  <span className="row-action is-muted" title="No file attached yet">
                    <Download />
                  </span>
                )}
                <button
                  type="button"
                  className="row-action"
                  onClick={() => { void handleApprove(); }}
                  disabled={busy}
                  aria-label="Approve document"
                  title="Approve"
                >
                  <Check />
                </button>
                <button
                  type="button"
                  className="row-action"
                  onClick={() => { setReasonOpen((open) => !open); setError(null); }}
                  disabled={busy}
                  aria-label="Reject document"
                  title="Reject"
                >
                  <X />
                </button>
                <button
                  type="button"
                  className="manual"
                  onClick={() => { setReasonOpen((open) => !open); setError(null); }}
                  disabled={busy}
                >
                  Review
                </button>
                <button
                  type="button"
                  className="row-action"
                  onClick={() => { onExportAudit?.(); }}
                  aria-label="Export audit trail"
                  title="Export audit trail"
                >
                  <History />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="row-action"
                onClick={() => { onExportAudit?.(); }}
                aria-label="Export audit trail"
                title="Export audit trail"
              >
                <History />
              </button>
            )}
          </div>
        </td>
      </tr>
      {reasonOpen && (
        <tr>
          <td colSpan={6} className="fn-reason-cell">
            <div className="fn-reason-panel">
              <label htmlFor={`reason-${request.id}`}>Rejection reason</label>
              <textarea
                id={`reason-${request.id}`}
                rows={2}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={`${request.documentName} is wrong because...`}
                disabled={busy}
              />
              {error && <p className="fn-reason-error">{error}</p>}
              <div className="fn-reason-actions">
                <button
                  type="button"
                  className="cta"
                  onClick={() => { void handleReject(); }}
                  disabled={busy || reason.trim().length === 0}
                >
                  Confirm rejection
                </button>
                <button
                  type="button"
                  className="fn-btn-ghost"
                  onClick={() => { setReasonOpen(false); setError(null); }}
                  disabled={busy}
                >
                  Cancel
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}