"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Eye, KeyRound, MoreHorizontal, ShieldCheck, Trash2 } from "lucide-react";

import { Badge } from "@/components/console-bits";

type ForwarderStatus = "active" | "pending" | "suspended";

type Forwarder = {
  id: number;
  name: string;
  email: string;
  plan: "Starter" | "Pro" | "Enterprise";
  requests: number;
  status: ForwarderStatus;
  joined: string;
};

const MOCK_FORWARDERS: Forwarder[] = [
  { id: 1, name: "Nordwind Logistics", email: "ops@nordwind.io", plan: "Pro", requests: 1284, status: "active", joined: "Jan 12, 2026" },
  { id: 2, name: "Baltic Cargo Co", email: "hello@balticcargo.eu", plan: "Pro", requests: 986, status: "active", joined: "Feb 03, 2026" },
  { id: 3, name: "TransAtlas Group", email: "admin@transatlas.com", plan: "Enterprise", requests: 3912, status: "active", joined: "Nov 28, 2025" },
  { id: 4, name: "Meridian Freight", email: "team@meridianfreight.com", plan: "Starter", requests: 41, status: "pending", joined: "Aug 19, 2026" },
  { id: 5, name: "Harborline Ltd", email: "desk@harborline.co", plan: "Starter", requests: 12, status: "suspended", joined: "Mar 07, 2026" },
  { id: 6, name: "Velocity Shipping", email: "ops@velocityship.com", plan: "Pro", requests: 761, status: "active", joined: "May 22, 2026" },
];

const STATUS_TONE: Record<ForwarderStatus, string> = {
  active: "green",
  pending: "amber",
  suspended: "rose",
};

const STATUS_LABEL: Record<ForwarderStatus, string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
};

function RowActions() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" aria-label="Open actions" className="row-action">
          <MoreHorizontal />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className="fn-menu-content">
          <DropdownMenu.Item className="fn-menu-item">
            <Eye />
            View details
          </DropdownMenu.Item>
          <DropdownMenu.Item className="fn-menu-item">
            <KeyRound />
            Reset password
          </DropdownMenu.Item>
          <DropdownMenu.Item className="fn-menu-item">
            <ShieldCheck />
            Toggle suspension
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="fn-menu-separator" />
          <DropdownMenu.Item className="fn-menu-item danger">
            <Trash2 />
            Remove forwarder
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function ForwarderTable() {
  return (
    <section className="tracker">
      <div className="section-head">
        <div>
          <p className="kicker">Platform operations</p>
          <h2>Onboarded forwarders</h2>
        </div>
        <div className="head-actions">
          <span className="pill">{MOCK_FORWARDERS.length} total</span>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Forwarder</th>
              <th>Plan</th>
              <th>Requests</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FORWARDERS.map((forwarder) => (
              <tr key={forwarder.id}>
                <td>
                  <div className="shipment">
                    <span>
                      <b>{forwarder.name}</b>
                      <small>{forwarder.email}</small>
                    </span>
                  </div>
                </td>
                <td>{forwarder.plan}</td>
                <td>{forwarder.requests.toLocaleString("en-US")}</td>
                <td>
                  <Badge tone={STATUS_TONE[forwarder.status]}>{STATUS_LABEL[forwarder.status]}</Badge>
                </td>
                <td>
                  <span className="channel">{forwarder.joined}</span>
                </td>
                <td>
                  <div className="row-actions-cell">
                    <RowActions />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-foot">
        <span>Showing all {MOCK_FORWARDERS.length} onboarded forwarders</span>
        <span>Manage accounts, plans and access.</span>
      </div>
    </section>
  );
}