"use client";

import {
  MessageSquare,
  LayoutDashboard,
  Route,
  Bell,
  Inbox,
  Zap,
} from "lucide-react";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";

const FEATURES = [
  {
    title: "Instant text-back",
    description:
      "Every lead gets a reply in seconds, automatically.",
    icon: MessageSquare,
  },
  {
    title: "Smart routing",
    description:
      "Round-robin or rules-based. Right agent gets the right lead.",
    icon: Route,
  },
  {
    title: "Missed-lead prevention",
    description:
      "No lead sits unanswered. Escalation alerts if no response.",
    icon: Bell,
  },
  {
    title: "Shared inbox",
    description:
      "Every SMS conversation in one place. Handoffs without the chaos.",
    icon: Inbox,
  },
  {
    title: "Owner visibility",
    description:
      "See every lead, every response, every agent. Full accountability.",
    icon: LayoutDashboard,
  },
  {
    title: "Simple setup",
    description:
      "One phone number. A few routing rules. Live in minutes.",
    icon: Zap,
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <div className="text-center mb-14">
          <SectionLabel className="mb-3">Features</SectionLabel>
          <h2 className="font-display font-bold text-[#0A0A0A] tracking-tight text-center max-w-2xl mx-auto text-[clamp(2rem,4vw,3rem)]">
            Everything your brokerage needs to stop losing leads.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="rounded-xl bg-blue-50 w-12 h-12 flex items-center justify-center shrink-0 mb-4">
                  <Icon className="h-6 w-6 text-blue-600" aria-hidden />
                </div>
                <h3 className="font-display font-semibold text-[#0A0A0A] text-[1.15rem] mb-2">
                  {f.title}
                </h3>
                <p className="font-sans text-gray-500 text-sm sm:text-base leading-relaxed">
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
