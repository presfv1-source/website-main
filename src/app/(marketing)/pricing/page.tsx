import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingHeader } from "@/components/app/MarketingHeader";
import { MarketingFooter } from "@/components/app/MarketingFooter";
import { EarlyBirdBanner } from "@/components/app/EarlyBirdBanner";
import { PricingSection } from "@/components/app/PricingSection";
import { CONTAINER, PAGE_PADDING, TYPO } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingHeader />

      <main className={cn(CONTAINER, PAGE_PADDING, "flex-1 py-12 md:py-16")}>
        <div className="text-center">
          <h1 className={cn(TYPO.h1, "text-3xl md:text-4xl")}>Pricing</h1>
          <p className={cn(TYPO.muted, "mt-2")}>
            Choose the plan that fits your brokerage.
          </p>
          <p className={cn(TYPO.muted, "mt-1 text-sm")}>
            {/* was: Texas real estate teams */}
            SMS-first lead response for real estate teams.
          </p>
        </div>

        <EarlyBirdBanner className="mt-8" />

        <div className="mt-10 md:mt-12">
          <PricingSection />
        </div>

        <section className="mt-12 md:mt-16 rounded-xl border bg-muted/30 p-6 md:p-8 text-center max-w-2xl mx-auto">
          {/* was: For Houston brokers */}
          <h2 className={cn(TYPO.h2, "text-xl")}>For brokers</h2>
          <p className={cn(TYPO.muted, "mt-2 text-sm")}>
            Speed-to-lead wins listings. Get instant SMS response, AI qualification, and fair routing—so every lead gets a fast reply and the right agent. Try the demo with no setup.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 min-h-[44px] text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Try demo
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>

        <section className="mt-12 md:mt-16">
          <h2 className={cn(TYPO.h2, "text-center text-xl")}>
            Frequently asked questions
          </h2>
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
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 min-h-[44px] text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
          >
            Claim Beta Spot
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
