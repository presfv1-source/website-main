"use client";

import Link from "next/link";
import { AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BillingStatusBannerProps {
  subscriptionStatus: string | undefined;
  className?: string;
}

export function BillingStatusBanner({
  subscriptionStatus,
  className,
}: BillingStatusBannerProps) {
  if (!subscriptionStatus) return null;

  if (subscriptionStatus === "past_due") {
    return (
      <div
        className={cn(
          "bg-orange-50 border-b border-orange-200 text-orange-800 text-xs text-center py-2 font-medium shrink-0 font-sans px-4 flex items-center justify-center gap-2",
          className
        )}
        role="alert"
      >
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
        <span>
          Payment past due — outbound messaging is paused.{" "}
          <Link
            href="/app/billing"
            className="font-semibold underline hover:no-underline"
            aria-label="Update billing to restore outbound messaging"
          >
            Update billing
          </Link>
        </span>
      </div>
    );
  }

  if (
    subscriptionStatus === "canceled" ||
    subscriptionStatus === "inactive"
  ) {
    return (
      <div
        className={cn(
          "bg-red-50 border-b border-red-200 text-red-800 text-xs text-center py-2 font-medium shrink-0 font-sans px-4 flex items-center justify-center gap-2",
          className
        )}
        role="alert"
      >
        <XCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
        <span>
          Subscription inactive — your account is read-only.{" "}
          <Link
            href="/app/billing"
            className="font-semibold underline hover:no-underline"
            aria-label="Reactivate subscription to restore full access"
          >
            Reactivate
          </Link>
        </span>
      </div>
    );
  }

  return null;
}
