import dynamic from "next/dynamic";
import { Suspense } from "react";
import { getSession, getDemoEnabled } from "@/lib/auth";
import {
  getDemoDashboardStats,
  getDemoLeadsAsAppType,
  getDemoMessagesAsAppType,
  getDemoAgentsAsAppType,
  getDemoActivity,
  getDemoLeadsByDay,
} from "@/lib/demoData";
import { computeDashboardStatsFromLeads } from "@/lib/demo/data";
import { AirtableAuthError } from "@/lib/airtable";
import { PageHeader } from "@/components/app/PageHeader";
import { AirtableErrorFallback } from "@/components/app/AirtableErrorFallback";
import { StatCard } from "@/components/app/StatCard";
import { SectionCard } from "@/components/app/SectionCard";
import { LeadStatusPill } from "@/components/app/LeadStatusPill";
import { DashboardAgentLeaderboard } from "@/components/app/DashboardAgentLeaderboard";
import { DashboardTestimonials } from "@/components/app/DashboardTestimonials";
import { EmptyState } from "@/components/app/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentActivity } from "@/components/app/RecentActivity";
import { DevRoleSwitcher } from "@/components/app/DevRoleSwitcher";
import { DashboardTestSmsCard } from "@/components/app/DashboardTestSmsCard";

const LeadActivityChart = dynamic(
  () => import("@/components/app/LeadActivityChart").then((m) => m.LeadActivityChart),
  { loading: () => <Skeleton className="h-64 w-full rounded-xl" />, ssr: true }
);
import type { ActivityItem, Agent, Lead, DashboardStats } from "@/lib/types";
import { BarChart3, UserPlus, MessageSquare, Route } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const DEFAULT_STATS: DashboardStats = {
  leadsToday: 0,
  qualifiedRate: 0,
  avgResponseTime: "—",
  appointments: 0,
  closedThisMonth: 0,
  activeLeads: 0,
};

