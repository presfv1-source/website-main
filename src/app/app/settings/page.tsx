import { redirect } from "next/navigation";
import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getSession, getDemoEnabled } from "@/lib/auth";
import { getDemoBrokerage } from "@/lib/demo/data";
import { getDemoAgentsAsAppType } from "@/lib/demoData";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agent, Brokerage } from "@/lib/types";
import { SettingsPageContent } from "./SettingsPageContent";
import { env } from "@/lib/env.mjs";

function brokerageFromClerk(meta: Record<string, unknown> | null): Brokerage {
  const name = typeof meta?.brokerageName === "string" ? meta.brokerageName.trim() : "";
  const phone = typeof meta?.brokeragePhone === "string" ? meta.brokeragePhone.trim() : undefined;
  const timezone = typeof meta?.timezone === "string" ? meta.timezone.trim() : "America/Chicago";
  return {
    id: "clerk",
    name: name || "My Brokerage",
    timezone,
    phone,
  };
}

async function SettingsContent() {
  const session = await getSession();
  if (session?.role === "agent") redirect("/app/leads");
  const demoEnabled = await getDemoEnabled(session);

  let brokerage: Brokerage;
  if (demoEnabled) {
    brokerage = getDemoBrokerage();
  } else {
    const user = await currentUser();
    const meta = (user?.publicMetadata ?? {}) as Record<string, unknown>;
    brokerage = brokerageFromClerk(meta);
  }

  let agents: Agent[] = [];
  if (demoEnabled) {
    agents = getDemoAgentsAsAppType();
  } else {
    try {
      const airtable = await import("@/lib/airtable");
      agents = await airtable.getAgents();
    } catch {
      agents = [];
    }
  }

  const twilioConfigured =
    !!(env.server.TWILIO_ACCOUNT_SID && env.server.TWILIO_AUTH_TOKEN && env.server.TWILIO_FROM_NUMBER);
  const airtableConfigured = !!(env.server.AIRTABLE_API_KEY && env.server.AIRTABLE_BASE_ID);
  const makeConfigured = !!env.server.MAKE_WEBHOOK_URL?.trim();
  const stripeConfigured = !!env.server.STRIPE_SECRET_KEY?.trim();

  return (
    <SettingsPageContent
      session={session ? { name: session.name, email: session.email, role: session.role, platformRole: session.platformRole } : null}
      brokerage={brokerage}
      agents={agents}
      demoEnabled={!!demoEnabled}
      devToolsPhone={process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER || "+1-XXX-XXX-XXXX"}
      integrationStatus={{
        twilio: twilioConfigured,
        airtable: airtableConfigured,
        make: makeConfigured,
        stripe: stripeConfigured,
      }}
    />
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
