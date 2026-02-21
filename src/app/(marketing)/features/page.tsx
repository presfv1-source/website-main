"use client";

import Link from "next/link";
import {
  MessageSquare,
  Route,
  LayoutDashboard,
  Inbox,
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { CtaBanner } from "@/components/marketing/CtaBanner";
import { FadeUp } from "@/components/marketing/FadeUp";
import { SectionLabel } from "@/components/marketing/SectionLabel";
import { Button } from "@/components/marketing/Button";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    id: "sms",
    title: "Instant text-back",
    copy: "Every lead gets a reply in seconds, automatically.",
    tags: ["Instant response", "24/7", "Automatic"],
    illustration: "left",
  },
  {
    id: "routing",
    title: "Smart routing",
    copy: "Round-robin or rules-based. Right agent gets the right lead.",
    tags: ["Round-robin", "Rules-based", "Escalation"],
    illustration: "right",
  },
  {
    id: "escalation",
    title: "Missed-lead prevention",
    copy: "No lead sits unanswered. Escalation alerts if no response.",
    tags: ["Alerts", "No lead left behind"],
    illustration: "left",
  },
  {
    id: "inbox",
    title: "Shared inbox",
    copy: "Every SMS conversation in one place. Handoffs without the chaos.",
    tags: ["Threaded SMS", "Message history", "Status tracking"],
    illustration: "right",
  },
  {
    id: "dashboard",
    title: "Owner visibility",
    copy: "See every lead, every response, every agent. Full accountability.",
    tags: ["Live metrics", "Agent performance", "Full visibility"],
    illustration: "left",
  },
  {
    id: "setup",
    title: "Simple setup",
    copy: "One phone number. A few routing rules. Live in minutes.",
    tags: ["One number", "Quick setup", "Live in minutes"],
    illustration: "right",
  },
];

function SmsMockup() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg max-w-sm">
      <div className="space-y-3">
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2 text-sm font-sans text-gray-700 max-w-[80%]">
            Hi, I saw your listing at 123 Oak St. Is it still available?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2 text-sm font-sans text-white max-w-[80%]">
            Are you looking to buy or sell?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2 text-sm font-sans text-gray-700 max-w-[80%]">
            Looking to buy
          </div>
        </div>
      </div>
    </div>
  );
}

function RoutingMockup() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg max-w-xs">
      <div className="flex items-center justify-between gap-2">
        {["A", "B", "C"].map((l, i) => (
          <div
            key={l}
            className="w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-sm font-display font-bold text-blue-600"
          >
            {l}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-2">
        <Route className="h-6 w-6 text-gray-400" aria-hidden />
      </div>
      <p className="text-center text-xs font-sans text-gray-500 mt-1">Round-robin</p>
    </div>
  );
}

function DashboardMiniMockup() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg max-w-xs">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 font-sans">
        Today
      </p>
      <div className="grid grid-cols-2 gap-2">
        {["24", "2.5m", "8", "68%"].map((v, i) => (
          <div key={i} className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-lg font-display font-semibold text-[#0A0A0A]">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InboxMockup() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg max-w-sm overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-2 bg-gray-50">
        <p className="text-xs font-sans font-medium text-gray-600">Inbox</p>
      </div>
      <div className="divide-y divide-gray-100">
        {["James R. · Listing", "Maria S. · Direct", "David K. · Referral"].map((row) => (
          <div key={row} className="px-4 py-3 text-sm font-sans text-[#0A0A0A]">
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}

function EscalationMockup() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg max-w-xs">
      <p className="text-xs font-sans font-medium text-gray-500 mb-2">Escalation</p>
      <div className="space-y-2">
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-sans text-amber-800">
          No reply in 15m → alert
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-sans text-gray-600">
          Lead never sits unanswered
        </div>
      </div>
    </div>
  );
}

function SetupMockup() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg max-w-xs">
      <p className="text-xs font-sans font-medium text-gray-500 mb-2">Setup</p>
      <div className="space-y-2 text-sm font-sans text-gray-600">
        <p>1. Add your number</p>
        <p>2. Set routing rules</p>
        <p>3. Go live in minutes</p>
      </div>
    </div>
  );
}

const ILLUSTRATIONS: Record<string, React.ReactNode> = {
  sms: <SmsMockup />,
  routing: <RoutingMockup />,
  escalation: <EscalationMockup />,
  dashboard: <DashboardMiniMockup />,
  inbox: <InboxMockup />,
  setup: <SetupMockup />,
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main>
        <section className="py-12 md:py-16 bg-[#0A0F1E]">
          <div className={cn(CONTAINER, PAGE_PADDING)}>
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              Built for brokerages that can&apos;t afford to miss a lead.
            </h1>
          </div>
        </section>
        <FadeUp>
          <section className="py-16 md:py-24 bg-white">
            <div className={cn(CONTAINER, PAGE_PADDING)}>
              <div className="text-center max-w-2xl mx-auto">
                <SectionLabel className="mb-3">Features</SectionLabel>
                <p className="font-sans text-gray-600 text-lg leading-relaxed mb-8">
                  Every feature is designed around one goal — making sure your leads get
                  responded to, routed, and handed to the right agent before your competition even wakes up.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button href="/signup" variant="primary">
                    Request beta access
                  </Button>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-full px-8 py-3.5 font-semibold font-sans text-base border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all min-h-[44px]"
                  >
                    See pricing →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </FadeUp>

        {FEATURES.map((f, i) => (
          <FadeUp key={f.id} delay={i * 50}>
            <section
              className={cn(
                "py-16 md:py-24",
                i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"
              )}
            >
              <div className={cn(CONTAINER, PAGE_PADDING)}>
                <div
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-12 items-center",
                    f.illustration === "right" && "md:grid-flow-dense"
                  )}
                >
                  <div className={f.illustration === "right" ? "md:col-start-2" : ""}>
                    <h2 className="font-display font-bold text-[#0A0A0A] text-2xl mb-4">
                      {f.title}
                    </h2>
                    <p className="font-sans text-gray-500 leading-relaxed mb-4">{f.copy}</p>
                    <div className="flex flex-wrap gap-2">
                      {f.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-sans font-medium text-blue-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex justify-center",
                      f.illustration === "right" ? "md:col-start-1 md:row-start-1" : ""
                    )}
                  >
                    {ILLUSTRATIONS[f.id]}
                  </div>
                </div>
              </div>
            </section>
          </FadeUp>
        ))}

        <FadeUp>
          <CtaBanner />
        </FadeUp>
        <Footer />
      </main>
    </div>
  );
}
