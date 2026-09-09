import type { ReactNode } from "react";

export function Badge({ children, tone }: { children: ReactNode; tone: string }) {
  return (
    <span className={`badge ${tone}`}>
      <i />
      {children}
    </span>
  );
}

export function Spark({ values, tone = "indigo" }: { values: number[]; tone?: string }) {
  return (
    <span className={`spark ${tone === "green" ? "green" : ""}`}>
      {values.map((value, index) => (
        <b key={index} style={{ height: `${value}%` }} />
      ))}
    </span>
  );
}

export function Metric({
  label,
  value,
  note,
  change,
  tone,
  values,
}: {
  label: string;
  value: string;
  note: string;
  change: string;
  tone: string;
  values: number[];
}) {
  return (
    <article className="metric">
      <div className="metric-label">
        {label}
        <span className={`change ${tone}`}>{change}</span>
      </div>
      <div className="metric-value">
        <strong>{value}</strong>
        <Spark values={values} tone={tone} />
      </div>
      <small>{note}</small>
    </article>
  );
}
