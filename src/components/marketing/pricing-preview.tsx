"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { PRICING_PLANS_BETA } from "@/lib/marketingContent";
import { Button } from "@/components/ui/button";

export function PricingPreview() {
  const plans = PRICING_PLANS_BETA.slice(0, 2); // Essentials + Pro

  return (
    <section
      id="pricing"
      className="py-16 sm:py-20 lg:py-24 bg-muted/30"
      aria-labelledby="pricing-heading"
    >
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <div className="text-center mb-12">
          <h2
            id="pricing-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground max-w-2xl mx-auto"
          >
            Simple pricing for serious brokerages
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mt-4">
            Beta pricing — locked for early members.{" "}
            <Link
              href="/pricing"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              See full details →
            </Link>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "rounded-2xl border bg-background/80 backdrop-blur p-6 sm:p-8 shadow-sm flex flex-col transition-all duration-200 hover:shadow-md",
                plan.primary
                  ? "border-primary/50 ring-1 ring-primary/20 relative"
                  : "border-border"
              )}
            >
              {plan.primary && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </span>
              )}
              <span className="inline-flex w-fit rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 px-2.5 py-1 text-xs font-medium mb-4">
                Beta pricing
              </span>
              <h3 className="font-semibold text-xl text-foreground mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-4 flex-wrap">
                <span className="text-4xl font-bold text-foreground">
                  ${plan.price ?? "—"}
                </span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {plan.description}
              </p>
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.slice(0, 4).map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full rounded-xl min-h-[48px] font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring">
                <Link href="/signup">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center mt-6">
          <Link
            href="/pricing"
            className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            View full pricing & FAQ →
          </Link>
        </p>
      </div>
    </section>
  );
}
