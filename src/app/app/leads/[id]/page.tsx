import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSession, getDemoEnabled } from "@/lib/auth";
import {
  getDemoLeads,
  getDemoMessages,
  getDemoInsights,
} from "@/lib/demo/data";
import { Breadcrumbs } from "@/components/app/Breadcrumbs";
import { LeadStatusPill } from "@/components/app/LeadStatusPill";
import { Timeline } from "@/components/app/Timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageComposer } from "./MessageComposer";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, User } from "lucide-react";

async function LeadDetailContent({ id }: { id: string }) {
  const session = await getSession();
  const demoEnabled = await getDemoEnabled(session);
  let leads: Awaited<ReturnType<typeof getDemoLeads>> = [];
  if (demoEnabled) {
    leads = getDemoLeads();
  } else {
    try {
      const airtable = await import("@/lib/airtable");
      leads = await airtable.getLeads();
    } catch {
      leads = [];
    }
  }
  const lead = leads.find((l) => l.id === id);
  if (!lead) notFound();

  let messages: Awaited<ReturnType<typeof getDemoMessages>> = [];
  if (demoEnabled) {
    messages = getDemoMessages(id);
  } else {
    try {
      const airtable = await import("@/lib/airtable");
      messages = await airtable.getMessages(id);
    } catch {
      messages = [];
    }
  }
  const insights = demoEnabled ? getDemoInsights(id) : [];

  const timelineItems = [
    ...messages.map((m) => ({
      id: m.id,
      title: m.direction === "in" ? "Inbound" : "Outbound",
      description: m.body,
      time: new Date(m.createdAt).toLocaleString(),
      type: "message" as const,
    })),
  ];

  const urgency = insights[0]?.urgency ?? 50;

  return (
    <div className="space-y-8">
      <Breadcrumbs
        segments={[
          { label: "Home", href: "/app/dashboard" },
          { label: "Leads", href: "/app/leads" },
          { label: lead.name },
        ]}
        className="mb-2"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <p className="text-muted-foreground mt-1">{lead.email}</p>
          <div className="mt-2">
            <LeadStatusPill status={lead.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{lead.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{lead.source}</span>
              </div>
              {lead.assignedToName && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Assigned to {lead.assignedToName}</span>
                </div>
              )}
              {lead.notes && (
                <p className="text-sm text-muted-foreground pt-2 border-t">{lead.notes}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timelineItems.length ? (
                <Timeline items={timelineItems} />
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              )}
            </CardContent>
          </Card>

          {demoEnabled && (
            <Card>
              <CardHeader>
                <CardTitle>Send message</CardTitle>
              </CardHeader>
              <CardContent>
                <MessageComposer leadId={lead.id} leadPhone={lead.phone} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className="h-16 w-16 rounded-full border-4 flex items-center justify-center text-sm font-bold"
                    style={{
                      borderColor: `hsl(${urgency * 1.2}, 70%, 50%)`,
                      color: `hsl(${urgency * 1.2}, 70%, 50%)`,
                    }}
                  >
                    {urgency}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Urgency</p>
                    <p className="text-xs text-muted-foreground">0–100</p>
                  </div>
                </div>
                {insights[0]?.summary && (
                  <p className="text-sm">{insights[0].summary}</p>
                )}
                {insights[0]?.nextAction && (
                  <p className="text-sm">
                    <span className="font-medium">Next:</span> {insights[0].nextAction}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <LeadDetailContent id={id} />
    </Suspense>
  );
}
