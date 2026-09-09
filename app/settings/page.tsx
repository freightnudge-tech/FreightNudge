import type { Metadata } from "next";

import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Settings - FreightNudge",
};

export default function SettingsPage() {
  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400">
          FreightNudge
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 bg-clip-text text-transparent dark:from-white dark:via-neutral-300 dark:to-white">
            Settings
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">
          Manage your workspace profile, notifications and billing preferences.
        </p>
      </header>

      <div className="max-w-3xl space-y-6">
        <section className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Company profile</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">This information appears on document request emails.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="settings-company" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Company name</label>
              <input
                id="settings-company"
                type="text"
                defaultValue="Demo Forwarder"
                className="mt-1.5 w-full rounded-xl border border-neutral-200/60 bg-white px-3.5 py-2.5 text-sm text-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-950/60 dark:text-neutral-100"
              />
            </div>
            <div>
              <label htmlFor="settings-email" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Contact email</label>
              <input
                id="settings-email"
                type="email"
                defaultValue="demo@freightnudge.com"
                className="mt-1.5 w-full rounded-xl border border-neutral-200/60 bg-white px-3.5 py-2.5 text-sm text-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-950/60 dark:text-neutral-100"
              />
            </div>
          </div>
          <button
            type="button"
            className="mt-5 inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)] ring-1 ring-inset ring-white/20 transition-all duration-200 ease-out hover:shadow-[0_8px_30px_rgba(99,102,241,0.45)] hover:brightness-105 active:scale-[0.98]"
          >
            Save changes
          </button>
        </section>

        <section className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Notifications</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Choose how you want to be notified about client activity.</p>
          <div className="mt-4 divide-y divide-neutral-200/60 dark:divide-zinc-800">
            {[
              { id: "notify-email", label: "Email me when a document is uploaded", hint: "Instant notification per submission", enabled: true },
              { id: "notify-daily", label: "Daily digest of pending requests", hint: "Summary every morning at 8:00", enabled: false },
              { id: "notify-overdue", label: "Alert me when a deadline is overdue", hint: "Escalation after the deadline passes", enabled: true },
            ].map((item) => (
              <label key={item.id} htmlFor={item.id} className="flex cursor-pointer items-center justify-between gap-4 py-4">
                <span>
                  <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-100">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-neutral-400 dark:text-neutral-500">{item.hint}</span>
                </span>
                <input id={item.id} type="checkbox" defaultChecked={item.enabled} className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500/30 dark:border-zinc-700" />
              </label>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}