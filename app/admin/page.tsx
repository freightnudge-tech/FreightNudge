import type { Metadata } from "next";
import { Boxes, Database, TrendingUp, Users } from "lucide-react";

import AppShell from "@/components/app-shell";

import ForwarderTable from "./forwarder-table";

export const metadata: Metadata = {
  title: "Admin - FreightNudge",
};

const METRICS = [
  { label: "Active forwarders", value: "148", delta: "+12 this month", icon: Users, tint: "from-indigo-500/10 to-sky-500/5 text-indigo-600 dark:text-indigo-300" },
  { label: "Platform request volume", value: "42,318", delta: "+8.4% vs last month", icon: TrendingUp, tint: "from-emerald-500/10 to-teal-500/5 text-emerald-600 dark:text-emerald-300" },
  { label: "Storage used", value: "684 GB", delta: "of 2 TB platform quota", icon: Database, tint: "from-blue-500/10 to-cyan-500/5 text-blue-600 dark:text-blue-300" },
  { label: "MRR", value: "$38,940", delta: "+$4,120 vs last month", icon: Boxes, tint: "from-purple-500/10 to-fuchsia-500/5 text-purple-600 dark:text-purple-300" },
];

export default function AdminPage() {
  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400">
          FreightNudge Platform
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 bg-clip-text text-transparent dark:from-white dark:via-neutral-300 dark:to-white">
            Super Admin
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">
          Platform-wide health, growth and account management at a glance.
        </p>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-2xl border border-neutral-200/20 bg-gradient-to-br p-5 ring-1 ring-inset ring-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-zinc-800 ${metric.tint}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">{metric.label}</p>
              <metric.icon className="h-4 w-4 opacity-70" />
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{metric.value}</p>
            <p className="mt-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">{metric.delta}</p>
          </div>
        ))}
      </div>

      <ForwarderTable />
    </AppShell>
  );
}