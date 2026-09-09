"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import ConsoleShell from "@/components/console-shell";

import { createClient } from "./actions";

type ClientRow = {
  id: string;
  name: string;
  email: string;
  forwarderName: string;
  requestCount: number;
};

type ForwarderOption = {
  id: string;
  name: string;
};

type ClientsProps = {
  clients: ClientRow[];
  forwarders: ForwarderOption[];
  requestsTotal: number;
  pendingCount: number;
  loadError?: boolean;
};

export default function ClientsClient({
  clients,
  forwarders,
  requestsTotal,
  pendingCount,
  loadError = false,
}: ClientsProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formForwarderId, setFormForwarderId] = useState("");

  function openCreate() {
    setCreateOpen(true);
    setFormError(null);
  }

  function closeCreate() {
    if (busy) return;
    setCreateOpen(false);
    setFormError(null);
  }

  async function handleCreate() {
    if (busy) return;
    setBusy(true);
    setFormError(null);
    try {
      const result = await createClient({
        name: formName,
        email: formEmail,
        forwarderId: formForwarderId || undefined,
      });
      if (!result.ok) {
        setFormError(result.error ?? "Failed to create the client.");
        return;
      }
      setFormName("");
      setFormEmail("");
      setFormForwarderId("");
      setCreateOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const todayLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  return (
    <ConsoleShell
      pageName="Clients"
      counts={{ requests: requestsTotal, clients: clients.length, pending: pendingCount }}
    >
      {loadError && (
        <div className="fn-banner-error">Failed to load clients. Please check the database setup.</div>
      )}

      <section className="intro">
        <div>
          <p className="kicker">
            <span className="live" />
            Workspace directory / {todayLabel}
          </p>
          <h1>Clients</h1>
          <p>Everyone you request documents from, with their forwarder and request volume.</p>
        </div>
        <button type="button" className="cta" onClick={openCreate}>
          <Plus />
          New client
        </button>
      </section>

      <section className="tracker">
        <div className="section-head">
          <div>
            <p className="kicker">Workspace directory</p>
            <h2>Client list</h2>
          </div>
          <div className="head-actions">
            <span className="pill">{clients.length} total</span>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Forwarder</th>
                <th>Document requests</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="shipment">
                      <span>
                        <b>{client.name}</b>
                        <small>{client.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>{client.forwarderName}</td>
                  <td>{client.requestCount.toLocaleString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && (
            <div className="fn-empty">
              <b>No clients yet</b>
              Create your first client to start requesting documents.
            </div>
          )}
        </div>
        <div className="table-foot">
          <span>
            Showing all {clients.length} client{clients.length === 1 ? "" : "s"}
          </span>
          <span>
            Across {forwarders.length} forwarder{forwarders.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

{createOpen && (
        <div className="fn-modal-backdrop">
          <button type="button" aria-label="Close dialog" onClick={closeCreate} className="fn-modal-backdrop-btn animate-fade-in" />
          <div className="fn-modal-panel animate-modal-pop">
            <div className="fn-modal-head">
              <div>
                <h2>New client</h2>
                <p className="fn-modal-sub">
                  Add a person you request documents from. They will appear in your workspace directory.
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
              <div className="fn-field">
                <label htmlFor="client-name">Client name</label>
                <input
                  id="client-name"
                  type="text"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  placeholder="e.g. Acme Logistics"
                  disabled={busy}
                  className="fn-input"
                />
              </div>
              <div className="fn-field">
                <label htmlFor="client-email">Client email</label>
                <input
                  id="client-email"
                  type="email"
                  value={formEmail}
                  onChange={(event) => setFormEmail(event.target.value)}
                  placeholder="e.g. ops@acmelogistics.com"
                  disabled={busy}
                  className="fn-input"
                />
              </div>
              <div className="fn-field">
                <label htmlFor="client-forwarder">Forwarder</label>
                <select
                  id="client-forwarder"
                  value={formForwarderId}
                  onChange={(event) => setFormForwarderId(event.target.value)}
                  disabled={busy}
                  className="fn-input"
                >
                  <option value="">Unassigned</option>
                  {forwarders.map((forwarder) => (
                    <option key={forwarder.id} value={forwarder.id}>
                      {forwarder.name}
                    </option>
                  ))}
                </select>
              </div>

              {formError && <p className="fn-reason-error">{formError}</p>}

              <div className="fn-reason-actions">
                <button type="button" className="fn-btn-ghost" onClick={closeCreate} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="cta" disabled={busy}>
                  {busy ? "Creating…" : "Create client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ConsoleShell>
  );
}