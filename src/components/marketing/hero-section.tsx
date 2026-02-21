"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section
      className="flex flex-col items-center border-b border-[var(--border)] bg-[var(--white)] pt-20 pb-0 text-center px-4 sm:px-8"
      aria-labelledby="hero-heading"
    >
      <div
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border2)] bg-[var(--white)] py-1.5 pl-2 pr-3.5 mb-7 text-[12px] font-medium text-[var(--muted)]"
        style={{ paddingLeft: 8, paddingRight: 14 }}
      >
        <span className="rounded-full bg-[var(--ink)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Beta
        </span>
        Texas brokerages · Limited spots open
      </div>
      <h1
        id="hero-heading"
        className="text-[clamp(40px,5.8vw,72px)] font-black leading-[1.03] text-[var(--ink)] max-w-[800px] mb-5"
        style={{ letterSpacing: "-2.5px" }}
      >
        Every text lead answered in seconds.
      </h1>
      <p className="text-base text-[var(--muted)] font-normal max-w-[460px] leading-[1.65] mb-8">
        Leads text your listing number. LeadHandler replies instantly, collects their info, and routes the conversation to the right agent — automatically.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5 mb-14">
        <Link
          href="#form"
          className="inline-flex items-center rounded-[10px] bg-[var(--ink)] px-6 py-3 text-sm font-bold text-white no-underline tracking-[-0.1px] transition-all duration-[0.14s] hover:opacity-80 hover:-translate-y-px"
        >
          Request beta access
        </Link>
        <Link
          href="#how-it-works"
          className="inline-flex items-center rounded-[10px] border-[1.5px] border-[var(--border2)] bg-[var(--white)] px-6 py-3 text-sm font-medium text-[var(--ink)] no-underline tracking-[-0.1px] transition-all duration-[0.14s] hover:border-[var(--ink)]"
        >
          See how it works
        </Link>
      </div>

      {/* App screenshot mockup — pure HTML/CSS */}
      <div
        className="w-full max-w-[980px] rounded-t-2xl border border-[var(--border)] border-b-0 overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,.08),0_1px_4px_rgba(0,0,0,.04)]"
        aria-hidden
      >
        <div className="flex h-10 items-center gap-2.5 border-b border-[var(--border)] bg-[var(--off)] px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex flex-1 items-center justify-center h-6 rounded-md border border-[var(--border)] bg-[var(--white)] text-[11px] text-[var(--subtle)]">
            app.leadhandler.ai / dashboard
          </div>
        </div>
        <div className="flex h-[420px] bg-[var(--white)]">
          {/* Sidebar */}
          <div className="w-[196px] flex-shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--off)]">
            <div className="border-b border-[var(--border)] px-4 py-3.5 text-[13px] font-extrabold text-[var(--ink)] tracking-[-0.4px]">
              LeadHandler.ai
            </div>
            <div className="px-3 py-3 pt-3 text-[9.5px] font-bold uppercase tracking-widest text-[var(--subtle)]">
              Menu
            </div>
            <div className="mx-2 mb-1 rounded-lg bg-[var(--white)] px-2.5 py-1.5 text-[12.5px] font-semibold text-[var(--ink)] shadow-sm flex items-center gap-2">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-3 w-3 shrink-0">
                <rect x="1" y="1" width="4" height="4" rx="0.8" />
                <rect x="9" y="1" width="4" height="4" rx="0.8" />
                <rect x="1" y="9" width="4" height="4" rx="0.8" />
                <rect x="9" y="9" width="4" height="4" rx="0.8" />
              </svg>
              Dashboard
            </div>
            <div className="mx-2 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--muted)] flex items-center gap-2">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-3 w-3 shrink-0">
                <path d="M7 1l1.5 4.5H13l-3.8 2.8 1.5 4.5L7 10 3.3 12.8l1.5-4.5L1 5.5h4.5z" />
              </svg>
              Leads
            </div>
            <div className="mx-2 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--muted)] flex items-center gap-2">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-3 w-3 shrink-0">
                <path d="M12 9a2 2 0 01-2 1.5H4l-2.5 2.5V3a2 2 0 012-2h7a2 2 0 012 2v6z" />
              </svg>
              Inbox
            </div>
            <div className="mx-2 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--muted)] flex items-center gap-2">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-3 w-3 shrink-0">
                <circle cx="2.5" cy="7" r="1.8" />
                <circle cx="11.5" cy="2.5" r="1.8" />
                <circle cx="11.5" cy="11.5" r="1.8" />
                <line x1="4.2" y1="6.2" x2="9.8" y2="3.3" />
                <line x1="4.2" y1="7.8" x2="9.8" y2="10.7" />
              </svg>
              Routing
            </div>
            <div className="mx-2 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--muted)] flex items-center gap-2">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-3 w-3 shrink-0">
                <circle cx="7" cy="4" r="2.5" />
                <path d="M1.5 13c0-2.5 2.5-4.5 5.5-4.5s5.5 2 5.5 4.5" />
              </svg>
              Agents
            </div>
          </div>
          {/* Main */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--white)] px-5 py-3">
              <span className="text-[13px] font-extrabold text-[var(--ink)] tracking-[-0.3px]">Live inbox</span>
              <span className="flex items-center gap-1.5 rounded-full border border-[var(--border2)] bg-[var(--off2)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)] animate-pulse" />
                3 agents online
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 border-b border-[var(--border)] bg-[var(--off)] p-3 px-4">
              {[
                { label: "Leads today", value: "9", sub: "+3 from yesterday", subMuted: true },
                { label: "Avg reply", value: "38s", sub: "↓ from 2.1 min", subMuted: true },
                { label: "Routed", value: "8/9", sub: "1 pending", subMuted: false },
                { label: "Unanswered", value: "0", sub: "All covered", subMuted: true },
              ].map((k) => (
                <div key={k.label} className="rounded-[10px] border border-[var(--border)] bg-[var(--white)] px-3 py-2">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--subtle)] mb-0.5">{k.label}</div>
                  <div className="text-lg font-black text-[var(--ink)] tracking-tight leading-none">{k.value}</div>
                  <div className={`text-[9px] font-semibold mt-0.5 ${k.subMuted ? "text-[var(--muted)]" : "text-[var(--muted)]"}`}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 pt-2">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--subtle)]">Conversations</span>
              <span className="rounded-full bg-[var(--ink)] px-1.5 py-0.5 text-[9.5px] font-bold text-white">9</span>
            </div>
            {[
              { initials: "JR", name: "James R.", time: "42s ago", src: "Listing #4821 · Oak Ln, Austin", prev: '"Hi, saw the sign — is it still available?"', chip: "→ Routed to Sarah M.", chipWarn: false, active: true, unread: true },
              { initials: "DK", name: "Diana K.", time: "3m ago", src: "Team number · Direct", prev: '"How much are they asking for it?"', chip: "→ Routed to Marcus W.", chipWarn: false, active: false, unread: false },
              { initials: "RT", name: "Ray T.", time: "11m ago", src: "Listing #3302 · Cedar Park", prev: '"Looking to buy this summer, budget is..."', chip: "Pending assignment", chipWarn: true, active: false, unread: false },
            ].map((t) => (
              <div
                key={t.name}
                className={`flex items-start gap-2 px-4 py-2.5 border-b border-[var(--off2)] bg-[var(--white)] ${t.active ? "border-l-[2.5px] border-l-[var(--ink)] bg-[var(--off)] pl-[13.5px]" : ""}`}
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--off2)] text-[10px] font-extrabold text-[var(--ink)]">
                  {t.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1 mb-0.5">
                    <span className="text-[11.5px] font-bold text-[var(--ink)]">{t.name}</span>
                    <span className="text-[9.5px] text-[var(--subtle)]">{t.time}</span>
                  </div>
                  <div className="text-[10px] text-[var(--subtle)] mb-0.5">{t.src}</div>
                  <div className="text-[11px] text-[var(--muted)] truncate mb-1">{t.prev}</div>
                  <span className={`inline-flex text-[9.5px] font-semibold rounded-md px-1.5 py-0.5 border ${t.chipWarn ? "text-[var(--muted)] border-[var(--border2)] bg-[var(--off2)]" : "text-[var(--ink)] border-[var(--border2)] bg-[var(--off)]"}`}>
                    {t.chip}
                  </span>
                </div>
                {t.unread && <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--ink)]" />}
              </div>
            ))}
            <div className="mx-4 mt-auto mb-3 flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--off)] px-3 py-1.5 text-[10px] font-medium text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)] animate-pulse" />
              Round-robin routing active · 3 agents online
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
