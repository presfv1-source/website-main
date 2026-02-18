"use client";

import Link from "next/link";
import { Building2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/login", label: "Demo" },
  { href: "/login", label: "Login" },
] as const;

export function MarketingHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className={cn(CONTAINER, PAGE_PADDING, "flex h-14 sm:h-16 items-center justify-between gap-4")}>
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold text-primary sm:text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <Building2 className="size-5 sm:size-6" aria-hidden />
          LeadHandler.ai
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex flex-wrap items-center justify-end gap-6" aria-label="Main">
          {navLinks.map(({ href, label }) => (
            <Link
              key={`${href}-${label}`}
              href={href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            >
              {label}
            </Link>
          ))}
          <Button asChild size="sm" className="shrink-0">
            <Link href="/signup">Start free trial</Link>
          </Button>
        </nav>

        {/* Mobile: hamburger + sheet */}
        <div className="flex md:hidden items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 max-w-[calc(100vw-2rem)] pt-12">
              <nav className="flex flex-col gap-1" aria-label="Main">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    className="rounded-lg px-4 py-3 min-h-[44px] flex items-center text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/signup"
                  className="mt-4 inline-flex items-center justify-center min-h-[44px] rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Start free trial
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
