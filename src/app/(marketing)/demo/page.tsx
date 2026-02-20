"use client";

import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { DashboardMockup } from "@/components/marketing/DashboardMockup";
import { Button } from "@/components/ui/button";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <section className={cn(CONTAINER, PAGE_PADDING, "pt-10 pb-6")}>
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="font-display font-extrabold text-[#0A0A0A] tracking-tight text-[clamp(2rem,4vw,3rem)] mb-3">
              See LeadHandler in action
            </h1>
            <p className="font-sans text-gray-500 text-lg">
              Instant SMS follow-up, lead qualification, and routing — all in one place.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-10">
            <DashboardMockup />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="min-h-[48px] rounded-xl bg-[#2563EB] hover:opacity-90">
              <Link href="/signup">Request beta access</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-[48px] rounded-xl">
              <Link href="/contact">Book a demo</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
