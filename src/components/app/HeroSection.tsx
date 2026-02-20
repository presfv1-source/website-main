"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UserPlus, Clock, User, Route } from "lucide-react";
import { MARKETING_POSITIONING } from "@/lib/marketingContent";

/** Optional: add public/dashboard-screenshot.png and set USE_DASHBOARD_IMAGE = true for real screenshot */
const USE_DASHBOARD_IMAGE = false;
const DASHBOARD_IMAGE_PATH = "/dashboard-screenshot.png";

/** Dashboard preview metrics (demo-friendly; no closed-deals implication) */
const PREVIEW_STATS = [
  { label: "New leads", value: "12", tooltip: "Leads in the last 7 days" },
  { label: "Avg first reply", value: "2.5 min", tooltip: "First-reply time across team" },
  { label: "Conversations active", value: "8", tooltip: "Active SMS threads" },
  { label: "Routed today", value: "3", tooltip: "Leads assigned today" },
];

const FAKE_INBOX = [
  { name: "James R.", preview: "When can we tour?", time: "2m ago" },
  { name: "Maria S.", preview: "Thanks! See you Saturday", time: "15m ago" },
  { name: "David K.", preview: "Interested in 3br in Heights", time: "1h ago" },
];

const FAKE_TIMELINE = [
  { text: "Lead assigned to Sarah", time: "2m ago" },
  { text: "New lead from Zillow — James R.", time: "5m ago" },
  { text: "Replied to Maria S.", time: "18m ago" },
  { text: "Status: Maria S. → Appointment", time: "1h ago" },
  { text: "Lead assigned to Mike", time: "2h ago" },
];

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 overflow-hidden bg-gray-950">
      <div
        className="absolute inset-0 bg-gradient-to-b from-gray-950 to-gray-900/95"
        aria-hidden
      />

      <div className="relative container max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 text-white leading-[1.05]">
            {MARKETING_POSITIONING.headline}
          </h1>
          <p className="text-base sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            {MARKETING_POSITIONING.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-8 py-3.5 font-semibold bg-blue-600 text-white hover:bg-blue-500">
              <Link href="/demo">Try demo</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 py-3.5 font-semibold border-slate-600 text-slate-300 hover:border-slate-400 hover:bg-white/5">
              <Link href="/#pricing">View pricing</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl min-w-0 hidden sm:block rounded-2xl border border-white/10 shadow-[0_0_80px_rgba(37,99,235,0.15)] overflow-hidden">
          <div className="rounded-2xl border border-white/10 bg-card/95 shadow-lg overflow-hidden min-w-0">
            {USE_DASHBOARD_IMAGE ? (
              <Image
                src={DASHBOARD_IMAGE_PATH}
                alt="LeadHandler dashboard preview"
                width={960}
                height={600}
                className="w-full h-auto object-contain"
                priority
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 960 600'%3E%3Crect fill='%23f1f5f9' width='960' height='600'/%3E%3C/svg%3E"
              />
            ) : (
              <div className="relative aspect-[16/10] w-full bg-muted/30 p-6 md:p-8 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Dashboard preview
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                  {PREVIEW_STATS.map((s) => (
                    <Tooltip key={s.label}>
                      <TooltipTrigger asChild>
                        <div className="rounded-lg border bg-card px-4 py-3 shadow-sm flex items-center gap-3 cursor-default min-w-0">
                          <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            {s.label === "New leads" ? (
                              <UserPlus className="h-4 w-4 text-primary" />
                            ) : s.label === "Avg first reply" ? (
                              <Clock className="h-4 w-4 text-primary" />
                            ) : s.label === "Conversations active" ? (
                              <User className="h-4 w-4 text-primary" />
                            ) : (
                              <Route className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                            <p className="text-lg font-semibold">{s.value}</p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{s.tooltip}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Inbox</p>
                    <div className="rounded-lg border bg-card divide-y shadow-sm overflow-hidden min-w-0">
                      {FAKE_INBOX.map((t) => (
                        <Tooltip key={t.name}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-default min-w-0">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{t.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{t.preview}</p>
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0">{t.time}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Conversation with {t.name}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Recent activity</p>
                    <div className="flex flex-col md:grid md:grid-cols-2 gap-4 min-w-0">
                      {FAKE_TIMELINE.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 rounded-lg bg-card border border-border px-4">
                          No demo activity – sign up to see real ones!
                        </p>
                      ) : (
                        FAKE_TIMELINE.map((e, i) => (
                          <Tooltip key={`timeline-${i}`}>
                            <TooltipTrigger asChild>
                              <div className="p-4 rounded-lg bg-card shadow-sm border border-border flex flex-col gap-1 min-w-0">
                                <p className="text-sm break-words">{e.text}</p>
                                <p className="text-xs text-muted-foreground whitespace-nowrap">{e.time}</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Activity in your brokerage</TooltipContent>
                          </Tooltip>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
