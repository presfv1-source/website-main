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
import { UserPlus, Clock, User } from "lucide-react";

/** Optional: add public/dashboard-screenshot.png and set USE_DASHBOARD_IMAGE = true for real screenshot */
const USE_DASHBOARD_IMAGE = false;
const DASHBOARD_IMAGE_PATH = "/dashboard-screenshot.png";

const FAKE_STATS = [
  { label: "New leads", value: "12", tooltip: "Leads in the last 7 days" },
  { label: "Avg response", value: "3 min", tooltip: "First-reply time across team" },
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
    <section className="relative py-20 md:py-28 px-4 md:px-8 overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-burnt-orange/5"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--primary)/8%,transparent)]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,var(--burnt-orange)/6%,transparent)]" aria-hidden />

      <div className="relative container max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
            Respond first. <span className="underline decoration-burnt-orange/60 decoration-2 underline-offset-4">Close more.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            Speed-to-lead wins listings. Texas broker-owners use LeadHandler to reply in minutes, qualify with AI, and route every lead to the right agent—from one inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base min-h-[44px] hover:ring-2 hover:ring-burnt-orange/40 hover:ring-offset-2">
              <Link href="/login">Try demo</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base min-h-[44px]">
              <Link href="/#pricing">View pricing</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="rounded-xl border border-border/80 bg-card/95 shadow-lg shadow-primary/10 overflow-hidden ring-1 ring-black/5">
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
              <div className="relative aspect-[16/10] w-full bg-muted/30 p-6 md:p-8">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Dashboard preview
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                  {FAKE_STATS.map((s) => (
                    <Tooltip key={s.label}>
                      <TooltipTrigger asChild>
                        <div className="rounded-lg border bg-card px-4 py-3 shadow-sm flex items-center gap-3 cursor-default">
                          <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                            {s.label === "New leads" ? (
                              <UserPlus className="h-4 w-4 text-primary" />
                            ) : (
                              <Clock className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="text-lg font-semibold">{s.value}</p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{s.tooltip}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Inbox</p>
                    <div className="rounded-lg border bg-card divide-y shadow-sm overflow-hidden">
                      {FAKE_INBOX.map((t) => (
                        <Tooltip key={t.name}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-default">
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
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Recent activity</p>
                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                      <div className="relative pl-5 pr-3 py-2 space-y-0">
                        <div className="absolute left-2 top-0 bottom-0 w-px bg-border" aria-hidden />
                        {FAKE_TIMELINE.map((e, i) => (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <div className="relative flex gap-2 py-2.5 first:pt-2 last:pb-2">
                                <span className="absolute left-0 w-2 h-2 rounded-full bg-primary -translate-x-[calc(0.5rem-2px)] top-5" aria-hidden />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm">{e.text}</p>
                                  <p className="text-xs text-muted-foreground">{e.time}</p>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Activity in your brokerage</TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
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
