"use client";

import Link from "next/link";

const productLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--white)] pt-14 pb-7">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-1">
            <div className="text-[15px] font-extrabold text-[var(--ink)] tracking-[-0.4px] mb-2">
              LeadHandler.ai
            </div>
            <p className="text-[13px] text-[var(--subtle)] leading-[1.6] max-w-[200px]">
              SMS lead response and routing for Texas real estate brokerages.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[var(--ink)] tracking-[-0.1px] mb-3.5">
              Product
            </div>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] text-[var(--muted)] no-underline transition-colors duration-[0.12s] hover:text-[var(--ink)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[var(--ink)] tracking-[-0.1px] mb-3.5">
              Company
            </div>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {companyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] text-[var(--muted)] no-underline transition-colors duration-[0.12s] hover:text-[var(--ink)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[var(--ink)] tracking-[-0.1px] mb-3.5">
              Legal
            </div>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] text-[var(--muted)] no-underline transition-colors duration-[0.12s] hover:text-[var(--ink)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[12px] text-[var(--subtle)]">
          <span className="text-center sm:text-left">© 2026 LeadHandler.ai · Houston, TX</span>
          <span className="text-center sm:text-right">Built for real estate brokerages.</span>
        </div>
      </div>
    </footer>
  );
}
