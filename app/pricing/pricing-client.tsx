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
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400">Pricing</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
            Simple plans that scale with your shipments
          </h1>
          <p className="mt-4 text-lg leading-7 text-neutral-500 dark:text-neutral-400">
            Start free for 14 days. No credit card required, cancel anytime.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium transition-colors duration-200 ${!annual ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}>
              Monthly
            </span>
            <Switch.Root
              checked={annual}
              onCheckedChange={setAnnual}
              aria-label="Toggle annual billing"
              className="relative h-7 w-12 rounded-full bg-neutral-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] transition-colors duration-200 ease-out data-[state=checked]:bg-indigo-600 dark:bg-zinc-700"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-1 rounded-full bg-white shadow-md transition-transform duration-200 ease-out will-change-transform data-[state=checked]:translate-x-6" />
            </Switch.Root>
            <span className={`flex items-center text-sm font-medium transition-colors duration-200 ${annual ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}>
              Annual
              <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const price = annual ? tier.annual : tier.monthly;
            return (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 ease-out ${
                  tier.popular
                    ? "border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.06] to-white shadow-[0_8px_30px_rgba(99,102,241,0.15)] ring-1 ring-inset ring-indigo-500/20 dark:from-indigo-500/10 dark:to-zinc-900"
                    : "border-neutral-200/60 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-3.5 py-1 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(99,102,241,0.4)]">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </span>
                )}
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{tier.name}</h2>
                <p className="mt-1.5 min-h-10 text-sm leading-5 text-neutral-500 dark:text-neutral-400">{tier.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  {price === null ? (
                    <span className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">Custom</span>
                  ) : (
                    <>
                      <span className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">${price}</span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">/ mo{annual ? ", billed annually" : ""}</span>
                    </>
                  )}
                </div>
                <a
                  href="#"
                  className={`mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.98] ${
                    tier.popular
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)] ring-1 ring-inset ring-white/20 hover:shadow-[0_8px_30px_rgba(99,102,241,0.45)] hover:brightness-105"
                      : "border border-neutral-200/60 bg-white text-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-neutral-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-neutral-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {tier.cta}
                </a>
                <ul className="mt-7 space-y-3 border-t border-neutral-200/60 pt-6 dark:border-zinc-800">
                  {tier.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </span>
                      ) : (
                        <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-zinc-800">
                          <Minus className="h-3 w-3 text-neutral-400" />
                        </span>
                      )}
                      <span className={feature.included ? "text-neutral-700 dark:text-neutral-200" : "text-neutral-400 dark:text-neutral-600"}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}