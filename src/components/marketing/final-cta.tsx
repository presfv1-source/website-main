"use client";

import Link from "next/link";

export function FinalCta() {
  return (
    <section className="bg-[var(--ink)] py-24 px-4 sm:px-8 text-center" aria-labelledby="final-cta-heading">
      <h2
        id="final-cta-heading"
        className="text-[clamp(32px,4vw,52px)] font-black leading-[1.05] text-white mb-4"
        style={{ letterSpacing: "-2px" }}
      >
        Stop losing leads after hours.
      </h2>
      <p className="text-base text-white/45 mb-9">
        Request access today — limited beta spots for Texas brokerages.
      </p>
      <Link
        href="#form"
        className="inline-flex items-center rounded-[10px] bg-white px-7 py-3.5 text-sm font-bold text-[var(--ink)] no-underline tracking-[-0.1px] transition-opacity duration-[0.14s] hover:opacity-90"
      >
        Request beta access
      </Link>
    </section>
  );
}
