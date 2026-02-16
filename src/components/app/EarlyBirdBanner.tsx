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
        "relative flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 pr-12 text-sm",
        className
      )}
    >
      <span>
        <strong>Beta:</strong> Lock in $99/mo—limited spots.{" "}
        <Link
          href="/pricing"
          className="font-medium text-primary underline underline-offset-2 hover:no-underline"
        >
          View pricing
        </Link>
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
        onClick={handleDismiss}
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
