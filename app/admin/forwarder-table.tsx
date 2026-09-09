"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Eye, KeyRound, MoreHorizontal, ShieldCheck, Trash2 } from "lucide-react";

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

const STATUS_BADGE: Record<ForwarderStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  suspended: "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400",
};

const STATUS_LABEL: Record<ForwarderStatus, string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
};

const MENU_ITEM =
  "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 outline-none transition-colors duration-150 data-[highlighted]:bg-neutral-100 data-[highlighted]:text-neutral-900 dark:text-neutral-200 dark:data-[highlighted]:bg-zinc-800 dark:data-[highlighted]:text-white";

function RowActions() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Open actions"
          className="rounded-lg p-2 text-neutral-400 transition-all duration-200 ease-out hover:bg-neutral-100 hover:text-neutral-700 data-[state=open]:bg-neutral-100 dark:hover:bg-zinc-800 dark:hover:text-neutral-200 dark:data-[state=open]:bg-zinc-800"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[190px] rounded-xl border border-neutral-200/60 bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40 backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/95"
        >
          <DropdownMenu.Item className={MENU_ITEM}>
            <Eye className="h-4 w-4 text-neutral-400" />
            View details
          </DropdownMenu.Item>
          <DropdownMenu.Item className={MENU_ITEM}>
            <KeyRound className="h-4 w-4 text-neutral-400" />
            Reset password
          </DropdownMenu.Item>
          <DropdownMenu.Item className={MENU_ITEM}>
            <ShieldCheck className="h-4 w-4 text-neutral-400" />
            Toggle suspension
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="-mx-1.5 my-1 h-px bg-neutral-200/70 dark:bg-zinc-700/70" />
          <DropdownMenu.Item className="flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 outline-none transition-colors duration-150 data-[highlighted]:bg-rose-50 dark:text-rose-400 dark:data-[highlighted]:bg-rose-500/10">
            <Trash2 className="h-4 w-4" />
            Remove forwarder
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function ForwarderTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Onboarded forwarders</h2>
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">Manage accounts, plans and access.</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-zinc-800 dark:text-neutral-300">
          {MOCK_FORWARDERS.length} total
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-y border-neutral-200/60 bg-neutral-50/60 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-neutral-400">
              <th className="px-6 py-3.5">Forwarder</th>
              <th className="px-6 py-3.5">Plan</th>
              <th className="px-6 py-3.5">Requests</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Joined</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FORWARDERS.map((forwarder) => (
              <tr
                key={forwarder.id}
                className="border-b border-neutral-200/50 transition-colors duration-150 last:border-0 hover:bg-neutral-50/70 dark:border-zinc-800/60 dark:hover:bg-zinc-800/30"
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-neutral-900 dark:text-white">{forwarder.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{forwarder.email}</p>
                </td>
                <td className="px-6 py-4 font-medium text-neutral-600 dark:text-neutral-300">{forwarder.plan}</td>
                <td className="px-6 py-4 tabular-nums text-neutral-600 dark:text-neutral-300">{forwarder.requests.toLocaleString("en-US")}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-[0_0_10px_rgba(0,0,0,0.05)] ring-1 ring-inset ${STATUS_BADGE[forwarder.status]}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {STATUS_LABEL[forwarder.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">{forwarder.joined}</td>
                <td className="px-6 py-4 text-right">
                  <RowActions />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}