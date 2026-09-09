"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import Logo from "@/components/logo";

const FEATURES = [
  "Request, track and collect freight documents in one place",
  "Automated email and WhatsApp nudges before deadlines",
  "Secure upload links with open and download tracking",
];

export default function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2 dark:bg-zinc-950">
      <div className="relative hidden overflow-hidden bg-neutral-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-600/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl" />

        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Document chasing, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">handled on autopilot.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-neutral-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-inset ring-indigo-400/30">
                  <Check className="h-3 w-3 text-indigo-300" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <p className="text-sm leading-6 text-neutral-300">
            FreightNudge cut our document turnaround from days to hours. The automated nudges alone pay for the plan.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold">
              MK
            </span>
            <div>
              <p className="text-sm font-semibold">Mara Keller</p>
              <p className="text-xs text-neutral-400">Operations Lead, Nordwind Logistics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white px-4 py-12 sm:px-8 dark:bg-zinc-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="mt-8 lg:mt-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {isSignup ? "Create your workspace" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {isSignup
                ? "Start collecting freight documents on time, every time."
                : "Log in to manage your document requests."}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-neutral-200/60 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 ease-out hover:bg-neutral-50 hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-neutral-200 dark:hover:bg-zinc-800"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-neutral-200/60 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 ease-out hover:bg-neutral-50 hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-neutral-200 dark:hover:bg-zinc-800"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
                <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
                <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
                <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
              </svg>
              Microsoft
            </button>
          </div>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-neutral-200 dark:bg-zinc-800" />
            <span className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              or continue with email
            </span>
            <span className="h-px flex-1 bg-neutral-200 dark:bg-zinc-800" />
          </div>

          <form className="mt-7 space-y-4" onSubmit={(event) => { event.preventDefault(); }}>
            {isSignup && (
              <div>
                <label htmlFor="company" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Company name
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  placeholder="Nordwind Logistics"
                  className="mt-1.5 w-full rounded-xl border border-neutral-200/60 bg-white px-3.5 py-2.5 text-sm text-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-200 placeholder:text-neutral-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-neutral-100"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="mt-1.5 w-full rounded-xl border border-neutral-200/60 bg-white px-3.5 py-2.5 text-sm text-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-200 placeholder:text-neutral-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Password
                </label>
                {!isSignup && (
                  <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Forgot password?
                  </a>
                )}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="mt-1.5 w-full rounded-xl border border-neutral-200/60 bg-white px-3.5 py-2.5 text-sm text-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-200 placeholder:text-neutral-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-neutral-100"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)] ring-1 ring-inset ring-white/20 transition-all duration-200 ease-out hover:shadow-[0_8px_30px_rgba(99,102,241,0.45)] hover:brightness-105 active:scale-[0.98]"
            >
              {isSignup ? "Create account" : "Log in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {isSignup ? "Already have an account?" : "New to FreightNudge?"}{" "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="font-semibold text-indigo-600 transition-colors duration-150 hover:text-indigo-500 dark:text-indigo-400"
            >
              {isSignup ? "Log in" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}