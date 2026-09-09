"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { approveRequest, createBatchRequests, rejectRequest } from "./actions";

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

export type ClientOption = {
  id: string;
  name: string;
};

type DashboardProps = {
  requests: DashboardRequest[];
  clients: ClientOption[];
};

type StatusFilter = "all" | "pending" | "uploaded" | "completed" | "expired" | "rejected";

const STATUS_META: Record<string, { label: string; badge: string; dot: string }> = {
  pending: { label: "Pending", badge: "bg-yellow-500/10 text-yellow-600 ring-yellow-500/20", dot: "bg-yellow-500" },
  uploaded: { label: "Uploaded", badge: "bg-blue-500/10 text-blue-600 ring-blue-500/20", dot: "bg-blue-500" },
  completed: { label: "Completed", badge: "bg-green-500/10 text-green-600 ring-green-500/20", dot: "bg-green-500" },
  expired: { label: "Expired", badge: "bg-red-500/10 text-red-600 ring-red-500/20", dot: "bg-red-500" },
  rejected: { label: "Rejected", badge: "bg-rose-500/10 text-rose-600 ring-rose-500/20", dot: "bg-rose-500" },
};

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "uploaded", label: "Uploaded" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
  { value: "rejected", label: "Rejected" },
];

const PRESET_DOCUMENTS = ["Invoice", "Packing List", "VGM"];

const CARD =
  "rounded-2xl border border-neutral-200/20 bg-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] ring-1 ring-inset ring-white/60 backdrop-blur-sm transition-all duration-300";

const BADGE_SHADOW = "shadow-[0_0_10px_rgba(0,0,0,0.05)] ring-1 ring-inset";

const MODAL_FIELD =
  "mt-1.5 w-full rounded-xl border border-neutral-200/40 bg-white/80 px-3.5 py-2.5 text-sm text-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-inset ring-neutral-200/30 backdrop-blur-sm transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-zinc-700/40 dark:bg-zinc-950/60 dark:text-neutral-100 dark:ring-zinc-700/30";

