"use client";

import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";

const STEPS = [
  { title: "Lead texts your listing number", body: "Leads text your listing or team number. Captured instantly." },
  { title: "Instant auto-reply collects name, interest, and timing", body: "We reply in seconds and collect the basics so agents have context." },
  { title: "Routed to the right agent based on your rules", body: "Round-robin or rules-based. The right agent gets the conversation." },
  { title: "Everything logged — broker sees every conversation", body: "Full visibility in one place. No lead falls through." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gray-50">
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <div className="text-center mb-14">
          <SectionLabel className="mb-3">How it works</SectionLabel>
          <h2 className="font-display font-bold text-[#0A0A0A] tracking-tight text-center max-w-2xl mx-auto text-[clamp(2rem,4vw,3rem)]">
            From first text to agent in seconds.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-blue-50 ring-4 ring-blue-50 flex items-center justify-center text-xl font-display font-bold text-blue-600 mb-4 shrink-0 relative z-10">
                {i + 1}
              </div>
              <h3 className="font-display font-semibold text-[#0A0A0A] text-lg mb-2">
                {step.title}
              </h3>
              <p className="font-sans text-gray-500 text-sm sm:text-base max-w-sm leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
