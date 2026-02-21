"use client";

import { cn } from "@/lib/utils";

const INBOX_ROWS = [
  {
    initials: "JR",
    avatarClass: "bg-blue-100 text-blue-700",
    name: "James R.",
    source: "Listing #4821",
    preview: "Hi! I saw the sign on Oak Ln, is it still—",
    time: "0:42 ago",
    unread: true,
    agent: "→ Sarah M.",
    agentOrange: false,
    active: true,
  },
  {
    initials: "DK",
    avatarClass: "bg-green-100 text-green-700",
    name: "Diana K.",
    source: "Team number",
    preview: "How much are they asking?",
    time: "3m ago",
    unread: false,
    agent: "→ Marcus W.",
    agentOrange: false,
    active: false,
  },
  {
    initials: "RT",
    avatarClass: "bg-purple-100 text-purple-700",
    name: "Ray T.",
    source: "Listing #3302",
    preview: "Replied: name + looking to buy this s...",
    time: "11m ago",
    unread: false,
    agent: "→ Unassigned",
    agentOrange: true,
    active: false,
  },
];

const STAT_CARDS = [
  { label: "Leads today", value: "9", sub: "+3 vs yesterday", subGreen: true },
  { label: "Avg first reply", value: "0:38s", sub: "↓ from 2.1m", subGreen: true },
  { label: "Routed", value: "8 / 9", sub: "1 pending", subGreen: false },
  { label: "No response", value: "0", sub: "All covered", subGreen: true },
];

export function DashboardMockup() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-100">
        <span className="w-3 h-3 rounded-full bg-red-400" aria-hidden />
        <span className="w-3 h-3 rounded-full bg-yellow-400" aria-hidden />
        <span className="w-3 h-3 rounded-full bg-green-400" aria-hidden />
        <span className="text-gray-400 text-xs mx-auto font-sans">
          app.leadhandler.ai/dashboard
        </span>
      </div>
      <div className="flex min-h-[320px] sm:min-h-[360px]">
        {/* Left panel — Inbox */}
        <div className="w-56 border-r border-gray-100 bg-white shrink-0">
          <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden />
            Inbox
            <span className="text-[10px] font-medium normal-case text-green-600 bg-green-50 rounded px-1.5 py-0.5">
              Live
            </span>
          </div>
          <div className="divide-y-0">
            {INBOX_ROWS.map((row) => (
              <div
                key={row.name}
                className={cn(
                  "px-4 py-3 border-b border-gray-50 hover:bg-gray-50",
                  row.active && "border-l-2 border-l-blue-600 bg-blue-50/30",
                  !row.active && row.agentOrange && "opacity-90"
                )}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      row.avatarClass
                    )}
                  >
                    {row.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {row.name}
                      </span>
                      {row.unread && (
                        <span
                          className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5"
                          aria-hidden
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{row.source}</span>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {row.preview}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-400">{row.time}</span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium rounded px-1.5 py-0.5 mt-1 inline-block",
                        row.agentOrange
                          ? "text-amber-700 bg-amber-50"
                          : "text-blue-600 bg-blue-50"
                      )}
                    >
                      {row.agent}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right panel — Today's stats */}
        <div className="flex-1 bg-gray-50/50 p-4 min-w-0 flex flex-col">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-3">
            Today&apos;s stats
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {STAT_CARDS.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
              >
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
                <p
                  className={cn(
                    "text-[10px] font-medium mt-0.5",
                    card.subGreen ? "text-green-600" : "text-amber-600"
                  )}
                >
                  {card.sub}
                </p>
              </div>
            ))}
          </div>
          <div className="bg-green-50 rounded-lg px-3 py-2 text-xs text-green-800 flex items-center gap-2 mt-auto">
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
              aria-hidden
            />
            Round-robin routing active · 3 agents online
          </div>
        </div>
      </div>
    </div>
  );
}
