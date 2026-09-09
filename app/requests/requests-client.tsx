"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import ConsoleShell from "@/components/console-shell";
import { RequestRow, STATUS_FILTERS, type DashboardRequest, type StatusFilter } from "@/components/request-row";

type RequestsProps = {
  requests: DashboardRequest[];
  clientsCount: number;
  loadError?: boolean;
};

export default function RequestsClient({ requests, clientsCount, loadError = false }: RequestsProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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

  const filtered = useMemo(
    () => requests.filter((request) => statusFilter === "all" || request.status === statusFilter),
    [requests, statusFilter],
  );

  const todayLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  return (
    <ConsoleShell
      pageName="Requests"
      counts={{ requests: requests.length, clients: clientsCount, pending: counts.pending }}
    >
      {loadError && (
        <div className="fn-banner-error">Failed to load document requests. Please check the database setup.</div>
      )}

      <section className="intro">
        <div>
          <p className="kicker">
            <span className="live" />
            Operational queue / {todayLabel}
          </p>
          <h1>All document requests</h1>
          <p>Every request across your workspace — filter by status to triage the queue.</p>
        </div>
      </section>

      <section className="tracker">
        <div className="section-head">
          <div>
            <p className="kicker">Operational queue</p>
            <h2>Document requests</h2>
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
              {filtered.map((request) => (
                <RequestRow key={request.id} request={request} />
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="fn-empty">
              <b>No matching document requests</b>
              Try a different status filter.
            </div>
          )}
        </div>
        <div className="table-foot">
          <span>
            Showing {filtered.length} of {requests.length} request{requests.length === 1 ? "" : "s"}
          </span>
          {statusFilter !== "all" && (
            <button type="button" onClick={() => { setStatusFilter("all"); }}>
              Clear filter <ArrowUpRight />
            </button>
          )}
        </div>
      </section>
    </ConsoleShell>
  );
}