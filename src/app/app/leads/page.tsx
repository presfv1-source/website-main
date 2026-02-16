import { Suspense } from "react";
import { getSession, getDemoEnabled } from "@/lib/auth";
import { getDemoLeads } from "@/lib/demo/data";
import { PageHeader } from "@/components/app/PageHeader";
import { LeadsDataList } from "@/components/app/LeadsDataList";
import { EmptyState } from "@/components/app/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import type { Lead } from "@/lib/types";

async function LeadsContent() {
  const [session, demoEnabled] = await Promise.all([getSession(), getDemoEnabled()]);
  const leads: Lead[] = demoEnabled
    ? getDemoLeads()
    : await import("@/lib/airtable").then((m) => m.getLeads());

  if (!demoEnabled && leads.length === 0) {
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
          description="Leads appear here when you connect your lead sources. Turn on Demo Mode to try with example data, or connect your sources in Settings."
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
