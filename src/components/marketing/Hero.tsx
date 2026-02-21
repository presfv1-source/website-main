"use client";

import { CONTAINER_WIDE, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { DashboardMockup } from "./DashboardMockup";
import { Button } from "./Button";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center py-16 md:py-24 overflow-hidden bg-slate-950">
      <div className="relative w-full">
        <div className={cn(CONTAINER_WIDE, PAGE_PADDING)}>
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05]">
              Every text lead answered in seconds — routed to the right agent.
            </h1>
            <p className="text-lg md:text-xl text-slate-300/90 max-w-2xl mt-4 leading-relaxed">
              Leads text your listing number. LeadHandler replies instantly, captures their info, and routes the conversation to the right agent — automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 w-full sm:w-auto">
              <Button href="/#beta-form" variant="primary" className="w-full sm:w-auto">
                Request beta access
              </Button>
              <Button href="/#how-it-works" variant="ghost" className="w-full sm:w-auto">
                See how it works
              </Button>
            </div>
            <p className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs text-slate-300/90 border border-white/10 mt-6">
              Built for Texas brokerages · Beta · Limited spots · Setup in minutes
            </p>
            <div className="w-full max-w-3xl mx-auto mt-16 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_0_80px_rgba(139,92,246,0.22)]">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
