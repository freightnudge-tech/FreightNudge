import type { Metadata } from "next";

import SiteHeader from "@/components/site-header";

import PricingClient from "./pricing-client";

export const metadata: Metadata = {
  title: "Pricing - FreightNudge",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <SiteHeader />
      <PricingClient />
      <footer className="border-t border-neutral-200/60 py-10 dark:border-zinc-800/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-neutral-500 sm:flex-row sm:px-6 lg:px-8 dark:text-neutral-400">
          <p>FreightNudge. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors duration-200 hover:text-neutral-900 dark:hover:text-white">Terms</a>
            <a href="#" className="transition-colors duration-200 hover:text-neutral-900 dark:hover:text-white">Privacy</a>
            <a href="#" className="transition-colors duration-200 hover:text-neutral-900 dark:hover:text-white">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}