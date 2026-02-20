"use client";

import { Clock, TrendingDown, Zap } from "lucide-react";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

const BULLETS = [
  { icon: Clock, text: "Leads go cold fast. The first reply wins the conversation." },
  { icon: TrendingDown, text: "Agents are busy, in showings, or off the clock. Gaps happen." },
  { icon: Zap, text: "Speed is the only edge that matters before price." },
];

export function WhyThisMatters() {
  return (
    <section className="py-16 md:py-24 bg-gray-950 text-white">
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Most teams lose leads in the first 60 seconds.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BULLETS.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <Icon className="h-10 w-10 text-blue-400 mb-4" aria-hidden />
              <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-white font-semibold text-lg mt-10 max-w-xl mx-auto">
          LeadHandler guarantees the first response happens instantly — every
          time, 24/7.
        </p>
      </div>
    </section>
  );
}
