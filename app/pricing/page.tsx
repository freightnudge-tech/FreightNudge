import type { Metadata } from "next";

import SiteHeader from "@/components/site-header";

import PricingClient from "./pricing-client";

export const metadata: Metadata = {
  title: "Pricing - FreightNudge",
};

export default function PricingPage() {
  return (
    <div className="fn-shell fn-stack">
      <SiteHeader />
      <main className="mk-section">
        <PricingClient />
      </main>
      <footer className="mk-footer">
        <div className="mk-footer-inner">
          <div className="footer-note">
            <span>FreightNudge. All rights reserved.</span>
            <span className="mk-footer-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Security</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}