"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { CtaBanner } from "@/components/marketing/CtaBanner";
import { FadeUp } from "@/components/marketing/FadeUp";
import { SectionLabel } from "@/components/marketing/SectionLabel";
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

const COMPARISON = [
  { feature: "Agents", essentials: "Up to 15", pro: "Up to 40+" },
  { feature: "Automated SMS", essentials: "✓", pro: "✓" },
  { feature: "Round-robin routing", essentials: "✓", pro: "✓" },
  { feature: "Shared inbox", essentials: "✓", pro: "✓" },
  { feature: "Basic dashboard", essentials: "✓", pro: "✓" },
  { feature: "Analytics", essentials: "—", pro: "✓" },
  { feature: "Weighted routing", essentials: "—", pro: "✓" },
  { feature: "Escalation", essentials: "—", pro: "✓" },
  { feature: "Priority support", essentials: "—", pro: "✓" },
  { feature: "Onboarding", essentials: "—", pro: "✓" },
];

const FAQ_ITEMS = [
  {
    q: "How do I get beta access?",
    a: "Request access via the signup page. We're onboarding a limited number of brokerages during beta.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade anytime from your billing settings. Changes take effect at the next billing cycle.",
  },
  {
    q: "How many leads can I handle?",
    a: "Unlimited leads on all plans. Pricing is based on the number of agents, not lead volume.",
  },
  {
    q: "Do I need technical setup?",
    a: "No dev needed. Setup takes under 30 minutes. We'll guide you through connecting your lead sources and Twilio.",
  },
  {
    q: "What happens after the beta?",
    a: "Your price locks in at the beta rate as long as you stay subscribed. We'll never raise your price for existing customers.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer refunds on a case-by-case basis for beta customers.",
  },
];

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left font-sans"
      >
        <span className="font-medium text-[#0A0A0A]">{question}</span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-gray-500 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <p className="pb-4 font-sans text-gray-500 text-sm leading-relaxed pr-8">{answer}</p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main>
        <section className="py-12 md:py-16 bg-[#0A0F1E]">
          <div className={cn(CONTAINER, PAGE_PADDING)}>
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              Simple beta pricing.
            </h1>
          </div>
        </section>
        <FadeUp>
          <section className="py-16 md:py-24 bg-white">
            <div className={cn(CONTAINER, PAGE_PADDING)}>
              <div className="text-center max-w-2xl mx-auto">
                <SectionLabel className="mb-3">Pricing</SectionLabel>
                <p className="font-sans text-gray-500 text-lg">
                  Beta pricing — locked for early members.
                </p>
                <div className="flex justify-center items-center gap-3 mt-8">
                  <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                    <button
                      type="button"
                      onClick={() => setInterval("monthly")}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-sans font-medium transition-colors min-h-[44px]",
                        interval === "monthly"
                          ? "bg-white text-[#0A0A0A] shadow-sm"
                          : "text-gray-500 hover:text-[#0A0A0A]"
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterval("annual")}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-sans font-medium transition-colors min-h-[44px] flex items-center gap-2",
                        interval === "annual"
                          ? "bg-white text-[#0A0A0A] shadow-sm"
                          : "text-gray-500 hover:text-[#0A0A0A]"
                      )}
                    >
                      Annual
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Save 20%
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
                {PLANS.map((plan) => {
                  const price = interval === "annual" ? plan.priceAnnual : plan.priceMonthly;
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        "rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-blue-100 relative",
                        plan.featured && "ring-1 ring-blue-200"
                      )}
                    >
                      {plan.featured && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 text-white text-xs font-semibold px-3 py-1">
                          Most Popular
                        </span>
                      )}
                      <span className="inline-flex w-fit rounded-full bg-orange-100 px-2.5 py-1 text-xs font-sans font-medium text-orange-800 mb-4">
                        Beta pricing
                      </span>
                      <h2 className="font-display font-semibold text-xl text-[#0A0A0A] mb-1">
                        {plan.name}
                      </h2>
                      <div className="flex items-baseline gap-2 mb-4 flex-wrap">
                        <span className="font-display text-4xl font-bold text-[#0A0A0A]">
                          ${price}
                        </span>
                        <span className="font-sans text-gray-500">/mo</span>
                        {interval === "annual" && (
                          <span className="text-sm font-sans text-gray-400">
                            (billed annually)
                          </span>
                        )}
                        {plan.standardPrice > 0 && (
                          <span className="text-sm font-sans text-gray-400 line-through w-full">
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
                        className="inline-flex items-center justify-center rounded-full px-6 py-3 font-sans font-semibold bg-blue-600 text-white hover:bg-blue-500 min-h-[48px] w-full transition-all"
                      >
                        Request beta access
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </FadeUp>

        <FadeUp>
          <section className="py-16 md:py-24 bg-[#F8FAFC] border-t border-gray-200">
            <div className={cn(CONTAINER, PAGE_PADDING)}>
              <h2 className="font-display font-bold text-[#0A0A0A] text-2xl mb-8 text-center">
                Feature comparison
              </h2>
              <div className="max-w-2xl mx-auto overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <table className="w-full text-left font-sans text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 font-semibold text-[#0A0A0A]">Feature</th>
                      <th className="px-4 py-3 font-semibold text-[#0A0A0A]">Essentials</th>
                      <th className="px-4 py-3 font-semibold text-[#0A0A0A]">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr
                        key={row.feature}
                        className={cn(
                          "border-b border-gray-100 last:border-0",
                          i % 2 === 1 && "bg-gray-50/50"
                        )}
                      >
                        <td className="px-4 py-3 text-gray-600">{row.feature}</td>
                        <td className="px-4 py-3">
                          {row.essentials === "✓" ? (
                            <span className="text-blue-600">✓</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.pro === "✓" ? (
                            <span className="text-blue-600">✓</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </FadeUp>

        <FadeUp>
          <section className="py-16 md:py-24 bg-[#F8FAFC]">
            <div className={cn(CONTAINER, PAGE_PADDING)}>
              <h2 className="font-display font-bold text-[#0A0A0A] text-2xl mb-8 text-center">
                Common questions
              </h2>
              <div className="max-w-2xl mx-auto rounded-2xl border border-gray-200 bg-white p-6">
                {FAQ_ITEMS.map((item, i) => (
                  <FaqItem
                    key={item.q}
                    question={item.q}
                    answer={item.a}
                    open={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                ))}
              </div>
            </div>
          </section>
        </FadeUp>

        <FadeUp>
          <CtaBanner />
        </FadeUp>
        <Footer />
      </main>
    </div>
  );
}
