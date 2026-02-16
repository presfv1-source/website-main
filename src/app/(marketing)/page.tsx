import Link from "next/link";
import { Building2, Zap, MessageSquare, Users, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/app/MarketingHeader";
import { MarketingFooter } from "@/components/app/MarketingFooter";
import { HeroSection } from "@/components/app/HeroSection";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

/** Replace with your Loom embed URL (45s demo). Example: https://www.loom.com/embed/xxxxx */
const LOOM_EMBED_URL = process.env.NEXT_PUBLIC_LOOM_EMBED_URL || "";

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingHeader />

      <main>
        <HeroSection />

        <section className={cn(CONTAINER, PAGE_PADDING, "py-12 max-w-5xl mx-auto")}>
          <p className="text-center text-sm text-muted-foreground mb-6">Built for fast-moving teams</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <span className="text-sm font-medium text-muted-foreground/80">Seamless lead sync</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm font-medium text-muted-foreground/80">SMS inbox</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm font-medium text-muted-foreground/80">Simple billing</span>
          </div>
        </section>

        <section className={cn(CONTAINER, PAGE_PADDING, "py-16 max-w-5xl mx-auto")}>
          <h2 className="text-2xl font-bold text-center mb-8">Trusted by broker-owners</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-card p-6 text-card-foreground">
              <p className="text-sm text-muted-foreground italic mb-4">
                &ldquo;We cut our first-response time in half. Zillow leads used to sit for hours—now we reply in minutes.&rdquo;
              </p>
              <p className="text-sm font-medium">— Sarah M., Houston</p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-card-foreground">
              <p className="text-sm text-muted-foreground italic mb-4">
                &ldquo;One inbox for all our lead conversations. No more digging through texts and emails.&rdquo;
              </p>
              <p className="text-sm font-medium">— Mike T., Dallas</p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-card-foreground">
              <p className="text-sm text-muted-foreground italic mb-4">
                &ldquo;Finally we can see who&apos;s following up. The dashboard gives me visibility I never had.&rdquo;
              </p>
              <p className="text-sm font-medium">— Jennifer L., Austin</p>
            </div>
          </div>
        </section>

        <section className={cn(CONTAINER, PAGE_PADDING, "py-24 bg-muted/30 max-w-5xl mx-auto")}>
            <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
            {LOOM_EMBED_URL ? (
              <div className="mb-14 rounded-xl overflow-hidden border bg-card shadow-sm aspect-video max-w-3xl mx-auto">
                <iframe
                  src={LOOM_EMBED_URL}
                  allowFullScreen
                  className="w-full h-full"
                  title="LeadHandler demo video"
                />
              </div>
            ) : null}
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="inline-flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Capture leads</h3>
                <p className="text-muted-foreground text-sm">Connect your lead sources. Leads flow in and sync to your dashboard.</p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Respond quickly</h3>
                <p className="text-muted-foreground text-sm">One inbox for every conversation. Never miss a lead.</p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Track & close</h3>
                <p className="text-muted-foreground text-sm">Dashboard shows performance. Route leads to the right agents.</p>
              </div>
            </div>
        </section>

        <section className={cn(CONTAINER, PAGE_PADDING, "py-24 max-w-5xl mx-auto")}>
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-xl border p-6">
                <Zap className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Smart routing</h3>
                <p className="text-muted-foreground text-sm">Round-robin (more options coming). Get the right lead to the right agent.</p>
              </div>
              <div className="rounded-xl border p-6">
                <MessageSquare className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">SMS inbox</h3>
                <p className="text-muted-foreground text-sm">One inbox. Respond from anywhere.</p>
              </div>
              <div className="rounded-xl border p-6">
                <Shield className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Security & data</h3>
                <p className="text-muted-foreground text-sm">Your data is stored securely; we don&apos;t overclaim compliance.</p>
              </div>
              <div className="rounded-xl border p-6">
                <Building2 className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Seamless lead sync</h3>
                <p className="text-muted-foreground text-sm">Your leads stay in sync. One source of truth, real-time.</p>
              </div>
            </div>
        </section>

        <section className={cn(CONTAINER, PAGE_PADDING, "py-24 bg-muted/30 max-w-3xl mx-auto text-center")}>
            <h2 className="text-3xl font-bold mb-4">Ready to respond first?</h2>
            <p className="text-muted-foreground mb-8">Start your free trial.</p>
          <Button asChild size="lg">
            <Link href="/signup">Start free trial</Link>
          </Button>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
