import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Optional: add public/dashboard-screenshot.png and set USE_DASHBOARD_IMAGE = true for real screenshot */
const USE_DASHBOARD_IMAGE = false;
const DASHBOARD_IMAGE_PATH = "/dashboard-screenshot.png";

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 overflow-hidden">
      {/* Subtle real estate gradient + optional image background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--primary)/8%,transparent)]" aria-hidden />

      <div className="relative container max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
            Turn new leads into conversations faster
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            AI-assisted SMS lead response and routing for real estate teams.
            Respond first, qualify with confidence, route to the right agent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/login">Try demo</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>

        {/* Dashboard screenshot overlay / placeholder */}
        <div className="relative mx-auto max-w-4xl">
          <div className="rounded-xl border border-border/80 bg-card/95 shadow-2xl shadow-primary/10 overflow-hidden ring-1 ring-black/5">
            {USE_DASHBOARD_IMAGE ? (
              <Image
                src={DASHBOARD_IMAGE_PATH}
                alt="LeadHandler dashboard preview"
                width={960}
                height={600}
                className="w-full h-auto object-contain"
                priority
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 960 600'%3E%3Crect fill='%23f1f5f9' width='960' height='600'/%3E%3C/svg%3E"
              />
            ) : (
              <div
                className="relative aspect-[16/10] w-full bg-muted/50 flex items-center justify-center p-8"
                aria-hidden
              >
                <div className="w-full max-w-2xl mx-auto space-y-4">
                  <div className="h-3 w-48 rounded bg-muted-foreground/20" />
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-20 rounded-lg bg-muted-foreground/10 border border-border/50"
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 rounded-lg bg-muted-foreground/10 border border-border/50" />
                    <div className="h-32 rounded-lg bg-muted-foreground/10 border border-border/50" />
                  </div>
                </div>
                <span className="absolute text-sm text-muted-foreground/60">
                  Dashboard preview
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
