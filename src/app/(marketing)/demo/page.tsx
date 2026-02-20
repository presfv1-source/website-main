"use client";

import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <section className="py-12 md:py-16 bg-gray-950">
          <div className={cn(CONTAINER, PAGE_PADDING)}>
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              See LeadHandler in action
            </h1>
          </div>
        </section>
        <section className={cn(CONTAINER, PAGE_PADDING, "py-16 md:py-24 bg-white")}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-sans text-gray-600 text-lg mb-8">
              Request beta access and we&apos;ll walk you through a live demo personally.
            </p>
            <Button asChild size="lg" className="min-h-[48px] rounded-full px-8 py-3.5 font-semibold bg-blue-600 hover:bg-blue-500">
              <Link href="/signup">Request beta access</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
