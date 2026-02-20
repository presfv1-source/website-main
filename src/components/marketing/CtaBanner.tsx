"use client";

import Link from "next/link";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function CtaBanner() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />
      <div className={cn("relative", CONTAINER, PAGE_PADDING)}>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4 tracking-tight">
            Ready to respond first?
          </h2>
          <p className="font-sans text-white/90 text-lg mb-8">
            Join brokerages across Texas who never miss a lead.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3 font-sans font-semibold bg-white text-blue-600 hover:bg-white/90 min-h-[48px]"
            >
              Request beta access
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3 font-sans font-semibold border-2 border-white text-white hover:bg-white/10 min-h-[48px]"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
