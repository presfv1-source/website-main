"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { PRICING_PLANS_BETA, PRICING_PLANS_STANDARD } from "@/lib/marketingContent";

type BillingInterval = "monthly" | "annual";

/** Single source of truth: beta plans with standard price for strikethrough. */
const PLANS = PRICING_PLANS_BETA.map((p) => {
  const standard = PRICING_PLANS_STANDARD.find((s) => s.id === p.id);
  return {
    id: p.id,
    name: p.name,
    priceMonthly: p.price ?? 0,
    priceAnnual: p.priceAnnual ?? 0,
    standardPrice: standard?.price ?? 0,
    description: p.description,
    features: p.features,
    featured: p.primary ?? false,
    urgency: p.id === "pro" ? "Only 7 beta spots left" : undefined,
  };
});

export function Pricing() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white">
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-[#0A0A0A] tracking-tight text-[clamp(2rem,4vw,3rem)] mb-4">
            Simple pricing for serious brokerages.
          </h2>
          <p className="font-sans text-gray-500 text-lg">
            Beta pricing — locked for early members.{" "}
            <Link href="/pricing" className="text-blue-600 hover:underline">
              See full details →
            </Link>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const price = interval === "annual" ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-2xl border bg-white p-6 sm:p-8 shadow-sm flex flex-col transition-all hover:border-blue-200 hover:shadow-lg",
                  plan.featured ? "border-2 border-blue-500 shadow-md relative" : "border-gray-200"
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-sans font-medium text-white">
                    Most Popular
                  </span>
                )}
                <span className="inline-flex w-fit rounded-full bg-orange-100 px-2.5 py-1 text-xs font-sans font-medium text-orange-800 mb-4">
                  Beta pricing
                </span>
                <h3 className="font-display font-semibold text-xl text-[#0A0A0A] mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-4 flex-wrap">
                  <span className="font-display text-4xl font-bold text-[#0A0A0A]">
                    ${price}
                  </span>
                  <span className="font-sans text-gray-500">/mo</span>
                  {plan.standardPrice > 0 && (
                    <span className="text-sm font-sans text-gray-400 line-through">
                      normally ${plan.standardPrice}/mo
                    </span>
                  )}
                </div>
                <p className="font-sans text-gray-500 text-sm mb-6 leading-relaxed">
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm font-sans text-gray-600">
                      <Check className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.urgency && (
                  <p className="text-sm font-sans text-amber-700 mb-4">🔥 {plan.urgency}</p>
                )}
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-sans font-semibold bg-[#2563EB] text-white hover:opacity-90 min-h-[48px] w-full"
                >
                  Request beta access
                </Link>
              </div>
            );
          })}
        </div>
        <p className="text-center mt-6">
          <Link href="/pricing" className="font-sans text-blue-600 hover:underline text-sm">
            View full pricing & FAQ →
          </Link>
        </p>
      </div>
    </section>
  );
}
