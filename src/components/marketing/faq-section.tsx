"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Does this replace my agents?",
    a: "No. LeadHandler routes leads TO your agents faster. They handle the relationship — we handle the first reply and the handoff.",
  },
  {
    q: "Can we use it per listing?",
    a: "Yes. Each listing can have its own number, or you can use one team number for all inbound leads.",
  },
  {
    q: "How fast is setup?",
    a: "No technical setup needed. We'll help you connect your lead sources and get routing in place.",
  },
  {
    q: "Is this available outside Texas?",
    a: "Beta is Texas-first. We're expanding based on demand.",
  },
  {
    q: "What does it cost?",
    a: "Beta pricing starts at $99/mo. See /pricing for full details.",
  },
  {
    q: "Does the lead know it's automated?",
    a: "The first message is fast and helpful — most leads don't notice. You can customize the tone in your settings.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-12 md:py-20 px-4 sm:px-8 bg-[var(--white)]" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center mb-12">
          <div className="mb-3.5 inline-block text-[11px] font-bold uppercase tracking-widest text-[var(--subtle)]">
            FAQ
          </div>
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-bold leading-[1.08] text-[var(--ink)]"
            style={{ letterSpacing: "-1.2px" }}
          >
            In case you missed anything.
          </h2>
        </div>
        <div className="max-w-[660px] mx-auto">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={item.q}
                className="border-b border-[var(--border)] first:border-t first:border-t-[var(--border)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-5 py-5 text-left bg-transparent border-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-bold text-[var(--ink)] tracking-[-0.2px]">
                    {item.q}
                  </span>
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-[var(--subtle)] transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="10" y1="4" x2="10" y2="16" />
                    <line x1="4" y1="10" x2="16" y2="10" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="pb-5 text-[14px] text-[var(--muted)] leading-[1.7]">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
