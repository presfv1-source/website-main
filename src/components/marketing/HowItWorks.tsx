"use client";

import { MessageCircle, Zap, Route } from "lucide-react";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Lead texts your listing number",
    body: "Someone sees your sign or ad and texts. That's the trigger.",
  },
  {
    icon: Zap,
    title: "Instant auto-reply collects the details",
    body: "LeadHandler texts back immediately — name, buying or selling, timeline, budget. No agent needed.",
  },
  {
    icon: Route,
    title: "Routed to the right agent, tracked in one inbox",
    body: "The conversation goes to the right agent based on your rules. Every thread is logged. Nothing falls through.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-[#F8FAFC]">
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <div className="text-center mb-14">
          <SectionLabel className="mb-3">How it works</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] text-center max-w-2xl mx-auto">
            From &apos;text for info&apos; to routed conversation — in under a minute.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div className="mt-3 flex items-center justify-center w-10 h-10 text-[#2563EB]">
                  <Icon className="h-8 w-8" aria-hidden />
                </div>
                <h3 className="font-semibold text-[#0F172A] text-lg mt-3">
                  {step.title}
                </h3>
                <p className="font-sans text-[#64748B] text-sm leading-relaxed mt-1">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
