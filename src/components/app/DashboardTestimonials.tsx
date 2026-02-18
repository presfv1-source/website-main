"use client";

import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    initials: "SM",
    name: "Sarah M.",
    location: "Houston",
    quote:
      "We cut our first-response time in half. Leads used to sit for hours—now we reply in minutes.",
  },
  {
    initials: "MT",
    name: "Mike T.",
    location: "Dallas",
    quote:
      "One inbox for all our lead conversations. No more digging through texts and emails.",
  },
  {
    initials: "JL",
    name: "Jennifer L.",
    location: "Austin",
    quote:
      "Finally we can see who's following up. The dashboard gives me visibility I never had.",
  },
] as const;

export function DashboardTestimonials({ className }: { className?: string }) {
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      aria-label="Testimonials"
    >
      {TESTIMONIALS.map((t) => (
        <article
          key={t.initials}
          className={cn(
            "rounded-xl border border-border bg-card p-5 text-center shadow-sm",
            "transition-[transform,box-shadow] duration-200 ease-out",
            "hover:-translate-y-0.5 hover:shadow-md"
          )}
        >
          <div
            className="mx-auto mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white"
            aria-hidden
          >
            {t.initials}
          </div>
          <p className="font-semibold text-foreground">{t.name}</p>
          <p className="text-sm text-muted-foreground">{t.location}</p>
          <p className="mt-3 text-sm italic text-foreground/90">
            &ldquo;{t.quote}&rdquo;
          </p>
        </article>
      ))}
    </div>
  );
}
