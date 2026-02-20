"use client";

import Link from "next/link";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

const productLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo", label: "Demo" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/security", label: "Security" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12 md:py-16">
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="font-display font-bold text-xl text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              LeadHandler<span className="text-blue-600">.ai</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 max-w-xs font-sans leading-relaxed">
              SMS lead response and routing for real estate brokerages.
            </p>
            <p className="mt-2 text-sm text-gray-500 font-sans">Houston, TX</p>
          </div>
          <div>
            <p className="text-sm font-sans font-bold text-[#0A0A0A] mb-3">Product</p>
            <ul className="flex flex-col gap-2">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-sans text-gray-500 hover:text-[#0A0A0A] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-sans font-bold text-[#0A0A0A] mb-3">Company</p>
            <ul className="flex flex-col gap-2">
              {companyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-sans text-gray-500 hover:text-[#0A0A0A] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-sans font-bold text-[#0A0A0A] mb-3">Legal</p>
            <ul className="flex flex-col gap-2">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-sans text-gray-500 hover:text-[#0A0A0A] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm font-sans text-gray-500 text-center sm:text-left">
            © 2026 LeadHandler.ai · Houston, TX
          </p>
          <p className="text-sm font-sans text-gray-500 text-center sm:text-right">
            Built for real estate brokerages.
          </p>
        </div>
      </div>
    </footer>
  );
}
