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
import { PRICING_PLANS_BETA } from "@/lib/marketingContent";

type BillingInterval = "monthly" | "annual";

/** Beta plans: Starter, Growth, Enterprise. */
const PLANS = PRICING_PLANS_BETA.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  priceAnnual: p.priceAnnual ?? 0,
  period: p.period,
  description: p.description,
  features: p.features,
  featured: p.primary ?? false,
  cta: p.cta,
  href: p.href,
}));

const COMPARISON = [
  { feature: "Agents", essentials: "Up to 5", pro: "Up to 15", enterprise: "Unlimited" },
  { feature: "Shared inbox", essentials: "✓", pro: "✓", enterprise: "✓" },
  { feature: "Round-robin routing", essentials: "✓", pro: "✓", enterprise: "✓" },
  { feature: "All routing modes", essentials: "—", pro: "✓", enterprise: "✓" },
  { feature: "Performance metrics", essentials: "—", pro: "✓", enterprise: "✓" },
  { feature: "Priority support", essentials: "—", pro: "✓", enterprise: "✓" },
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
    a: "No technical setup needed. We'll help you connect your lead sources.",
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
    <div className="border-b border-[var(--border)] last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left font-sans"
      >
        <span className="font-medium text-[var(--ink)]">{question}</span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-[var(--muted)] transition-transform", open && "rotate-180 text-[var(--ink)]")}
          aria-hidden
        />
      </button>
      {open && (
        <p className="pb-4 font-sans text-[var(--muted)] text-sm leading-relaxed pr-8">{answer}</p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--white)]">
      <Navbar />
      <main>
        <section className="py-16 md:py-20 bg-[var(--off)]">
          <div className={cn(CONTAINER, PAGE_PADDING, "text-center max-w-2xl mx-auto")}>
            <SectionLabel className="mb-3">Pricing</SectionLabel>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.5px] text-[var(--ink)]">
              Simple beta pricing.
            </h1>
            <p className="mt-4 text-[var(--muted)] text-base sm:text-lg leading-relaxed">
              Beta pricing — locked for early members.
            </p>
            <div className="flex justify-center items-center gap-3 mt-8">
              <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--off2)] p-1">
                <button
                  type="button"
                  onClick={() => setInterval("monthly")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-sans font-medium transition-colors min-h-[44px]",
                    interval === "monthly"
                      ? "bg-[var(--white)] text-[var(--ink)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
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
                      ? "bg-[var(--white)] text-[var(--ink)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
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
        </section>
        <FadeUp>
          <section className="py-16 md:py-24 bg-[var(--white)]">
            <div className={cn(CONTAINER, PAGE_PADDING)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
                {PLANS.map((plan) => {
                  const isEnterprise = plan.price == null;
                  const price = isEnterprise ? null : interval === "annual" ? plan.priceAnnual : plan.price;
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        "rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 sm:p-8 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-[var(--border2)] relative",
                        plan.featured && "ring-2 ring-[var(--border)]"
                      )}
                    >
                      {plan.featured && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--ink)] text-white text-xs font-semibold px-3 py-1">
                          Popular
                        </span>
                      )}
                      {!isEnterprise && (
                        <span className="inline-flex w-fit rounded-full bg-orange-100 px-2.5 py-1 text-xs font-sans font-medium text-orange-800 mb-4">
                          Beta pricing
                        </span>
                      )}
                      <h2 className="font-display font-semibold text-xl text-[var(--ink)] mb-1">
                        {plan.name}
                      </h2>
                      <div className="flex items-baseline gap-2 mb-4 flex-wrap">
                        {isEnterprise ? (
                          <span className="font-display text-2xl font-bold text-[var(--ink)]">Custom</span>
                        ) : (
                          <>
                            <span className="font-display text-4xl font-bold text-[var(--ink)]">
                              ${price}
                            </span>
                            <span className="font-sans text-[var(--muted)]">/mo</span>
                            {interval === "annual" && (
                              <span className="text-sm font-sans text-[var(--subtle)]">
                                (billed annually)
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <p className="font-sans text-[var(--muted)] text-sm mb-6 leading-relaxed">
                        {plan.description}
                      </p>
                      <ul className="space-y-3 mb-6 flex-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm font-sans text-[var(--muted)]">
                            <Check className="h-4 w-4 shrink-0 text-[var(--ink)] mt-0.5" aria-hidden />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={plan.href}
                        className={cn(
                          "inline-flex items-center justify-center rounded-lg px-6 py-3 font-sans font-semibold min-h-[48px] w-full transition-all",
                          plan.id === "enterprise"
                            ? "border-2 border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--off)]"
                            : "bg-[var(--ink)] text-white hover:opacity-90"
                        )}
                      >
                        {plan.cta}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </FadeUp>

        <FadeUp>
          <section className="py-16 md:py-24 bg-[var(--off)] border-t border-[var(--border)]">
            <div className={cn(CONTAINER, PAGE_PADDING)}>
              <h2 className="font-display font-bold text-[var(--ink)] text-2xl mb-8 text-center">
                Feature comparison
              </h2>
              <div className="max-w-3xl mx-auto overflow-x-auto overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--white)]">
                <table className="w-full text-left font-sans text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--off)]">
                      <th className="px-4 py-3 font-semibold text-[var(--ink)]">Feature</th>
                      <th className="px-4 py-3 font-semibold text-[var(--ink)]">Starter</th>
                      <th className="px-4 py-3 font-semibold text-[var(--ink)]">Growth</th>
                      <th className="px-4 py-3 font-semibold text-[var(--ink)]">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr
                        key={row.feature}
                        className={cn(
                          "border-b border-[var(--border)] last:border-0",
                          i % 2 === 1 && "bg-[var(--off)]/50"
                        )}
                      >
                        <td className="px-4 py-3 text-[var(--muted)]">{row.feature}</td>
                        <td className="px-4 py-3">
                          {row.essentials === "✓" ? <span className="text-[var(--ink)]">✓</span> : <span className="text-[var(--subtle)]">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {row.pro === "✓" ? <span className="text-[var(--ink)]">✓</span> : <span className="text-[var(--subtle)]">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {row.enterprise === "✓" ? <span className="text-[var(--ink)]">✓</span> : (row.enterprise as string)}
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
          <section className="py-16 md:py-24 bg-[var(--off)]">
            <div className={cn(CONTAINER, PAGE_PADDING)}>
              <h2 className="font-display font-bold text-[var(--ink)] text-2xl mb-8 text-center">
                Common questions
              </h2>
              <div className="max-w-2xl mx-auto rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6">
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
