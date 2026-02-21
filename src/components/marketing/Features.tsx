"use client";

import {
  Zap,
  Route,
  MessageSquare,
  Eye,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";

const FEATURES = [
  {
    title: "Instant text-back",
    description:
      "Every lead gets a reply in seconds. 24/7, no exceptions.",
    icon: Zap,
  },
  {
    title: "Smart routing",
    description:
      "Round-robin or rules-based. The right agent gets the right lead, every time.",
    icon: Route,
  },
  {
    title: "Shared inbox",
    description:
      "Every SMS conversation in one place. Clean handoffs, no dropped threads.",
    icon: MessageSquare,
  },
  {
    title: "Owner visibility",
    description:
      "See every lead, every response time, every agent. Full accountability.",
    icon: Eye,
  },
  {
    title: "Missed-lead prevention",
    description:
      "If no agent responds, it escalates. No lead sits unanswered.",
    icon: ShieldCheck,
    highlight: true,
  },
  {
    title: "Setup in minutes",
    description:
      "One phone number. A few routing rules. Live the same day.",
    icon: Timer,
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <div className="text-center mb-12">
          <SectionLabel className="mb-3">Features</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] text-center max-w-2xl mx-auto">
            Everything your brokerage needs to stop losing leads.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={cn(
                  "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-default",
                  f.highlight && "ring-1 ring-blue-200 bg-blue-50/30"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB] mb-4 shrink-0">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-semibold text-[#0F172A] text-base">
                  {f.title}
                </h3>
                <p className="font-sans text-[#64748B] text-sm leading-relaxed mt-1">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
