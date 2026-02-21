"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { DemoModeBanner } from "./DemoModeBanner";
import { OnboardingGuard } from "./OnboardingGuard";
import type { Role } from "@/lib/types";

interface AppShellProps {
  children: React.ReactNode;
  session: { userId: string; role: Role; effectiveRole: Role; name?: string; isDemo: boolean } | null;
  demoEnabled: boolean;
  hasBackendConnected?: boolean;
}

export function AppShell({ children, session, demoEnabled, hasBackendConnected = false }: AppShellProps) {
  const isOwner = session?.role === "owner";
  const effectiveRole = session?.effectiveRole ?? session?.role ?? "agent";

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar role={effectiveRole} />
      <div className="flex min-w-0 flex-1 flex-col md:ml-16">
        <Topbar
          session={session ? { name: session.name, role: session.role, effectiveRole } : null}
          demoEnabled={demoEnabled}
          isOwner={isOwner}
        />
        <DemoModeBanner demoEnabled={demoEnabled} isOwner={isOwner} hasBackendConnected={hasBackendConnected} />
        <main className="min-w-0 flex-1 overflow-auto p-5 lg:p-8">
          <div className="rounded-3xl border border-white/40 bg-white/55 p-4 shadow-xl shadow-violet-100/60 backdrop-blur-lg sm:p-6">
            <OnboardingGuard isOwner={isOwner}>{children}</OnboardingGuard>
          </div>
        </main>
      </div>
    </div>
  );
}
