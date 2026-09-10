"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  LifeBuoy,
  Mail,
  MoreHorizontal,
  Plus,
  Send,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

import ConsoleShell, { type ShellAccount } from "@/components/console-shell";
import { Badge, Metric } from "@/components/console-bits";
import { RequestRow, STATUS_FILTERS, type DashboardRequest, type StatusFilter } from "@/components/request-row";

import { createBatchRequests } from "./actions";

export type { DashboardRequest } from "@/components/request-row";

export type ClientOption = {
  id: string;
  name: string;
};

type ConsoleProps = {
  requests: DashboardRequest[];
  clients: ClientOption[];
  loadError?: boolean;
  isAdmin?: boolean;
  account?: ShellAccount;
};

const PRESET_DOCUMENTS = ["Invoice", "Packing List", "VGM"];

// Decorative trend bars for the metric strip (visual layer only).
const SPARK_OPEN = [30, 40, 35, 53, 46, 61, 57, 72, 65, 82];
const SPARK_UP = [45, 42, 58, 55, 68, 64, 72, 78, 85, 91];
const SPARK_DOWN = [84, 78, 73, 68, 60, 55, 49, 45, 38, 32];

export default function DashboardConsole({ requests, clients, loadError = false, isAdmin = false, account }: ConsoleProps) {
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
  const [formShipmentId, setFormShipmentId] = useState("");
  const [formContainerNumber, setFormContainerNumber] = useState("");
  const [formBlNumber, setFormBlNumber] = useState("");
  const [formRoute, setFormRoute] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

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

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const haystack = `${request.clientName ?? ""} ${request.clientEmail ?? ""} ${request.documentName} ${request.id} ${request.shipmentId ?? ""} ${request.containerNumber ?? ""} ${request.blNumber ?? ""} ${request.route ?? ""}`.toLowerCase();
      const matchesSearch = q === "" || haystack.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchQuery]);

  const shipmentGroups = useMemo(() => {
    const groups: Record<string, DashboardRequest[]> = {};
    const ungrouped: DashboardRequest[] = [];
    for (const request of filtered) {
      const sid = (request as DashboardRequest & { shipmentId?: string }).shipmentId?.trim();
      if (sid) {
        if (!groups[sid]) groups[sid] = [];
        groups[sid].push(request);
      } else {
        ungrouped.push(request);
      }
    }
    return { groups, ungrouped };
  }, [filtered]);

  const attentionCount = counts.expired + counts.rejected;
  const completionRate = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
  const hasActiveFilters = statusFilter !== "all" || searchQuery.trim() !== "";
  const todayLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  const atRisk = useMemo(
    () => requests.filter((request) => request.status === "expired" || request.status === "rejected").slice(0, 3),
    [requests],
  );
  const feed = requests.slice(0, 3);

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
        containerNumber: formContainerNumber.trim(),
        blNumber: formBlNumber.trim(),
        route: formRoute.trim(),
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
      setFormShipmentId("");
      setFormContainerNumber("");
      setFormBlNumber("");
      setFormRoute("");
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

  function openCreate() {
    setCreateOpen(true);
    setCreateError(null);
    setCreateSuccess(null);
  }

  function closeCreate() {
    if (creating) return;
    setCreateOpen(false);
    setCreateError(null);
    setCreateSuccess(null);
  }

  function scrollToTracker() {
    document.getElementById("fn-tracker")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reviewExceptions() {
    setStatusFilter(counts.expired > 0 ? "expired" : "rejected");
    scrollToTracker();
  }

  function clearFilters() {
    setStatusFilter("all");
    setSearchQuery("");
  }

  const ringStyle = {
    background: `conic-gradient(var(--green) 0 ${completionRate}%, #27303b ${completionRate}% 100%)`,
  };
  const miniBars = [counts.completed, counts.uploaded, counts.pending, counts.expired, counts.rejected].map(
    (value) => (counts.total > 0 ? Math.max(10, Math.round((value / counts.total) * 100)) : 10),
  );

  const FEED_META: Record<string, { eventClass: string; word: string; badge: string; tone: string }> = {
    completed: { eventClass: "event complete", word: "collected", badge: "Collected", tone: "green" },
    uploaded: { eventClass: "event active", word: "awaiting review", badge: "In review", tone: "indigo" },
    pending: { eventClass: "event", word: "sent", badge: "Queued", tone: "slate" },
    expired: { eventClass: "event", word: "expired", badge: "Expired", tone: "rose" },
    rejected: { eventClass: "event", word: "rejected", badge: "Rejected", tone: "rose" },
  };

  function feedNode(status: string) {
    if (status === "completed") return <Check />;
    if (status === "uploaded") return <Send />;
    if (status === "pending") return <Mail />;
    if (status === "expired") return <AlertTriangle />;
    return <X />;
  }

  const createModal = (
    <div className="fn-modal-backdrop">
      <button type="button" aria-label="Close dialog" onClick={closeCreate} className="fn-modal-backdrop-btn animate-fade-in" />
      <div className="fn-modal-panel animate-modal-pop">
        <div className="fn-modal-head">
          <div>
            <h2>New document request</h2>
            <p className="fn-modal-sub">
              The client will receive one email with a secure upload link for every selected document.
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={closeCreate} className="fn-icon-btn">
            <X />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleCreate();
          }}
        >
          {clients.length === 0 || clientMode === "new" ? (
            <div>
              <p className="fn-note mt-4">
                {clients.length === 0
                  ? "No clients yet. Add your first client below and the request will be created for them."
                  : "Adding a new client. They will be saved to your clients list automatically."}
              </p>
              <div className="fn-field">
                <label htmlFor="create-new-client-name">Client name</label>
                <input
                  id="create-new-client-name"
                  type="text"
                  value={formNewClientName}
                  onChange={(event) => setFormNewClientName(event.target.value)}
                  placeholder="e.g. Acme Logistics"
                  disabled={creating}
                  className="fn-input"
                />
              </div>
              <div className="fn-field">
                <label htmlFor="create-new-client-email">Client email</label>
                <input
                  id="create-new-client-email"
                  type="email"
                  value={formNewClientEmail}
                  onChange={(event) => setFormNewClientEmail(event.target.value)}
                  placeholder="e.g. ops@acmelogistics.com"
                  disabled={creating}
                  className="fn-input"
                />
              </div>
              {clients.length > 0 && (
                <button
                  type="button"
                  className="fn-link-btn mt-3"
                  onClick={() => { setClientMode("existing"); setFormNewClientName(""); setFormNewClientEmail(""); }}
                  disabled={creating}
                >
                  Use an existing client instead
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="fn-field">
                <label htmlFor="create-client">Client</label>
                <select
                  id="create-client"
                  value={formClientId}
                  onChange={(event) => setFormClientId(event.target.value)}
                  disabled={creating}
                  className="fn-input"
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="fn-add-btn"
                onClick={() => { setClientMode("new"); setFormClientId(""); }}
                disabled={creating}
              >
                <Plus />
                Add new client
              </button>
            </div>
          )}

          <div className="fn-field">
            <span className="fn-field-label">Documents</span>
            <div className="fn-chip-grid">
              {PRESET_DOCUMENTS.map((preset) => {
                const checked = selectedPresets.includes(preset);
                return (
                  <label key={preset} className={`fn-chip ${checked ? "on" : ""}`}>
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
                    />
                    {preset}
                  </label>
                );
              })}
            </div>

            {otherDocs.map((value, index) => (
              <div key={index} className="fn-doc-row">
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
                  className="fn-input"
                />
                <button
                  type="button"
                  aria-label="Remove document"
                  onClick={() => { setOtherDocs((current) => current.filter((_, i) => i !== index)); }}
                  disabled={creating}
                  className="fn-icon-btn danger"
                >
                  <X />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => { setOtherDocs((current) => [...current, ""]); }}
              disabled={creating}
              className="fn-add-btn"
            >
              <Plus />
              Add custom document
            </button>
          </div>

          <div className="fn-field">
            <label htmlFor="create-deadline">Deadline</label>
            <input
              id="create-deadline"
              type="datetime-local"
              value={formDeadline}
              onChange={(event) => setFormDeadline(event.target.value)}
              disabled={creating}
              className="fn-input"
            />
          </div>

          <div className="fn-field">
            <label htmlFor="create-shipment-id">
              Shipment ID <span className="fn-optional">optional</span>
            </label>
            <input
              id="create-shipment-id"
              type="text"
              value={formShipmentId}
              onChange={(event) => setFormShipmentId(event.target.value)}
              placeholder="e.g. SHP-2026-0042"
              disabled={creating}
              className="fn-input mono"
            />
            <span className="fn-field-hint">Groups related documents together in the tracker.</span>
          </div>

          <div className="fn-field">
            <label htmlFor="create-container-number">
              Container number <span className="fn-optional">optional</span>
            </label>
            <input
              id="create-container-number"
              type="text"
              value={formContainerNumber}
              onChange={(event) => setFormContainerNumber(event.target.value)}
              placeholder="e.g. MSKU1234567"
              disabled={creating}
              className="fn-input mono"
            />
          </div>

          <div className="fn-field">
            <label htmlFor="create-bl-number">
              BL number <span className="fn-optional">optional</span>
            </label>
            <input
              id="create-bl-number"
              type="text"
              value={formBlNumber}
              onChange={(event) => setFormBlNumber(event.target.value)}
              placeholder="e.g. HLCU1234567"
              disabled={creating}
              className="fn-input mono"
            />
          </div>

          <div className="fn-field">
            <label htmlFor="create-route">
              Route <span className="fn-optional">optional</span>
            </label>
            <input
              id="create-route"
              type="text"
              value={formRoute}
              onChange={(event) => setFormRoute(event.target.value)}
              placeholder="e.g. Rotterdam → Newark"
              disabled={creating}
              className="fn-input"
            />
          </div>

          {createError && <p className="fn-banner-error mt-3.5">{createError}</p>}

          {createSuccess && (
            <div className="fn-banner-success mt-3.5">
              <p className="fn-success-head">{createSuccess.headline}</p>
              {createSuccess.links.length > 0 && (
                <ul>
                  {createSuccess.links.map((link) => (
                    <li key={link}>
                      <span className="fn-link">{link}</span>
                      <button type="button" onClick={() => { handleCopyLink(link); }} className="fn-copy-btn">
                        Copy
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {createSuccess.links.length > 1 && (
                <button type="button" onClick={() => { handleCopyAllLinks(createSuccess.links); }} className="fn-copy-btn mt-2.5">
                  {copied ? "Copied!" : "Copy all links"}
                </button>
              )}
            </div>
          )}

          <div className="fn-modal-footer">
            <button type="button" className="fn-btn-ghost" onClick={closeCreate} disabled={creating}>
              Close
            </button>
            <button type="submit" className="cta" disabled={creating}>
              <Zap />
              {creating ? "Creating..." : "Create request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <ConsoleShell
      pageName="Command center"
      searchValue={searchQuery}
      isAdmin={isAdmin}
      account={account}
      onSearchChange={setSearchQuery}
      counts={{ requests: counts.total, clients: clients.length, pending: counts.pending }}
      onHealthAction={scrollToTracker}
      healthActionLabel="View request queue"
    >

      {loadError && (
        <div className="fn-banner-error">Failed to load document requests. Please check the database setup.</div>
      )}

      <section className="intro">
            <div>
              <p className="kicker">
                <span className="live" />
                Live operations / {todayLabel}
              </p>
              <h1>Forwarder Operations Console</h1>
              <p>Every document request, client upload, and exception in one operational view.</p>
            </div>
            <button type="button" className="cta" onClick={openCreate}>
              <Zap />
              New request
            </button>
          </section>

          <section className="metrics">
            <Metric
              label="Document requests"
              value={String(counts.total)}
              note={`${counts.pending} awaiting client upload`}
              change={`${counts.pending} open`}
              tone="indigo"
              values={SPARK_OPEN}
            />
            <Metric
              label="Collection rate"
              value={`${completionRate}%`}
              note="requests completed"
              change={counts.completed > 0 ? "on track" : "—"}
              tone="green"
              values={SPARK_UP}
            />
            <Metric
              label="Ready for review"
              value={String(counts.uploaded)}
              note="client files awaiting decision"
              change="review"
              tone="indigo"
              values={[37, 44, 41, 55, 62, 58, 70, 66, 78, 74]}
            />
            <Metric
              label="Needs attention"
              value={String(attentionCount)}
              note="expired or rejected requests"
              change={attentionCount > 0 ? "urgent" : "clear"}
              tone="rose"
              values={SPARK_DOWN}
            />
          </section>

          <section className="bento">
            <article className="risk-card">
              <div className="card-top">
                <div>
                  <p className="kicker danger">Requires attention</p>
                  <h2>At-risk documents</h2>
                </div>
                <span className="risk-count">{attentionCount}</span>
              </div>
              <div className="risk-list">
                {atRisk.length === 0 ? (
                  <p className="risk-empty">No exceptions — every request is on track.</p>
                ) : (
                  atRisk.map((request) => (
                    <div key={request.id}>
                      <span className={`risk-icon ${request.status === "rejected" ? "amber" : ""}`}>
                        <AlertTriangle />
                      </span>
                      <span>
                        <b>{request.documentName}</b>
                        <small>
                          {request.clientName ?? "Unknown client"} · {request.status === "expired" ? "overdue" : "rejected"}
                        </small>
                      </span>
                      <ArrowUpRight />
                    </div>
                  ))
                )}
              </div>
              {atRisk.length > 0 && (
                <button type="button" className="risk-action" onClick={reviewExceptions}>
                  Review exceptions <ArrowUpRight />
                </button>
              )}
            </article>

            <article className="timeline-card">
              <div className="card-top">
                <div>
                  <p className="kicker">Live automation feed</p>
                  <h2>Request activity</h2>
                </div>
                <span className="live-status">
                  <i />
                  Live
                </span>
              </div>
              <div className="timeline">
                <div className="line" />
                {feed.length === 0 ? (
                  <div className="event">
                    <span className="node">
                      <Mail />
                    </span>
                    <div>
                      <b>No requests yet</b>
                      <small>Create your first document request</small>
                    </div>
                    <Badge tone="slate">Idle</Badge>
                  </div>
                ) : (
                  feed.map((request) => {
                    const meta = FEED_META[request.status] ?? FEED_META.pending;
                    return (
                      <div key={request.id} className={meta.eventClass}>
                        <span className="node">{feedNode(request.status)}</span>
                        <div>
                          <b>
                            {request.documentName} {meta.word}
                          </b>
                          <small>
                            {request.clientName ?? "New client"} · {request.documentName}
                          </small>
                        </div>
                        <Badge tone={meta.tone}>{meta.badge}</Badge>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="timeline-footer">
                <span>
                  <i className="green-dot" />
                  {counts.total} request{counts.total === 1 ? "" : "s"} tracked
                </span>
                <button type="button" onClick={scrollToTracker}>
                  Open tracker <ArrowUpRight />
                </button>
              </div>
            </article>

            <article className="velocity-card">
              <div className="card-top">
                <div>
                  <p className="kicker">Nudge velocity</p>
                  <h2>Collection rate</h2>
                </div>
                <MoreHorizontal />
              </div>
              <div className="ring-wrap">
                <div className="ring" style={ringStyle}>
                  <div>
                    <strong>{completionRate}%</strong>
                    <small>completed</small>
                  </div>
                </div>
              </div>
              <div className="velocity-meta">
                <span>
                  <i className="green-dot" />
                  {counts.completed} of {counts.total} collected
                </span>
                <b>+{completionRate}%</b>
              </div>
              <div className="mini-bars">
                {miniBars.map((height, index) => (
                  <span key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </article>
          </section>

          <section className="tracker" id="fn-tracker">
            <div className="section-head">
              <div>
                <p className="kicker">Operational queue</p>
                <h2>Live document tracker</h2>
              </div>
              <div className="head-actions">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    className={`pill ${statusFilter === filter.value ? "active" : ""}`}
                    onClick={() => { setStatusFilter(filter.value); }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Request ID</th>
                    <th>Req. documents</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipmentGroups.ungrouped.map((request) => (
                    <RequestRow key={request.id} request={request} onExportAudit={() => { showToast("Audit trail export — coming soon."); }} />
                  ))}
                </tbody>
              </table>
              {Object.entries(shipmentGroups.groups).map(([shipmentId, groupRequests]) => (
                <table key={shipmentId} className="fn-shipment-group">
                  <thead>
                    <tr className="fn-shipment-head">
                      <th colSpan={6}>
                        <span className="fn-shipment-badge">{shipmentId}</span>
                        <span className="fn-shipment-count">{groupRequests.length} document{groupRequests.length === 1 ? "" : "s"}</span>
                      </th>
                    </tr>
                    <tr>
                      <th>Client</th>
                      <th>Request ID</th>
                      <th>Req. documents</th>
                      <th>Status</th>
                      <th>Deadline</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupRequests.map((request) => (
                      <RequestRow key={request.id} request={request} onExportAudit={() => { showToast("Audit trail export — coming soon."); }} />
                    ))}
                  </tbody>
                </table>
              ))}
              {filtered.length === 0 && (
                <div className="fn-empty">
                  <b>No matching document requests</b>
                  Try adjusting the filters or search query.
                </div>
              )}
            </div>
            <div className="table-foot">
              <span>
                Showing {filtered.length} of {counts.total} request{counts.total === 1 ? "" : "s"}
              </span>
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters}>
                  Clear filters <ArrowUpRight />
                </button>
              )}
            </div>
          </section>

          <div className="footer-note">
            <span>
              <ShieldCheck />
              Secure upload links · Data stays in your workspace
            </span>
            <span>
              FreightNudge system / <b>Less chasing. More moving.</b>
            </span>
            <LifeBuoy />
          </div>

      {createOpen && createModal}

      {toast && (
        <div className="fn-toast">
          <span>{toast}</span>
        </div>
      )}
    </ConsoleShell>
  );
}
