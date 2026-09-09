import type { Metadata } from "next";

import ConsoleShell from "@/components/console-shell";
import { Metric } from "@/components/console-bits";

export const metadata: Metadata = {
  title: "Reports - FreightNudge",
};

export const dynamic = "force-dynamic";

const SPARK_UP = [35, 42, 48, 55, 60, 68, 72, 78, 85, 91];
const SPARK_DOWN = [90, 82, 75, 68, 60, 52, 45, 38, 32, 28];
const SPARK_FLAT = [50, 52, 48, 51, 53, 49, 52, 50, 51, 53];

export default function ReportsPage() {
  const todayLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  return (
    <ConsoleShell pageName="Reports">
      <section className="intro">
        <div>
          <p className="kicker">
            <span className="live" />
            Performance / {todayLabel}
          </p>
          <h1>Turnaround report</h1>
          <p>How fast documents move through your workspace — and where time is saved.</p>
        </div>
      </section>

      <section className="metrics">
        <Metric
          label="Average upload time"
          value="18.4h"
          note="from request sent to client upload"
          change="—"
          tone="indigo"
          values={SPARK_DOWN}
        />
        <Metric
          label="Time saved this month"
          value="312h"
          note="vs. manual follow-up baseline"
          change="+18%"
          tone="green"
          values={SPARK_UP}
        />
        <Metric
          label="On-time rate"
          value="87%"
          note="requests uploaded before deadline"
          change="on track"
          tone="green"
          values={SPARK_FLAT}
        />
        <Metric
          label="Manual nudges avoided"
          value="146"
          note="automated reminders that worked"
          change="+24"
          tone="indigo"
          values={SPARK_UP}
        />
      </section>

      <section className="fn-card">
        <h2 className="fn-card-title">Coming soon</h2>
        <p className="fn-card-sub">Detailed breakdowns by client, forwarder, and document type are being built.</p>
        <ul className="fn-report-coming mt-4">
          <li>Per-client turnaround trends</li>
          <li>Forwarder comparison report</li>
          <li>Document type cycle times</li>
          <li>Exportable CSV / PDF summaries</li>
        </ul>
      </section>
    </ConsoleShell>
  );
}
