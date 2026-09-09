import Link from "next/link";

import Logo from "@/components/logo";

const NAV_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Log in" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/70 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/70">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex dark:text-neutral-300">
          <Link href="/pricing" className="transition-colors duration-200 hover:text-neutral-900 dark:hover:text-white">
            Pricing
          </Link>
          <a href="#" className="transition-colors duration-200 hover:text-neutral-900 dark:hover:text-white">
            Docs
          </a>
          <a href="#" className="transition-colors duration-200 hover:text-neutral-900 dark:hover:text-white">
            Contact
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-all duration-200 ease-out hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex dark:text-neutral-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/signup"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)] ring-1 ring-inset ring-white/20 transition-all duration-200 ease-out hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] hover:brightness-105 active:scale-[0.97]"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}