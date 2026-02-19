import { Suspense } from "react";
import { getSession, getDemoEnabled } from "@/lib/auth";
import { getDemoAgentsAsAppType } from "@/lib/demoData";
import { AirtableAuthError } from "@/lib/airtable";
import { AgentsTable } from "@/components/app/AgentsTable";
import { Skeleton } from "@/components/ui/skeleton";

async function AgentsContent() {
  const session = await getSession();
  const demoEnabled = await getDemoEnabled(session);
  let agents = Array.from<import("@/lib/types").Agent>([]);
  let airtableError = false;

  if (demoEnabled) {
    agents = getDemoAgentsAsAppType();
  } else {
    try {
      const airtable = await import("@/lib/airtable");
      agents = await airtable.getAgents();
    } catch (err) {
      if (err instanceof AirtableAuthError) {
        airtableError = true;
      }
      // was: else { throw err; } — fallback to empty so UI shows empty state instead of throwing
      agents = [];
    }
  }

  const showEmptyState = !demoEnabled && agents.length === 0 && !airtableError;

  return (
    <AgentsTable
      agents={agents}
      airtableError={airtableError}
      showEmptyState={showEmptyState}
    />
  );
}

export default function AgentsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <AgentsContent />
    </Suspense>
  );
}
