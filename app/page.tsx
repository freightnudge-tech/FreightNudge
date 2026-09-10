import Link from "next/link";
import { ArrowRight, BarChart3, FileText, ShieldCheck, Users, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "Request & collect",
    description: "Send clients a secure upload link. Track every document from request to delivery.",
  },
  {
    icon: Zap,
    title: "Automated nudges",
    description: "Email and WhatsApp reminders before deadlines. No more manual chasing.",
  },
  {
    icon: BarChart3,
    title: "Turnaround insights",
    description: "See average upload times, on-time rates, and where documents get stuck.",
  },
  {
    icon: Users,
    title: "Client trust scores",
    description: "Spot reliable clients and chronic late submitters at a glance.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description: "Time-limited upload links, signed download URLs, and full audit trails.",
  },
];

const STEPS = [
  { step: "1", label: "Create a request", description: "Pick a client, choose documents, set a deadline." },
  { step: "2", label: "Client uploads", description: "They get a secure link. No account needed." },
  { step: "3", label: "You collect", description: "Download approved documents. Track everything." },
];

export default function Home() {
  return (
    <div className="fn-shell fn-landing">
      <header className="fn-landing-header">
        <div className="brand">
          <span className="brand-mark">F</span>
          <span>
            <strong>
              Freight<span>Nudge</span>
            </strong>
            <small>Operations layer</small>
          </span>
        </div>
        <nav className="fn-landing-nav">
          <Link href="/pricing">Pricing</Link>
          <Link href="/login" className="fn-btn-ghost">Log in</Link>
          <Link href="/signup" className="cta cta-sm">Get started</Link>
        </nav>
      </header>

      <main className="fn-landing-main">
        <section className="fn-hero">
          <div className="fn-hero-inner">
            <p className="kicker">
              <span className="live" />
              Freight document operations
            </p>
            <h1 className="fn-hero-title">
              Document chasing, <span>handled on autopilot.</span>
            </h1>
            <p className="fn-hero-sub">
              Request, track, and collect freight documents from clients — with automated nudges,
              secure upload links, and real-time tracking. Cut your turnaround from days to hours.
            </p>
            <div className="fn-hero-actions">
              <Link href="/signup" className="cta">
                Get started free <ArrowRight />
              </Link>
              <Link href="/login" className="fn-btn-ghost">
                Log in to your account
              </Link>
            </div>
            <p className="fn-hero-note">No credit card required · Set up in under 2 minutes</p>
          </div>
        </section>

        <section className="fn-landing-section">
          <p className="kicker">How it works</p>
          <h2 className="fn-landing-heading">Three steps to documents on time</h2>
          <div className="fn-steps">
            {STEPS.map((item) => (
              <div key={item.step} className="fn-step">
                <span className="fn-step-number">{item.step}</span>
                <b>{item.label}</b>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="fn-landing-section">
          <p className="kicker">Everything you need</p>
          <h2 className="fn-landing-heading">Built for freight forwarders</h2>
          <div className="fn-features">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="fn-feature">
                  <span className="fn-feature-icon">
                    <Icon />
                  </span>
                  <b>{feature.title}</b>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="fn-landing-section">
          <div className="fn-cta-card">
            <h2>Ready to stop chasing documents?</h2>
            <p>Join freight forwarders who collect documents on time, every time.</p>
            <div className="fn-hero-actions">
              <Link href="/signup" className="cta">
                Create your account <ArrowRight />
              </Link>
              <Link href="/pricing" className="fn-btn-ghost">
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="fn-landing-footer">
        <p>© {new Date().getFullYear()} FreightNudge. All rights reserved.</p>
        <div className="fn-footer-links">
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
