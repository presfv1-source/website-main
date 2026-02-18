"use client";

import Link from "next/link";
import { Building2, Zap, MessageSquare, Users, Shield, BarChart3, ChevronRight, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MarketingHeader } from "@/components/app/MarketingHeader";
import { MarketingFooter } from "@/components/app/MarketingFooter";
import { HeroSection } from "@/components/app/HeroSection";
import { EarlyBirdBanner } from "@/components/app/EarlyBirdBanner";
import { PricingSection } from "@/components/app/PricingSection";
import { CONTAINER, PAGE_PADDING, SECTION_CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

const LOOM_EMBED_URL = process.env.NEXT_PUBLIC_LOOM_EMBED_URL || "";

const sectionMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const testimonials = [
  {
    quote: "We were losing leads because nobody knew who was supposed to reply. Now every lead gets a first reply in under 5 minutes. Our show rate went up.",
    author: "Sarah M.",
    location: "Houston",
    initials: "SM",
  },
  {
    quote: "One inbox for the whole team—no more digging through personal texts. I can see every conversation and step in when needed.",
    author: "Mike T.",
    location: "Dallas",
    initials: "MT",
  },
  {
    quote: "The dashboard finally shows me who's following up and who's not. I couldn't get that visibility before without asking everyone individually.",
    author: "Jennifer L.",
    location: "Austin",
    initials: "JL",
  },
];

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingHeader />

      <main>
        <HeroSection />

        <motion.section
          {...sectionMotion}
          className={cn(CONTAINER, PAGE_PADDING, "py-12 max-w-5xl mx-auto")}
        >
          <p className="text-center text-sm text-muted-foreground">
            Fast replies, more closings—no extra tools to learn.
          </p>
        </motion.section>

        <motion.section
          {...sectionMotion}
          className={cn(CONTAINER, PAGE_PADDING, "py-16 max-w-5xl mx-auto")}
        >
          <h2 className="text-2xl font-bold text-center mb-8">
            Trusted by Texas broker-owners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.initials}
                className={cn(SECTION_CARD, "p-6 shadow-md flex flex-col")}
              >
                <Quote className="h-8 w-8 text-primary/40 shrink-0 mb-3" aria-hidden />
                <p className="text-sm text-foreground flex-1 mb-6 leading-relaxed">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-sm">{t.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          {...sectionMotion}
          className={cn(CONTAINER, PAGE_PADDING, "py-24 bg-muted/30 max-w-5xl mx-auto")}
        >
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
          <div className="flex flex-col md:flex-row md:items-start md:justify-center gap-8 md:gap-4">
            <div className="text-center flex-1">
              <div className="inline-flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Capture leads</h3>
              <p className="text-muted-foreground text-sm">
                <strong>Setup in under 30 minutes.</strong> Connect your lead sources.{" "}
                <strong>Leads sync to your dashboard.</strong>
              </p>
            </div>
            <div className="hidden md:flex shrink-0 pt-8" aria-hidden>
              <ChevronRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center flex-1">
              <div className="inline-flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Respond quickly</h3>
              <p className="text-muted-foreground text-sm">
                <strong>One inbox</strong> for every conversation. Never miss a lead.
              </p>
            </div>
            <div className="hidden md:flex shrink-0 pt-8" aria-hidden>
              <ChevronRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center flex-1">
              <div className="inline-flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Track & close</h3>
              <p className="text-muted-foreground text-sm">
                Dashboard shows performance. Route leads to your agents.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="features"
          {...sectionMotion}
          className={cn(CONTAINER, PAGE_PADDING, "py-24 max-w-5xl mx-auto")}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="rounded-xl border bg-card p-6">
              <Zap className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Smart routing</h3>
              <p className="text-muted-foreground text-sm">
                Intelligent routing to top performers. Round-robin and escalation.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <MessageSquare className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">SMS inbox</h3>
              <p className="text-muted-foreground text-sm">
                <strong>One inbox.</strong> Respond from anywhere.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Security & data</h3>
              <p className="text-muted-foreground text-sm">
                Your data is stored securely; we don&apos;t overclaim compliance.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <Building2 className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Seamless lead sync</h3>
              <p className="text-muted-foreground text-sm">
                Your leads stay in sync. <strong>One source of truth, real-time.</strong>
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="pricing"
          {...sectionMotion}
          className={cn(CONTAINER, PAGE_PADDING, "py-24 max-w-5xl mx-auto")}
        >
          <h2 className="text-3xl font-bold text-center mb-4">Pricing</h2>
          <p className="text-center text-muted-foreground mb-8">
            Lock beta pricing before standard rates.
          </p>
          <EarlyBirdBanner className="mb-10" />
          <PricingSection />
        </motion.section>

        <motion.section
          {...sectionMotion}
          className={cn(CONTAINER, PAGE_PADDING, "py-24 bg-muted/30 max-w-3xl mx-auto text-center")}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to respond first?</h2>
          <p className="text-muted-foreground mb-8">Start your free trial.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="min-h-[44px]">
              <Link href="/signup">Start free trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-[44px]">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            <Link href="/contact" className="font-medium text-primary hover:underline">
              Talk to sales
            </Link>
          </p>
        </motion.section>
      </main>

      <MarketingFooter />
    </div>
  );
}
