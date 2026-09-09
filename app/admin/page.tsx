import type { Metadata } from "next";

import ConsoleShell from "@/components/console-shell";
import { Metric } from "@/components/console-bits";

import ForwarderTable from "./forwarder-table";

export const metadata: Metadata = {
  title: "Admin - FreightNudge",
};

const METRICS = [
  {
    label: "Active forwarders",
    value: "148",
    note: "across the platform",
    change: "+12 this month",
    tone: "indigo",
    values: [30, 40, 35, 53, 46, 61, 57, 72, 65, 82],
  },
  {
    label: "Platform request volume",
    value: "42,318",
    note: "document requests all-time",
    change: "+8.4%",
    tone: "green",
    values: [45, 42, 58, 55, 68, 64, 72, 78, 85, 91],
  },
  {
    label: "Storage used",
    value: "684 GB",
    note: "of 2 TB platform quota",
    change: "34% used",
    tone: "indigo",
    values: [38, 44, 41, 50, 55, 52, 61, 66, 70, 76],
  },
  {
    label: "MRR",
    value: "$38,940",
    note: "recurring platform revenue",
    change: "+$4,120",
    tone: "green",
    values: [42, 48, 45, 56, 60, 58, 66, 72, 79, 88],
  },
];

export default function AdminPage() {
  return (
    <ConsoleShell pageName="Super admin">
      <section className="intro">
        <div>
          <p className="kicker">
            <span className="live" />
            FreightNudge Platform
          </p>
          <h1>Super Admin</h1>
          <p>Platform-wide health, growth and account management at a glance.</p>
        </div>
      </section>

      <section className="metrics">
        {METRICS.map((metric) => (
          <Metric key={metric.label} {...metric} />
        ))}
      </section>

      <ForwarderTable />
    </ConsoleShell>
  );
}