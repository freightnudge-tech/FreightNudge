import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="mk-header">
      <div className="mk-header-inner">
        <Link href="/" className="mk-brand">
          <span className="brand-mark">F</span>
          <span>
            <strong>
              Freight<span>Nudge</span>
            </strong>
          </span>
        </Link>
        <nav className="mk-nav">
          <Link href="/pricing">Pricing</Link>
          <a href="#">Docs</a>
          <a href="#">Contact</a>
          <Link href="/login">Log in</Link>
          <Link href="/signup" className="cta">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}