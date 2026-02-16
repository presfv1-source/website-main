import { Suspense } from "react";
import { getSession, getDemoEnabled } from "@/lib/auth";
import { AppShell } from "@/components/app/AppShell";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const [session, demoEnabled] = await Promise.all([getSession(), getDemoEnabled()]);
  return (
    <AppShell session={session} demoEnabled={demoEnabled}>
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen min-w-0">
          <Skeleton className="hidden md:block w-64 shrink-0 rounded-none" />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Skeleton className="h-14 w-full shrink-0 rounded-none" />
            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              <div className="max-w-6xl mx-auto space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-64 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AppLayoutInner>{children}</AppLayoutInner>
    </Suspense>
  );
}
