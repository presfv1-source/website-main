"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
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
    <footer className="bg-gray-950 border-t border-white/10 py-12 md:py-16">
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 font-display font-bold text-xl text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              <Zap className="h-5 w-5 text-blue-500" aria-hidden />
              LeadHandler.ai
            </Link>
            <p className="mt-3 text-sm text-slate-400 max-w-xs font-sans leading-relaxed">
              SMS lead response and routing for real estate brokerages.
            </p>
          </div>
          <div>
            <p className="text-sm font-sans font-semibold text-white mb-3">Product</p>
            <ul className="flex flex-col gap-2">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-sans text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-sans font-semibold text-white mb-3">Company</p>
            <ul className="flex flex-col gap-2">
              {companyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-sans text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-sans font-semibold text-white mb-3">Legal</p>
            <ul className="flex flex-col gap-2">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-sans text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
          <p className="text-center sm:text-left">
            © 2026 LeadHandler.ai · Houston, TX
          </p>
          <p className="text-center sm:text-right">
            Built for real estate brokerages.
          </p>
        </div>
      </div>
    </footer>
  );
}
