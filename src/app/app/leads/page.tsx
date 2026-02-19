import { Suspense } from "react";
import { getSession, getDemoEnabled } from "@/lib/auth";
import { getDemoLeadsAsAppType } from "@/lib/demoData";
import { AirtableAuthError } from "@/lib/airtable";
import { PageHeader } from "@/components/app/PageHeader";
import { LeadsDataList } from "@/components/app/LeadsDataList";
import { EmptyState } from "@/components/app/EmptyState";
import { AirtableErrorFallback } from "@/components/app/AirtableErrorFallback";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import type { Lead } from "@/lib/types";

async function LeadsContent() {
  const session = await getSession();
  const demoEnabled = await getDemoEnabled(session);
  let leads: Lead[] = [];
  let airtableError = false;

  if (demoEnabled) {
    leads = getDemoLeadsAsAppType();
  } else {
    try {
      const airtable = await import("@/lib/airtable");
      const agentId = session?.role === "agent" ? session?.agentId : undefined;
      leads = await airtable.getLeads(agentId);
    } catch (err) {
      if (err instanceof AirtableAuthError) {
        airtableError = true;
      }
      // was: else { throw err; } — fallback to empty so UI shows empty state instead of throwing
      leads = [];
    }
  }

  if (!demoEnabled && leads.length === 0 && !airtableError) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          title="Leads"
          subtitle="Manage your leads"
          breadcrumbs={[
            { label: "Home", href: "/app/dashboard" },
            { label: "Leads" },
          ]}
        />
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Turn on Demo Mode or connect sources in Settings to see leads here."
          action={{ label: "Go to Settings", href: "/app/settings" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} total leads`}
        breadcrumbs={[
          { label: "Home", href: "/app/dashboard" },
          { label: "Leads" },
        ]}
      />
      {airtableError && <AirtableErrorFallback className="mb-4" />}
      <LeadsDataList leads={leads} />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <LeadsContent />
    </Suspense>
  );
}
