"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Bell,
  ChevronsUpDown,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import Logo from "@/components/logo";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

const DROPDOWN_PANEL =
  "z-50 min-w-[230px] rounded-xl border border-neutral-200/60 bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40 backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/95";

const DROPDOWN_ITEM =
  "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 outline-none transition-colors duration-150 data-[highlighted]:bg-neutral-100 data-[highlighted]:text-neutral-900 dark:text-neutral-200 dark:data-[highlighted]:bg-zinc-800 dark:data-[highlighted]:text-white";

const DROPDOWN_SEPARATOR = "-mx-1.5 my-1 h-px bg-neutral-200/70 dark:bg-zinc-700/70";

function UserMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all duration-200 ease-out hover:bg-neutral-100 dark:hover:bg-zinc-800"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
            AT
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-neutral-900 dark:text-white">Alex Tran</span>
            <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">alex@nordwind.io</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-neutral-400" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={8} className={DROPDOWN_PANEL}>
          <DropdownMenu.Item className={DROPDOWN_ITEM}>
            <User className="h-4 w-4 text-neutral-400" />
            View profile
          </DropdownMenu.Item>
          <DropdownMenu.Item className={DROPDOWN_ITEM}>
            <Settings className="h-4 w-4 text-neutral-400" />
            Workspace settings
          </DropdownMenu.Item>
          <DropdownMenu.Item className={DROPDOWN_ITEM}>
            <LifeBuoy className="h-4 w-4 text-neutral-400" />
            Help and support
          </DropdownMenu.Item>
          <DropdownMenu.Separator className={DROPDOWN_SEPARATOR} />
          <DropdownMenu.Item className="flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 outline-none transition-colors duration-150 data-[highlighted]:bg-rose-50 dark:text-rose-400 dark:data-[highlighted]:bg-rose-500/10">
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
              active
                ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 ring-1 ring-inset ring-indigo-500/20 dark:text-indigo-300"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                active ? "text-indigo-500 dark:text-indigo-400" : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-zinc-950 dark:text-neutral-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-neutral-200/70 bg-white/80 backdrop-blur-xl lg:flex dark:border-zinc-800/70 dark:bg-zinc-900/80">
        <div className="flex h-16 shrink-0 items-center border-b border-neutral-200/60 px-5 dark:border-zinc-800/60">
          <Link href="/dashboard" className="transition-opacity duration-200 hover:opacity-80">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Workspace
          </p>
          <NavLinks pathname={pathname} />
        </nav>
        <div className="space-y-2 border-t border-neutral-200/60 p-3 dark:border-zinc-800/60">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-3.5 ring-1 ring-inset ring-indigo-500/15">
            <p className="text-xs font-semibold text-neutral-900 dark:text-white">Pro plan</p>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Unlimited requests and follow-ups.</p>
          </div>
          <UserMenu />
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200/60 bg-white/80 px-4 backdrop-blur-xl lg:hidden dark:border-zinc-800/60 dark:bg-zinc-900/80">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-lg p-2 text-neutral-500 transition-colors duration-200 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-zinc-800"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-neutral-500 transition-colors duration-200 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-zinc-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="animate-fade-in absolute inset-0 h-full w-full cursor-default bg-neutral-950/40 backdrop-blur-sm"
          />
          <div className="animate-slide-in-left absolute inset-y-0 left-0 flex w-72 flex-col border-r border-neutral-200/70 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:border-zinc-800/70 dark:bg-zinc-900">
            <div className="flex h-16 items-center justify-between border-b border-neutral-200/60 px-5 dark:border-zinc-800/60">
              <Logo />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-neutral-500 transition-colors duration-200 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </nav>
            <div className="border-t border-neutral-200/60 p-3 dark:border-zinc-800/60">
              <UserMenu />
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <main className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}