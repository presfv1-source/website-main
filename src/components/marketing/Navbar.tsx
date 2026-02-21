"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
] as const;

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-[100] border-b border-[var(--border)] bg-white/95 backdrop-blur-[18px]"
      aria-label="Main"
    >
      <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between px-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.35px] text-[var(--ink)] no-underline"
        >
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--ink)]"
            aria-hidden
          >
            <svg
              viewBox="0 0 14 14"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M2 7h9M7.5 3L11 7l-3.5 4" />
            </svg>
          </div>
          LeadHandler.ai
        </Link>

        <ul className="hidden md:flex list-none gap-1.5">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-[var(--muted)] no-underline transition-all duration-[0.14s] hover:bg-[var(--off)] hover:text-[var(--ink)]"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-[var(--muted)] no-underline transition-all duration-[0.14s] hover:bg-[var(--off)] hover:text-[var(--ink)] sm:inline-block"
          >
            Log in
          </Link>
          <Link
            href="#form"
            className="inline-flex items-center rounded-lg bg-[var(--ink)] px-4 py-2 text-[13.5px] font-semibold text-white no-underline tracking-[-0.1px] transition-opacity duration-[0.14s] hover:opacity-80"
          >
            Request access
          </Link>
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 max-w-[calc(100vw-2rem)] pt-12">
              <nav className="flex flex-col gap-1" aria-label="Main">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-[var(--muted)] hover:bg-[var(--off)] hover:text-[var(--ink)]"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-3 text-sm font-medium text-[var(--muted)] hover:bg-[var(--off)]"
                >
                  Log in
                </Link>
                <Link
                  href="#form"
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white no-underline"
                >
                  Request access
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
