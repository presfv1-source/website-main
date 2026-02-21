"use client";

import Link from "next/link";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { INTEGRATIONS } from "@/content/marketing-home";
import { Button } from "@/components/ui/button";

export function IntegrationsSection() {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-muted/30 border-y border-border"
      aria-labelledby="integrations-heading"
    >
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <div className="text-center mb-12">
          <h2
            id="integrations-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground max-w-2xl mx-auto"
          >
            Integrates with your favorite tools
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mt-4 max-w-xl mx-auto">
            Connect lead sources and CRMs. One number, one inbox.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-10">
          {INTEGRATIONS.map(({ name, slug }) => (
            <div
              key={slug}
              className="flex items-center justify-center min-w-[120px] h-12 rounded-xl border bg-background px-6 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:text-foreground"
            >
              {name}
            </div>
          ))}
        </div>
        <p className="text-center">
          <Button variant="outline" size="lg" asChild className="rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring">
            <Link href="/#features">See how it works</Link>
          </Button>
        </p>
      </div>
    </section>
  );
}
