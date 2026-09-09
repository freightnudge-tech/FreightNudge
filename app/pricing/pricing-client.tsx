"use client";

import { useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { Check, Minus, Sparkles } from "lucide-react";

type TierFeature = { label: string; included: boolean };

type Tier = {
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  popular?: boolean;
  cta: string;
  features: TierFeature[];
};

const TIERS: Tier[] = [
  {
    name: "Starter",
    tagline: "For small forwarders getting started with document requests.",
    monthly: 29,
    annual: 24,
    cta: "Start free trial",
    features: [
      { label: "25 active requests per month", included: true },
      { label: "Automated email follow-ups", included: true },
      { label: "1 GB document storage", included: true },
      { label: "1 forwarder seat", included: true },
      { label: "WhatsApp follow-ups", included: false },
      { label: "Custom document presets", included: false },
      { label: "API access", included: false },
    ],
  },
  {
    name: "Pro",
    tagline: "For growing teams that need automation and volume.",
    monthly: 79,
    annual: 64,
    popular: true,
    cta: "Start free trial",
    features: [
      { label: "Unlimited active requests", included: true },
      { label: "Automated email follow-ups", included: true },
      { label: "Automated WhatsApp follow-ups", included: true },
      { label: "25 GB document storage", included: true },
      { label: "5 forwarder seats", included: true },
      { label: "Custom document presets", included: true },
      { label: "API access", included: false },
    ],
  },
  {
    name: "Enterprise",
    tagline: "For large logistics operations with advanced needs.",
    monthly: null,
    annual: null,
    cta: "Contact sales",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Unlimited active requests", included: true },
      { label: "Unlimited forwarder seats", included: true },
      { label: "Dedicated storage (1 TB+)", included: true },
      { label: "SSO / SAML", included: true },
      { label: "Full API access", included: true },
      { label: "Dedicated success manager", included: true },
    ],
  },
];

export default function PricingClient() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <div className="mk-head">
        <p className="kicker">Pricing</p>
        <h1 className="mk-title">Simple plans that scale with your shipments</h1>
        <p className="mk-sub">Start free for 14 days. No credit card required, cancel anytime.</p>

        <div className="mk-toggle">
          <span className={`mk-toggle-label ${!annual ? "on" : ""}`}>Monthly</span>
          <Switch.Root
            checked={annual}
            onCheckedChange={setAnnual}
            aria-label="Toggle annual billing"
            className="mk-switch"
          >
            <Switch.Thumb className="mk-switch-thumb" />
          </Switch.Root>
          <span className={`mk-toggle-label ${annual ? "on" : ""}`}>
            Annual
            <span className="fn-pill-green ml-2">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="fn-tier-grid">
        {TIERS.map((tier) => {
          const price = annual ? tier.annual : tier.monthly;
          return (
            <div key={tier.name} className={`fn-tier ${tier.popular ? "popular" : ""}`}>
              {tier.popular && (
                <span className="fn-tier-badge">
                  <Sparkles />
                  Most popular
                </span>
              )}
              <h2 className="fn-tier-name">{tier.name}</h2>
              <p className="fn-tier-tag">{tier.tagline}</p>
              <div className="fn-price">
                {price === null ? (
                  <strong>Custom</strong>
                ) : (
                  <>
                    <strong>${price}</strong>
                    <span>/ mo{annual ? ", billed annually" : ""}</span>
                  </>
                )}
              </div>
              <a href="#" className={`${tier.popular ? "cta" : "fn-btn-ghost"} fn-cta-block`}>
                {tier.cta}
              </a>
              <ul className="fn-tier-features">
                {tier.features.map((feature) => (
                  <li key={feature.label} className={`fn-feature ${feature.included ? "on" : "off"}`}>
                    <i>{feature.included ? <Check /> : <Minus />}</i>
                    {feature.label}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}