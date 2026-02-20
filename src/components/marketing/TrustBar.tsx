"use client";

import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function TrustBar() {
  return (
    <section className="py-8 md:py-10 bg-gray-50 border-y border-gray-100">
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <p className="text-center text-sm font-sans text-gray-600">
          Built for Texas brokerages · Beta access · Limited spots · Setup in minutes
        </p>
      </div>
    </section>
  );
}
