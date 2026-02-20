"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/#pricing", label: "Pricing" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-shadow",
        scrolled && "shadow-sm"
      )}
    >
        <div
        className={cn(
          CONTAINER,
          PAGE_PADDING,
          "flex h-[68px] items-center justify-between gap-4"
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-0 text-xl font-display font-bold text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          LeadHandler<span className="text-blue-600">.ai</span>
        </Link>

        <nav
          className="hidden md:flex flex-wrap items-center justify-center gap-8"
          aria-label="Main"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium font-sans bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 min-h-[40px]"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold font-sans bg-[#2563EB] text-white hover:opacity-90 min-h-[40px]"
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
              className="w-72 max-w-[calc(100vw-2rem)] pt-12"
            >
              <nav className="flex flex-col gap-1" aria-label="Main">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg px-4 py-3 min-h-[44px] flex items-center text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
                <Link
                  href="/signup"
                  className="mt-2 inline-flex items-center justify-center min-h-[44px] rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  Request beta access
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
