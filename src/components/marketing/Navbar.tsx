"use client";

import Link from "next/link";
import { Menu, Zap } from "lucide-react";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div
        className={cn(
          CONTAINER,
          PAGE_PADDING,
          "flex h-[68px] items-center justify-between gap-4"
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 text-xl font-display font-bold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <Zap className="h-5 w-5 text-blue-600" aria-hidden />
          LeadHandler.ai
        </Link>

        <nav
          className="hidden md:flex flex-wrap items-center justify-center gap-8"
          aria-label="Main"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="inline-flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors min-h-[40px]"
          >
            Request beta access
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 max-w-[calc(100vw-2rem)] pt-12 flex flex-col"
            >
              <nav className="flex flex-col gap-1 flex-1" aria-label="Main">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg px-4 py-3 min-h-[44px] flex items-center text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  className="mt-2 rounded-lg px-4 py-3 min-h-[44px] flex items-center text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Log in
                </Link>
              </nav>
              <Link
                href="/signup"
                className="w-full inline-flex items-center justify-center min-h-[44px] rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 mt-4"
              >
                Request beta access
              </Link>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
