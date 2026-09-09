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

const TEMPLATES = [
  { id: "tpl-eu", name: "EU Import Standard", documents: ["CMR", "Commercial Invoice", "Packing List"] },
  { id: "tpl-air", name: "Air Freight", documents: ["Air Waybill", "Commercial Invoice", "Certificate of Origin"] },
  { id: "tpl-fcl", name: "FCL Ocean", documents: ["Bill of Lading", "Packing List", "VGM Declaration"] },
];

const NUDGE_STEPS = [
  { id: "nudge-day1", label: "Day 1 — first reminder", defaultTone: "Gentle" },
  { id: "nudge-day3", label: "Day 3 — follow-up", defaultTone: "Firm" },
  { id: "nudge-final", label: "Final day — deadline", defaultTone: "Urgent" },
];

const TONE_OPTIONS = ["Gentle", "Firm", "Urgent"];

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

      <section className="fn-card">
        <h2 className="fn-card-title">Document templates</h2>
        <p className="fn-card-sub">Named sets of document types you can apply when creating a request.</p>
        <div className="fn-template-list mt-4">
          {TEMPLATES.map((template) => (
            <div key={template.id} className="fn-template-row">
              <div>
                <b>{template.name}</b>
                <span className="fn-template-docs">{template.documents.join(" · ")}</span>
              </div>
              <div className="fn-template-actions">
                <button type="button" className="fn-btn-ghost" disabled>Edit</button>
                <button type="button" className="fn-btn-ghost danger" disabled>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="cta mt-4" disabled>
          Create template
        </button>
      </section>

      <section className="fn-card">
        <h2 className="fn-card-title">Nudge cadence</h2>
        <p className="fn-card-sub">How the tone of automated reminders escalates as the deadline approaches.</p>
        <div className="fn-nudge-list mt-4">
          {NUDGE_STEPS.map((step) => (
            <div key={step.id} className="fn-nudge-row">
              <label htmlFor={step.id} className="fn-nudge-label">{step.label}</label>
              <select id={step.id} defaultValue={step.defaultTone} className="fn-input fn-nudge-select" disabled>
                {TONE_OPTIONS.map((tone) => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button type="button" className="cta mt-5" disabled>
          Save cadence
        </button>
      </section>
    </ConsoleShell>
  );
}