import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { MarketingHeader } from "@/components/app/MarketingHeader";
import { MarketingFooter } from "@/components/app/MarketingFooter";
import { EarlyBirdBanner } from "@/components/app/EarlyBirdBanner";
import { CONTAINER, PAGE_PADDING, TYPO } from "@/lib/ui";
import { cn } from "@/lib/utils";

const plans: Array<{
  name: string;
  badge?: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  primary: boolean;
}> = [
  {
    name: "Essentials",
    price: "$99",
    period: "/mo",
    description: "For small real estate teams getting started.",
    features: ["Up to 15 agents", "AI lead qualification", "Lead routing", "SMS inbox", "Seamless lead sync"],
    cta: "Start free trial",
    href: "/signup",
    primary: false,
  },
  {
    name: "Pro",
    badge: "Popular",
    price: "$249",
    period: "/mo",
    description: "For growing teams that need more coverage.",
    features: ["Unlimited agents", "Everything in Essentials", "Performance visibility", "Priority support"],
    cta: "Start free trial",
    href: "/signup",
    primary: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For larger brokerages and custom or flexible needs.",
    features: ["Unlimited agents", "Everything in Pro", "Dedicated support", "Custom options"],
    cta: "Contact sales",
    href: "/contact",
    primary: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingHeader />

      <main className={cn(CONTAINER, PAGE_PADDING, "flex-1 py-12 md:py-16")}>
        <div className="text-center">
          <h1 className={cn(TYPO.h1, "text-3xl md:text-4xl")}>Pricing</h1>
          <p className={cn(TYPO.muted, "mt-2")}>Choose the plan that fits your brokerage.</p>
          <p className={cn(TYPO.muted, "mt-1 text-sm")}>SMS-first lead response for real estate teams.</p>
        </div>

        <EarlyBirdBanner className="mt-8" />

        <div className="mt-10 md:mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-xl border bg-card p-4 sm:p-6 text-card-foreground flex flex-col",
                plan.primary && "border-2 border-primary"
              )}
            >
              {plan.badge && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary w-fit">
                  {plan.badge}
                </span>
              )}
              <h2 className={cn(TYPO.h3, plan.badge ? "mt-2" : "mt-0")}>{plan.name}</h2>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
                {plan.price}
                <span className={cn(TYPO.muted, "text-base font-normal")}>{plan.period}</span>
              </p>
              <p className={cn(TYPO.muted, "mt-2 text-sm")}>{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-foreground">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={cn(
                  "mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  plan.primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border bg-background hover:bg-muted"
                )}
              >
                {plan.cta}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ))}
        </div>

        <section className="mt-12 md:mt-16">
          <h2 className={cn(TYPO.h2, "text-center text-xl")}>Frequently asked questions</h2>
          <div className="mx-auto mt-8 max-w-2xl space-y-6 text-sm">
            {[
              {
                q: "How long does onboarding take?",
                a: "Most brokerages are up and running within a few days. We'll walk you through connecting your lead sources and agents.",
              },
              {
                q: "Can I try it first?",
                a: "Yes. Start in Demo Mode with sample data—no setup required. When you're ready, connect your own sources in Settings.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. You can cancel or change your plan at any time from Billing. No long-term commitment.",
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <h3 className={cn(TYPO.h3, "text-base")}>{q}</h3>
                <p className={cn(TYPO.muted, "mt-1")}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 md:mt-16 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
          >
            Start free trial
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
