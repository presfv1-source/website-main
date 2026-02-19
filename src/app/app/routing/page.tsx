import { getSession, getDemoEnabled } from "@/lib/auth";
import { getAgents } from "@/lib/airtable";
import { getDemoAgentsAsAppType } from "@/lib/demoData";
import type { Agent } from "@/lib/types";
import { RoutingForm } from "./RoutingForm";
import { AirtableErrorFallback } from "@/components/app/AirtableErrorFallback";

export const dynamic = "force-dynamic";

export default async function RoutingPage() {
  const session = await getSession();
  const demoEnabled = await getDemoEnabled(session);
  let agents: Agent[] = [];
  let airtableError = false;
  if (demoEnabled) {
    agents = getDemoAgentsAsAppType();
  } else {
    try {
      agents = await getAgents();
    } catch {
      agents = [];
      airtableError = true;
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {airtableError && session?.effectiveRole === "owner" && (
        <AirtableErrorFallback className="mb-4" />
      )}
      <div>
        <h1 className="text-2xl font-bold">Routing</h1>
        <p className="text-muted-foreground mt-1">
          Configure how leads are distributed
        </p>
      </div>
      <RoutingForm agents={agents} demoEnabled={!!demoEnabled} />
    </div>
  );
}