function formatDeadline(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function RequestCard({ request }: { request: DashboardRequest }) {
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

  const meta = STATUS_META[request.status] ?? {
    label: request.status,
    badge: "bg-neutral-500/10 text-neutral-600 ring-neutral-500/20",
    dot: "bg-neutral-400",
  };
  const canReview = request.status === "uploaded";

  return (
    <li className={`${CARD} group hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5`}>
      <div className="flex flex-wrap items-start justify-between gap-6 px-6 py-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold tracking-tight">{request.clientName ?? "Unknown client"}</h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${BADGE_SHADOW} ${meta.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
          </div>
          {request.clientEmail && (
            <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{request.clientEmail}</p>
          )}
          <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">{request.documentName}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-neutral-400 dark:text-neutral-500">
            <ClockIcon />
            {request.deadline ? `Due ${formatDeadline(request.deadline)}` : "Deadline not set"}
          </p>
          {request.rejectionReason && request.status === "rejected" && (
            <p className="mt-3 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600 ring-1 ring-inset ring-rose-500/10 dark:text-rose-300">
              Rejected: {request.rejectionReason}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canReview && (
            <>
              {request.downloadUrl ? (
                <a
                  href={request.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/40 bg-white/70 px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-inset ring-white/40 backdrop-blur-sm transition-all duration-200 ease-out hover:bg-neutral-50 hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] dark:border-zinc-700/40 dark:bg-zinc-900/70 dark:text-neutral-200 dark:hover:bg-zinc-800"
                >
                  <DownloadIcon />
                  View / Download
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-neutral-200/60 px-3.5 py-2 text-sm text-neutral-400 dark:border-zinc-700/60 dark:text-neutral-500">
                  No file
                </span>
              )}
              <button
                type="button"
                onClick={() => { void handleApprove(); }}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all duration-200 ease-out hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] hover:brightness-105 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckIcon />
                Approve
              </button>
              <button
                type="button"
                onClick={() => { setReasonOpen((open) => !open); setError(null); }}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(244,63,94,0.3)] transition-all duration-200 ease-out hover:shadow-[0_6px_20px_rgba(244,63,94,0.4)] hover:brightness-105 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XIcon />
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-out ${reasonOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="mx-6 mb-5 rounded-2xl border border-neutral-200/40 bg-gradient-to-br from-neutral-50/90 to-white/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] ring-1 ring-inset ring-neutral-200/30 backdrop-blur-md dark:border-zinc-700/40 dark:from-zinc-900/80 dark:to-zinc-900/40 dark:ring-white/5">
              <label htmlFor={`reason-${request.id}`} className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Rejection reason
              </label>
              <textarea
                id={`reason-${request.id}`}
                rows={2}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={`${request.documentName} is wrong because...`}
                disabled={busy}
                className="mt-2 w-full resize-none rounded-xl border border-neutral-200/40 bg-white/80 p-3 text-sm text-neutral-800 shadow-[inset_0_1px_4px_rgba(0,0,0,0.04)] ring-1 ring-inset ring-neutral-200/30 backdrop-blur-sm transition-all duration-200 placeholder:text-neutral-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-zinc-700/40 dark:bg-zinc-950/60 dark:text-neutral-100 dark:ring-zinc-700/30"
              />
              {error && (
                <p className="mt-3 text-sm text-rose-500 dark:text-rose-300">{error}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => { void handleReject(); }}
                  disabled={busy || reason.trim().length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(244,63,94,0.3)] transition-all duration-200 ease-out hover:brightness-105 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Confirm rejection
                </button>
                <button
                  type="button"
                  onClick={() => { setReasonOpen(false); setError(null); }}
                  disabled={busy}
                  className="rounded-xl border border-neutral-200/40 bg-white/70 px-4 py-2 text-sm font-medium text-neutral-600 ring-inset ring-neutral-200/30 backdrop-blur-sm transition-all duration-200 ease-out hover:bg-neutral-50 hover:text-neutral-900 dark:border-zinc-700/40 dark:bg-zinc-900/70 dark:text-neutral-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
    </li>
  );
}

export default function DashboardClient({ requests, clients }: DashboardProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<{ headline: string; links: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [clientMode, setClientMode] = useState<"existing" | "new">(
    clients.length === 0 ? "new" : "existing",
  );
  const [formClientId, setFormClientId] = useState("");
  const [formNewClientName, setFormNewClientName] = useState("");
  const [formNewClientEmail, setFormNewClientEmail] = useState("");
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [otherDocs, setOtherDocs] = useState<string[]>([]);
  const [formDeadline, setFormDeadline] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesSearch = q === "" || (request.clientName ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    const result: Record<string, number> = {
      total: requests.length,
      pending: 0,
      uploaded: 0,
      completed: 0,
      expired: 0,
      rejected: 0,
    };
    for (const request of requests) {
      if (result[request.status] !== undefined) {
        result[request.status] += 1;
      }
    }
    return result;
  }, [requests]);

  async function handleCreate() {
    if (creating) {
      return;
    }
    const documentNames = [
      ...PRESET_DOCUMENTS.filter((preset) => selectedPresets.includes(preset)),
      ...otherDocs.map((name) => name.trim()).filter((name) => name.length > 0),
    ];
    const isNewClient = clients.length === 0 || clientMode === "new";
    if (isNewClient) {
      if (!formNewClientName.trim() || !formNewClientEmail.trim()) {
        setCreateError("Please fill in the client name and client email.");
        return;
      }
    } else if (!formClientId) {
      setCreateError("Please select a client.");
      return;
    }
    if (documentNames.length === 0) {
      setCreateError("Select at least one preset document or add a custom document name.");
      return;
    }
    if (!formDeadline) {
      setCreateError("Please pick a deadline.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      const result = await createBatchRequests({
        clientId: isNewClient ? undefined : formClientId,
        clientName: isNewClient ? formNewClientName.trim() : undefined,
        clientEmail: isNewClient ? formNewClientEmail.trim() : undefined,
        documentNames,
        deadline: formDeadline,
      });
      if (!result.ok) {
        setCreateError(result.error ?? "Failed to create the document request(s).");
        return;
      }
      setCreateSuccess({
        headline: result.email?.sent
          ? `${documentNames.length} request(s) created and email sent to the client.`
          : `${documentNames.length} request(s) created.`,
        links: result.links ?? [],
      });
      setSelectedPresets([]);
      setOtherDocs([]);
      setFormClientId("");
      setFormNewClientName("");
      setFormNewClientEmail("");
      setFormDeadline("");
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  function handleCopyLink(link: string) {
    void navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  }

  function handleCopyAllLinks(links: string[]) {
    void navigator.clipboard.writeText(links.join("\n")).then(() => {
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  }

  return (
    <div className="w-full">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400">
            FreightNudge
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 bg-clip-text text-transparent dark:from-white dark:via-neutral-300 dark:to-white">
              Forwarder Dashboard
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">
            Review document submissions, approve compliant documents, or start a new request cycle right from here.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setCreateOpen(true); setCreateError(null); setCreateSuccess(null); }}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] ring-1 ring-inset ring-white/20 transition-all duration-200 ease-out hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] hover:brightness-105 active:scale-[0.97]"
        >
          <PlusIcon />
          New Document Request
        </button>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { key: "total", label: "Total requests", value: counts.total, accent: "from-indigo-500/10 to-sky-500/5 text-indigo-600 dark:text-indigo-300" },
            { key: "pending", label: "Pending", value: counts.pending, accent: "from-yellow-500/10 to-amber-500/5 text-yellow-600 dark:text-yellow-300" },
            { key: "uploaded", label: "Uploaded", value: counts.uploaded, accent: "from-blue-500/10 to-sky-500/5 text-blue-600 dark:text-blue-300" },
            { key: "completed", label: "Completed", value: counts.completed, accent: "from-green-500/10 to-emerald-500/5 text-green-600 dark:text-green-300" },
        ].map((stat) => (
          <div
            key={stat.key}
            className={`rounded-2xl border border-neutral-200/20 bg-gradient-to-br ${stat.accent} p-4 ring-1 ring-inset ring-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-extrabold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => { setStatusFilter(filter.value); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-out ${
                statusFilter === filter.value
                  ? "bg-neutral-900 text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] ring-1 ring-inset ring-white/10 dark:bg-white dark:text-neutral-900"
                  : "bg-white/70 text-neutral-600 ring-1 ring-inset ring-neutral-200/40 backdrop-blur-sm hover:bg-neutral-50 dark:bg-zinc-900/70 dark:text-neutral-300 dark:hover:bg-zinc-800"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-neutral-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by client name..."
            className="w-full rounded-xl bg-white/70 py-2.5 pl-10 pr-4 text-sm text-neutral-800 ring-1 ring-inset ring-neutral-200/40 backdrop-blur-sm transition-all duration-200 placeholder:text-neutral-400 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none dark:bg-zinc-900/70 dark:text-neutral-100 dark:ring-zinc-700/40"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300/40 bg-white/40 p-16 text-center backdrop-blur-sm dark:border-zinc-700/40 dark:bg-zinc-900/30">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-zinc-800">
            <SearchIcon />
          </div>
          <p className="mt-4 font-medium text-neutral-600 dark:text-neutral-300">No matching document requests</p>
          <p className="mt-1 text-sm text-neutral-400">Try adjusting the filters or search query.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </ul>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => { setCreateOpen(false); setCreateError(null); setCreateSuccess(null); }}
            className="animate-fade-in absolute inset-0 h-full w-full cursor-default bg-neutral-950/40 backdrop-blur-sm"
          />
          <div className="animate-modal-pop relative w-full max-w-lg rounded-2xl border border-neutral-200/40 bg-white/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/60 backdrop-blur-md dark:border-zinc-700/40 dark:bg-zinc-900/90">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">New Document Request</h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  The client will receive one email with a secure upload link for every selected document.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => { setCreateOpen(false); setCreateError(null); setCreateSuccess(null); }}
                className="rounded-lg p-1.5 text-neutral-400 transition-all duration-200 ease-out hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-zinc-800 dark:hover:text-neutral-200"
              >
                <XIcon />
              </button>
            </div>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreate();
              }}
            >
              {clients.length === 0 || clientMode === "new" ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-dashed border-indigo-300/40 bg-indigo-500/5 p-3.5 text-sm text-indigo-600 dark:border-indigo-500/30 dark:text-indigo-300">
                    {clients.length === 0
                      ? "No clients yet. Add your first client below and the request will be created for them."
                      : "Adding a new client. They will be saved to your clients list automatically."}
                  </div>
                  <div>
                    <label htmlFor="create-new-client-name" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      Client name
                    </label>
                    <input
                      id="create-new-client-name"
                      type="text"
                      value={formNewClientName}
                      onChange={(event) => setFormNewClientName(event.target.value)}
                      placeholder="e.g. Acme Logistics"
                      disabled={creating}
                      className={MODAL_FIELD}
                    />
                  </div>
                  <div>
                    <label htmlFor="create-new-client-email" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      Client email
                    </label>
                    <input
                      id="create-new-client-email"
                      type="email"
                      value={formNewClientEmail}
                      onChange={(event) => setFormNewClientEmail(event.target.value)}
                      placeholder="e.g. ops@acmelogistics.com"
                      disabled={creating}
                      className={MODAL_FIELD}
                    />
                  </div>
                  {clients.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setClientMode("existing"); setFormNewClientName(""); setFormNewClientEmail(""); }}
                      disabled={creating}
                      className="text-sm font-medium text-neutral-500 transition-all duration-200 ease-out hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                      Use an existing client instead
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="create-client" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Client
                  </label>
                  <select
                    id="create-client"
                    value={formClientId}
                    onChange={(event) => setFormClientId(event.target.value)}
                    disabled={creating}
                    className={MODAL_FIELD}
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => { setClientMode("new"); setFormClientId(""); }}
                    disabled={creating}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-all duration-200 ease-out hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <PlusIcon />
                    Add new client
                  </button>
                </div>
              )}
                <fieldset>
                  <legend className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Documents</legend>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {PRESET_DOCUMENTS.map((preset) => {
                      const checked = selectedPresets.includes(preset);
                      return (
                        <label
                          key={preset}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
                            checked
                              ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 shadow-[0_0_10px_rgba(99,102,241,0.15)] dark:text-indigo-300"
                              : "border-neutral-200/40 bg-white/70 text-neutral-600 hover:bg-neutral-50 dark:border-zinc-700/40 dark:bg-zinc-900/60 dark:text-neutral-300 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={creating}
                            onChange={(event) => {
                              setSelectedPresets((current) =>
                                event.target.checked
                                  ? [...current, preset]
                                  : current.filter((value) => value !== preset),
                              );
                            }}
                            className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500/40 dark:border-zinc-600"
                          />
                          {preset}
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                      Other documents
                    </p>
                    {otherDocs.map((value, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={value}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setOtherDocs((current) =>
                              current.map((entry, entryIndex) => (entryIndex === index ? nextValue : entry)),
                            );
                          }}
                          placeholder="e.g. Bill of Lading"
                          disabled={creating}
                          className={MODAL_FIELD}
                        />
                        <button
                          type="button"
                          aria-label="Remove document"
                          onClick={() => { setOtherDocs((current) => current.filter((_, i) => i !== index)); }}
                          disabled={creating}
                          className="shrink-0 rounded-lg p-2 text-neutral-400 transition-all duration-200 ease-out hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XIcon />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => { setOtherDocs((current) => [...current, ""]); }}
                      disabled={creating}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-neutral-300/60 px-3 py-2 text-sm font-medium text-indigo-600 transition-all duration-200 ease-out hover:border-indigo-400/60 hover:bg-indigo-500/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700/60 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                    >
                      <PlusIcon />
                      Add custom document
                    </button>
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="create-deadline" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Deadline
                  </label>
                  <input
                    id="create-deadline"
                    type="datetime-local"
                    value={formDeadline}
                    onChange={(event) => setFormDeadline(event.target.value)}
                    disabled={creating}
                    className={MODAL_FIELD}
                  />
                </div>

                {createError && (
                  <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600 ring-1 ring-inset ring-rose-500/10 dark:text-rose-300">
                    {createError}
                  </p>
                )}

                {createSuccess && (
                  <div className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-300">
                    <p className="font-semibold">{createSuccess.headline}</p>
                    {createSuccess.links.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {createSuccess.links.map((link) => (
                          <li key={link} className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 break-all text-xs">{link}</span>
                            <button
                              type="button"
                              onClick={() => { handleCopyLink(link); }}
                              className="shrink-0 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/20 transition-all duration-200 ease-out hover:bg-white dark:bg-zinc-900/60 dark:text-emerald-300 dark:hover:bg-zinc-900"
                            >
                              Copy
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {createSuccess.links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => { handleCopyAllLinks(createSuccess.links); }}
                        className="mt-3 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/20 transition-all duration-200 ease-out hover:bg-white dark:bg-zinc-900/60 dark:text-emerald-300 dark:hover:bg-zinc-900"
                      >
                        {copied ? "Copied!" : "Copy all links"}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => { setCreateOpen(false); setCreateError(null); setCreateSuccess(null); }}
                    disabled={creating}
                    className="rounded-xl border border-neutral-200/40 bg-white/70 px-4 py-2 text-sm font-medium text-neutral-600 ring-1 ring-inset ring-neutral-200/30 backdrop-blur-sm transition-all duration-200 ease-out hover:bg-neutral-50 hover:text-neutral-900 dark:border-zinc-700/40 dark:bg-zinc-900/70 dark:text-neutral-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)] ring-1 ring-inset ring-white/20 transition-all duration-200 ease-out hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] hover:brightness-105 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Request"}
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}