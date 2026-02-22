"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface A2PBannerProps {
  className?: string;
}

/**
 * Shown to broker owners when A2P campaign is not yet approved.
 * Calm, informative wording — not scary.
 */
export function A2PBanner({ className }: A2PBannerProps) {
  return (
    <div
      className={cn(
        "bg-amber-50 border-b border-amber-200 text-amber-800 text-xs text-center py-2 font-medium shrink-0 font-sans px-4 flex items-center justify-center gap-2",
        className
      )}
      role="status"
      aria-label="Sending paused notice"
    >
      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
      <span>
        SMS campaign pending carrier approval — outbound messages are queued and will send
        automatically once approved.
      </span>
    </div>
  );
}