async function DashboardContent() {
  const session = await getSession();
  const demoEnabled = await getDemoEnabled(session);
  const role = session?.role ?? "broker";
  const agentId = role === "agent" ? session?.agentId : undefined;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER || "+1-XXX-XXX-XXXX";

  let stats: DashboardStats = DEFAULT_STATS;
  let leads: Lead[] = [];
  let messages: { id: string; direction: "in" | "out"; body: string; createdAt: string }[] = [];
  let agents: Agent[] = [];
  let activity: ActivityItem[] = [];
  let leadsByDay: { date: string; label: string; leads: number }[] = [];
  let airtableError = false;

  if (demoEnabled) {
    const demoLeads = getDemoLeadsAsAppType();
    const demoAgents = getDemoAgentsAsAppType();
    stats = getDemoDashboardStats();
    leads = demoLeads;
    messages = getDemoMessagesAsAppType().slice(0, 5).map((m) => ({
      id: m.id,
      direction: m.direction,
      body: m.body,
      createdAt: m.createdAt,
    }));
    agents = demoAgents;
    activity = getDemoActivity(20);
    leadsByDay = getDemoLeadsByDay();
  } else {
    try {
      const airtable = await import("@/lib/airtable");
      const [realLeads, realAgents, realMessages, realActivity] = await Promise.all([
        airtable.getLeads(agentId),
        airtable.getAgents(),
        airtable.getMessages(),
        airtable.getRecentActivities(20, agentId),
      ]);
      stats = computeDashboardStatsFromLeads(realLeads ?? [], role, agentId);
      leads = realLeads ?? [];
      messages = (realMessages ?? []).slice(0, 5).map((m) => ({
        id: m.id,
        direction: m.direction,
        body: m.body,
        createdAt: m.createdAt,
      }));
      agents = realAgents ?? [];
      activity = realActivity ?? [];
    } catch (err) {
      if (err instanceof AirtableAuthError) {
        airtableError = true;
      }
      stats = computeDashboardStatsFromLeads([], role, agentId);
      leads = [];
      messages = [];
      agents = [];
      activity = [];
    }
  }

  stats = stats ?? DEFAULT_STATS;
  leads = Array.isArray(leads) ? leads : [];
  messages = Array.isArray(messages) ? messages : [];
  agents = Array.isArray(agents) ? agents : [];
  activity = Array.isArray(activity) ? activity : [];
  leadsByDay = Array.isArray(leadsByDay) ? leadsByDay : [];

  // Guarantee stats is a valid DashboardStats (all fields defined, no NaN)
  const safeStats: DashboardStats = {
    leadsToday: Number(stats.leadsToday) || 0,
    qualifiedRate: Number(stats.qualifiedRate) || 0,
    avgResponseTime: typeof stats.avgResponseTime === "string" ? stats.avgResponseTime : "—",
    appointments: Number(stats.appointments) || 0,
    closedThisMonth: Number(stats.closedThisMonth) || 0,
    activeLeads: Number(stats.activeLeads) || 0,
  };
  stats = safeStats;

  // Normalize messages: only valid objects, stable keys and required fields
  const rawMessages = messages.filter((m) => m != null && typeof m === "object");
  messages = rawMessages.map((m, i) => ({
    id: typeof (m as { id?: unknown }).id === "string" ? (m as { id: string }).id : `msg-${i}`,
    direction: (m as { direction?: string }).direction === "in" ? "in" : "out",
    body: typeof (m as { body?: unknown }).body === "string" ? (m as { body: string }).body : "",
    createdAt:
      typeof (m as { createdAt?: unknown }).createdAt === "string"
        ? (m as { createdAt: string }).createdAt
        : new Date().toISOString(),
  }));

  // Normalize activity: stable keys, valid ActivityType, required fields for ActivityFeed
  const VALID_ACTIVITY_TYPES: ActivityItem["type"][] = [
    "lead_created",
    "message_sent",
    "message_received",
    "status_changed",
    "lead_assigned",
  ];
  const rawActivity = activity.filter((a) => a != null && typeof a === "object");
  activity = rawActivity.map((a, i) => {
    const type = VALID_ACTIVITY_TYPES.includes((a as ActivityItem).type) ? (a as ActivityItem).type : "lead_created";
    return {
      id: typeof (a as { id?: unknown }).id === "string" ? (a as { id: string }).id : `activity-${i}`,
      type,
      title: typeof (a as { title?: unknown }).title === "string" ? (a as { title: string }).title : "",
      description: (a as ActivityItem).description,
      leadId: (a as ActivityItem).leadId,
      leadName: (a as ActivityItem).leadName,
      agentName: (a as ActivityItem).agentName,
      createdAt:
        typeof (a as { createdAt?: unknown }).createdAt === "string"
          ? (a as { createdAt: string }).createdAt
          : new Date().toISOString(),
    } satisfies ActivityItem;
  });

  // Normalize leadsByDay: ensure { date, label, leads } for LeadActivityChart
  leadsByDay = leadsByDay.map((d, i) => ({
    date: typeof d?.date === "string" ? d.date : new Date().toISOString().slice(0, 10),
    label: typeof d?.label === "string" ? d.label : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i % 7] ?? "—",
    leads: Number(d?.leads) || 0,
  }));

  const agentFilterId = demoEnabled ? "agent-1" : (role === "agent" ? session?.agentId : undefined);
  const myLeads = agentFilterId ? leads.filter((l) => l.assignedTo === agentFilterId) : [];

  if (!demoEnabled && leads.length === 0 && !airtableError) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          title="Dashboard"
          subtitle={`Welcome back, ${session?.name ?? "User"}`}
          breadcrumbs={[
            { label: "Home", href: "/app/dashboard" },
            { label: "Dashboard" },
          ]}
        />
        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Turn on Demo Mode or connect sources in Settings to see your dashboard."
          action={{ label: "Go to Settings", href: "/app/settings" }}
        />
      </div>
    );
  }

  const isEffectiveOwner = session?.effectiveRole === "owner";
  const roleLabel = (session?.role ?? "broker").toUpperCase();

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${session?.name ?? "User"}`}
        breadcrumbs={[
          { label: "Home", href: "/app/dashboard" },
          { label: "Dashboard" },
        ]}
      />
      <p className="text-xs text-muted-foreground" data-testid="dashboard-role-label">
        Viewing as: {roleLabel}
      </p>
      {isEffectiveOwner && airtableError && <AirtableErrorFallback className="mb-4" />}

      {process.env.NODE_ENV === "development" && <DevRoleSwitcher />}

      {demoEnabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
            <p className="text-2xl font-bold text-foreground mt-1">12s</p>
          </div>
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Leads Qualified</p>
            <p className="text-2xl font-bold text-foreground mt-1">47</p>
          </div>
        </div>
      )}

      <DashboardTestSmsCard phoneNumber={twilioNumber} />

      <div className="flex flex-wrap items-center gap-4">
        <Button asChild variant="outline" size="sm" className="min-h-[44px]">
          <Link href="/app/leads" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add lead
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="min-h-[44px]">
          <Link href="/app/messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            View inbox
          </Link>
        </Button>
        {isEffectiveOwner && (
          <Button asChild variant="outline" size="sm" className="min-h-[44px]">
            <Link href="/app/routing" className="flex items-center gap-2">
              <Route className="h-4 w-4" />
              Routing
            </Link>
          </Button>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { title: "Leads today", value: stats.leadsToday, iconName: "leads" as const },
          { title: "Qualified rate", value: `${stats.qualifiedRate}%`, iconName: "qualified" as const },
          { title: "Avg response", value: stats.avgResponseTime, iconName: "response" as const },
          { title: "Appointments", value: stats.appointments, iconName: "appointments" as const },
          { title: "Closed (month)", value: stats.closedThisMonth, iconName: "closed" as const },
          { title: "Active leads", value: stats.activeLeads, iconName: "active" as const },
        ].map((stat, i) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            iconName={stat.iconName}
            staggerDelay={i * 0.04}
          />
        ))}
      </div>

      {isEffectiveOwner && (
        <SectionCard title="Lead activity">
          <LeadActivityChart data={leadsByDay} />
        </SectionCard>
      )}

      {isEffectiveOwner && (
        <SectionCard title="Recent activity">
          <RecentActivity
            items={activity}
            emptyMessage={
              !demoEnabled && leads.length === 0
                ? "Connect your lead sources in Settings to see activity."
                : demoEnabled
                  ? "No activity yet – text the test number to start!"
                  : "No recent activity—add a lead!"
            }
          />
        </SectionCard>
      )}

      {/* was: title="Trusted by Texas Broker-Owners" */}
      <SectionCard title="Trusted by Broker-Owners">
        <DashboardTestimonials />
      </SectionCard>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <SectionCard title="Recent messages">
          {messages.length ? (
            <ul className="divide-y divide-border rounded-md" role="list">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className="min-h-[44px] flex items-center gap-2 py-3 text-sm"
                >
                  <span
                    className={
                      m.direction === "in"
                        ? "text-muted-foreground shrink-0"
                        : "text-foreground font-medium shrink-0"
                    }
                  >
                    {m.direction === "in" ? "In" : "Out"}:
                  </span>
                  <span className="min-w-0 truncate text-muted-foreground">
                    {m.body.slice(0, 60)}
                    {m.body.length > 60 ? "…" : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No recent messages</p>
          )}
        </SectionCard>

        {isEffectiveOwner ? (
          <SectionCard title="Agent leaderboard">
            <DashboardAgentLeaderboard agents={agents} />
          </SectionCard>
        ) : (
          <SectionCard title="My recent leads">
            {myLeads.length ? (
              <ul className="divide-y divide-border rounded-md" role="list">
                {myLeads.slice(0, 5).map((l) => (
                  <li
                    key={l.id}
                    className="min-h-[44px] flex items-center gap-2 py-3"
                  >
                    <Link
                      href={`/app/leads/${l.id}`}
                      className="flex-1 min-w-0 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded py-1"
                    >
                      <span className="truncate block">{l.name}</span>
                    </Link>
                    <LeadStatusPill status={l.status} className="text-xs shrink-0" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No assigned leads</p>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={`skeleton-stat-${i}`} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
