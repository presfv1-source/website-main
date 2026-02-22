"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { DemoModeBanner } from "./DemoModeBanner";
import { A2PBanner } from "./A2PBanner";
import { BillingStatusBanner } from "./BillingStatusBanner";
import { OnboardingGuard } from "./OnboardingGuard";
import type { Role } from "@/lib/types";

interface AppShellProps {
  children: React.ReactNode;
  session: {
    userId: string;
    role: Role;
    effectiveRole: Role;
    name?: string;
    isDemo: boolean;
    platformRole?: "super_admin" | null;
    subscriptionStatus?: string;
  } | null;
  demoEnabled: boolean;
  hasBackendConnected?: boolean;
  isA2PReady?: boolean;
}

export function AppShell({ children, session, demoEnabled, hasBackendConnected = false, isA2PReady = true }: AppShellProps) {
  const isSuperAdminUser = session?.platformRole === "super_admin";
  const isOwner = session?.role === "owner";
  const isBrokerLevel = isOwner || session?.role === "broker";
  const effectiveRole = session?.effectiveRole ?? session?.role ?? "agent";

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar role={effectiveRole} isSuperAdmin={isSuperAdminUser} />
      <div className="flex flex-1 flex-col min-w-0 md:ml-[220px]">
        <Topbar
          session={session ? { name: session.name, role: session.role, effectiveRole } : null}
          demoEnabled={demoEnabled}
          isOwner={isOwner}
          isSuperAdmin={isSuperAdminUser}
        />
        {/* Super-admin only: demo mode banner */}
        {isSuperAdminUser && (
          <DemoModeBanner demoEnabled={demoEnabled} />
        )}
        {/* Broker owners: billing status banner */}
        {isBrokerLevel && (
          <BillingStatusBanner subscriptionStatus={session?.subscriptionStatus} />
        )}
        {/* Broker owners: A2P pending banner (only when not in demo and A2P not ready) */}
        {isBrokerLevel && !demoEnabled && !isA2PReady && (
          <A2PBanner />
        )}
        <main className="flex-1 p-6 lg:p-8 min-w-0 overflow-auto">
          <OnboardingGuard isOwner={isOwner}>{children}</OnboardingGuard>
        </main>
      </div>
    </div>
  );
}
