import type { Metadata } from "next";

import ConsoleShell from "@/components/console-shell";

export const metadata: Metadata = {
  title: "Settings - FreightNudge",
};

const NOTIFICATIONS = [
  { id: "notify-email", label: "Email me when a document is uploaded", hint: "Instant notification per submission", enabled: true },
  { id: "notify-daily", label: "Daily digest of pending requests", hint: "Summary every morning at 8:00", enabled: false },
  { id: "notify-overdue", label: "Alert me when a deadline is overdue", hint: "Escalation after the deadline passes", enabled: true },
];

export default function SettingsPage() {
  return (
    <ConsoleShell pageName="Settings">
      <section className="intro">
        <div>
          <p className="kicker">
            <span className="live" />
            FreightNudge
          </p>
          <h1>Settings</h1>
          <p>Manage your workspace profile, notifications and billing preferences.</p>
        </div>
      </section>

      <div className="fn-settings-grid">
        <section className="fn-card">
          <h2 className="fn-card-title">Company profile</h2>
          <p className="fn-card-sub">This information appears on document request emails.</p>
          <div className="fn-row-2col mt-5">
            <div className="fn-field">
              <label htmlFor="settings-company">Company name</label>
              <input id="settings-company" type="text" defaultValue="Demo Forwarder" className="fn-input" />
            </div>
            <div className="fn-field">
              <label htmlFor="settings-email">Contact email</label>
              <input id="settings-email" type="email" defaultValue="demo@freightnudge.com" className="fn-input" />
            </div>
          </div>
          <button type="button" className="cta mt-5">
            Save changes
          </button>
        </section>

        <section className="fn-card">
          <h2 className="fn-card-title">Notifications</h2>
          <p className="fn-card-sub">Choose how you want to be notified about client activity.</p>
          <div className="fn-divider-rows mt-2">
            {NOTIFICATIONS.map((item) => (
              <label key={item.id} htmlFor={item.id} className="fn-check-row">
                <span>
                  <b>{item.label}</b>
                  <small>{item.hint}</small>
                </span>
                <input id={item.id} type="checkbox" defaultChecked={item.enabled} />
              </label>
            ))}
          </div>
        </section>
      </div>
    </ConsoleShell>
  );
}