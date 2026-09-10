"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type ConsoleCounts = {
  requests: number;
  clients: number;
  pending: number;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  countKey?: "requests" | "clients";
};

const NAV_WORKSPACE: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: FileText, countKey: "requests" },
  { href: "/clients", label: "Clients", icon: Users, countKey: "clients" },
];

const NAV_MANAGE: NavItem[] = [
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Super admin", icon: ShieldCheck },
];

export type ShellAccount = {
  name: string;
  email: string;
};

type ConsoleShellProps = {
  children: ReactNode;
  pageName: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  counts?: ConsoleCounts;
  onHealthAction?: () => void;
  healthActionLabel?: string;
  // Hides the "Super admin" nav link unless the signed-in forwarder is a
  // platform admin (forwarders.is_admin = true).
  isAdmin?: boolean;
  // Real signed-in forwarder (display name / company name + email) shown in
  // the workspace selector, profile row and top avatar.
  account?: ShellAccount;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) return "FN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ConsoleShell({
  children,
  pageName,
  searchValue,
  onSearchChange,
  counts,
  onHealthAction,
  healthActionLabel,
  isAdmin = false,
  account,
}: ConsoleShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const workspaceName = account?.name?.trim() || "Your workspace";
  const workspaceInitials = account ? initialsFromName(workspaceName) : "FN";
  const profileEmail = account?.email?.trim() || "";
  const profileInitials = profileEmail ? initialsFromEmail(profileEmail) : workspaceInitials;

  function renderNav(items: NavItem[]) {
    return items
      .filter((item) => item.href !== "/admin" || isAdmin)
      .map((item) => {
      const Icon = item.icon;
      const count = item.countKey && counts ? counts[item.countKey] : undefined;
      return (
        <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>
          <Icon />
          <span>{item.label}</span>
          {typeof count === "number" ? <em>{count}</em> : null}
        </Link>
      );
    });
  }

  return (
    <div className="fn-shell">
      <aside className={`sidebar ${mobileNavOpen ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">F</span>
          <span>
            <strong>
              Freight<span>Nudge</span>
            </strong>
            <small>Operations layer</small>
          </span>
          <button type="button" className="close" onClick={() => { setMobileNavOpen(false); }} aria-label="Close navigation">
            <X />
          </button>
        </div>
        <button type="button" className="workspace">
          <span className="avatar">{workspaceInitials}</span>
          <span>
            <b>{workspaceName}</b>
            <small>Operations team</small>
          </span>
          <ChevronDown />
        </button>
        <nav>
          <p>Workspace</p>
          {renderNav(NAV_WORKSPACE)}
          <p className="nav-space">Manage</p>
          {renderNav(NAV_MANAGE)}
        </nav>
        <div className="side-bottom">
          <div className="health">
            <span className="health-icon">
              <Zap />
            </span>
            <b>Autopilot is healthy</b>
            <p>
              {counts
                ? `${counts.pending} document request${counts.pending === 1 ? "" : "s"} awaiting upload across ${counts.clients} client${counts.clients === 1 ? "" : "s"}.`
                : "Document nudges run on schedule across your workspace."}
            </p>
            {onHealthAction && (
              <button type="button" onClick={onHealthAction}>
                {healthActionLabel ?? "View request queue"} <ArrowUpRight />
              </button>
            )}
          </div>
          <div className="profile">
            <span className="avatar">{profileInitials}</span>
            <span>
              <b>{profileEmail || workspaceName}</b>
              <small>{profileEmail ? "Forwarder account" : "Sign in to sync your account"}</small>
            </span>
            <MoreHorizontal />
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumb">
            <button type="button" className="menu" onClick={() => { setMobileNavOpen(true); }} aria-label="Open navigation">
              <Menu />
            </button>
            <span>FreightNudge</span>
            <b>/</b>
            <strong>{pageName}</strong>
          </div>
          <div className="top-actions">
            {onSearchChange ? (
              <div className="search">
                <Search />
                <input
                  type="search"
                  aria-label="Search requests"
                  placeholder="Search requests"
                  value={searchValue ?? ""}
                  onChange={(event) => onSearchChange(event.target.value)}
                />
                <kbd>⌘K</kbd>
              </div>
            ) : null}
            {counts ? (
              <span className="autopilot">
                <i />
                Autopilot active <b>{counts.pending} queued</b>
              </span>
            ) : null}
            <button type="button" className="bell" aria-label="Notifications">
              <Bell />
              <i />
            </button>
            <span className="top-avatar">{profileInitials}</span>
          </div>
        </header>

        <div className="content">{children}</div>
      </main>
    </div>
  );
}
