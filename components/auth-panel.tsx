"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const FEATURES = [
  "Request, track and collect freight documents in one place",
  "Automated email and WhatsApp nudges before deadlines",
  "Secure upload links with open and download tracking",
];

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">F</span>
      <span>
        <strong>
          Freight<span>Nudge</span>
        </strong>
        <small>Operations layer</small>
      </span>
    </div>
  );
}

export default function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";

  return (
    <div className="fn-shell">
      <div className="auth-side">
        <div aria-hidden="true" className="auth-orb blue" />
        <div aria-hidden="true" className="auth-orb indigo" />
        <div aria-hidden="true" className="auth-orb sky" />

        <Brand />

        <div className="auth-side-inner">
          <h2 className="auth-title">
            Document chasing, <span>handled on autopilot.</span>
          </h2>
          <ul className="auth-features">
            {FEATURES.map((feature) => (
              <li key={feature} className="auth-feature">
                <i>
                  <Check />
                </i>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-quote">
          <p>
            FreightNudge cut our document turnaround from days to hours. The automated nudges alone pay for the plan.
          </p>
          <div className="auth-quote-author">
            <span className="avatar">MK</span>
            <span>
              <b>Mara Keller</b>
              <small>Operations Lead, Nordwind Logistics</small>
            </span>
          </div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-box">
          <Brand />

          <h1 className="auth-heading">{isSignup ? "Create your workspace" : "Welcome back"}</h1>
          <p className="auth-sub">
            {isSignup
              ? "Start collecting freight documents on time, every time."
              : "Log in to manage your document requests."}
          </p>

          <div className="auth-social">
            <button type="button" className="fn-btn-ghost">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button type="button" className="fn-btn-ghost">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
                <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
                <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
                <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
              </svg>
              Microsoft
            </button>
          </div>

          <div className="auth-divider">or continue with email</div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            {isSignup && (
              <div className="fn-field">
                <label htmlFor="company">Company name</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  placeholder="Nordwind Logistics"
                  className="fn-input"
                />
              </div>
            )}
            <div className="fn-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="fn-input"
              />
            </div>
            <div className="fn-field">
              <div className="fn-field-head">
                <label htmlFor="password">Password</label>
                {!isSignup && (
                  <a href="#" className="auth-forgot">
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
                className="fn-input"
              />
            </div>

            <button type="submit" className="cta fn-cta-block">
              {isSignup ? "Create account" : "Log in"}
            </button>
          </form>

          <p className="auth-foot">
            {isSignup ? "Already have an account?" : "New to FreightNudge?"}{" "}
            <Link href={isSignup ? "/login" : "/signup"} className="fn-link-btn">
              {isSignup ? "Log in" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}