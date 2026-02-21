// FIXED: Shows children immediately while checking (no blank screen).
// Only redirects if onboarding is genuinely incomplete.

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface OnboardingGuardProps {
  isOwner: boolean;
  children: React.ReactNode;
}

/** Redirects owners who have not completed onboarding to /app/onboarding (except when already there). */
export function OnboardingGuard({ isOwner, children }: OnboardingGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isOwner || pathname === "/app/onboarding") {
      return;
    }
    fetch("/api/onboarding", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data && !data.data.done) {
          router.replace("/app/onboarding");
        }
      })
      .catch(() => {});
  }, [isOwner, pathname, router]);

  // Always render children immediately — no blank screen.
  // If onboarding is needed, the redirect will kick in from the effect.
  return <>{children}</>;
}
