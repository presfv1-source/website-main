"use client";

import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { CtaBanner } from "@/components/marketing/CtaBanner";
import { FadeUp } from "@/components/marketing/FadeUp";
import { SectionLabel } from "@/components/marketing/SectionLabel";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

const VALUES = [
  {
    emoji: "🚀",
    title: "Speed first",
    body: "Speed-to-lead is the #1 factor in real estate conversions. We built everything around responding faster.",
  },
  {
    emoji: "🎯",
    title: "Built for brokers",
    body: "Not a generic CRM. Not a tool you have to customize. Purpose-built for how real estate teams actually work.",
  },
  {
    emoji: "🔍",
    title: "Radical transparency",
    body: "No hidden fees. No fake metrics. No bloated feature lists. Just a tool that does what it says.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main>
        <section className="py-12 md:py-16 bg-[#0A0F1E]">
          <div className={cn(CONTAINER, PAGE_PADDING)}>
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              Built by someone who gets it.
            </h1>
          </div>
        </section>
        <FadeUp>
          <section className="py-16 md:py-24 bg-white">
            <div className={cn(CONTAINER, PAGE_PADDING)}>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <SectionLabel className="mb-3">About</SectionLabel>
                <p className="font-sans text-gray-500 text-lg leading-relaxed">
                  LeadHandler.ai was built in Houston by a founder who saw firsthand how
                  brokerages lose leads — and decided to fix it.
                </p>
              </div>
              <div className="max-w-3xl mx-auto prose prose-lg font-sans text-gray-500 leading-relaxed space-y-6">
                <p>
                  Real estate brokerages lose deals every day — not because of bad agents,
                  but because of slow response times, unclear routing, and zero visibility.
                  LeadHandler.ai exists to solve exactly that. We&apos;re an automated SMS intake and routing
                  platform built specifically for broker-owners who are tired of watching
                  leads go cold.
                </p>
                <p>
                  We&apos;re based in Houston, TX — one of the most competitive real estate
                  markets in the country. We built this for the brokerages here first, and
                  we&apos;re expanding across Texas and beyond.
                </p>
                <p>
                  We&apos;re in beta right now, which means you get to lock in founding
                  pricing, give us direct feedback, and shape the product. If you&apos;re a
                  broker-owner who wants to respond faster, route smarter, and finally have
                  visibility into your team — this is for you.
                </p>
              </div>
            </div>
          </section>
        </FadeUp>

        <FadeUp>
          <section className="py-16 md:py-24 bg-[#F8FAFC]">
            <div className={cn(CONTAINER, PAGE_PADDING)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {VALUES.map((v) => (
                  <div
                    key={v.title}
                    className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-100"
                  >
                    <p className="text-2xl mb-3" aria-hidden>
                      {v.emoji}
                    </p>
                    <h3 className="font-display font-semibold text-[#0A0A0A] text-lg mb-2">
                      {v.title}
                    </h3>
                    <p className="font-sans text-gray-500 text-sm leading-relaxed">
                      {v.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeUp>

        <FadeUp>
          <section className="relative py-16 md:py-24 overflow-hidden bg-gray-950">
            <div className={cn("relative", CONTAINER, PAGE_PADDING)}>
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 tracking-tight">
                  Houston built. Texas focused. Nationally ambitious.
                </h2>
                <p className="font-sans text-white/90 text-lg">
                  We&apos;re starting in Houston and expanding across Texas.
                </p>
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
