"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "leadhandler-earlybird-dismissed";

interface EarlyBirdBannerProps {
  className?: string;
}

export function EarlyBirdBanner({ className }: EarlyBirdBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      setDismissed(true);
    } catch {
      setDismissed(true);
    }
  }

  if (dismissed) return null;

  return (
    <div
      role="banner"
      className={cn(
        "relative flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-600/30 bg-blue-600 px-4 py-3 pr-12 text-sm text-white shadow-sm",
        className
      )}
    >
      <p className="font-bold">
        Limited Beta: Lock $99/mo Essentials or $249/mo Pro—spots filling!
        <span className="font-normal opacity-95"> Includes 14-day trial, no card.</span>{" "}
        <Link
          href="/signup"
          className="inline-flex items-center font-semibold underline underline-offset-2 hover:no-underline"
        >
          Claim Beta Spot →
        </Link>
      </p>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white hover:bg-white/20 hover:text-white"
        onClick={handleDismiss}
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
