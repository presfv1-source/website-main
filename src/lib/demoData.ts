/**
 * Hardcoded demo mocks for broker dashboard when Demo Mode is on.
 * Used by API routes and server components when demo cookie is set.
 * Houston-focused sample data; no real PII.
 */
import type { Lead, Agent, Message, DashboardStats, ActivityItem } from "@/lib/types";

export const demoLeads: { id: string; name: string; phone: string; source: string; status: Lead["status"]; created: string; lastMessage: string }[] = [
  { id: "1", name: "John Doe", phone: "+17135551234", source: "Zillow", status: "qualified", created: "2026-02-15", lastMessage: "Interested in 3BR Heights" },
  { id: "2", name: "Maria Santos", phone: "+17135551235", source: "Realtor.com", status: "qualified", created: "2026-02-15", lastMessage: "When can we tour?" },
  { id: "3", name: "James Wilson", phone: "+17135551236", source: "Zillow", status: "appointment", created: "2026-02-14", lastMessage: "Wednesday at 2pm works" },
  { id: "4", name: "Lisa Chen", phone: "+17135551237", source: "Website", status: "new", created: "2026-02-16", lastMessage: "Hi, looking for home in Houston" },
  { id: "5", name: "Robert Martinez", phone: "+17135551238", source: "Zillow", status: "qualified", created: "2026-02-13", lastMessage: "Budget around 450k" },
  { id: "6", name: "Amanda Foster", phone: "+17135551239", source: "Realtor.com", status: "closed", created: "2026-02-10", lastMessage: "Thanks for everything!" },
  { id: "7", name: "David Kim", phone: "+17135551240", source: "HAR", status: "contacted", created: "2026-02-14", lastMessage: "Interested in 3BR in Heights" },
  { id: "8", name: "Sarah Nguyen", phone: "+17135551241", source: "Website", status: "appointment", created: "2026-02-15", lastMessage: "Saturday 10am?" },
  { id: "9", name: "Michael Brown", phone: "+17135551242", source: "Referral", status: "qualified", created: "2026-02-12", lastMessage: "What's the HOA situation?" },
  { id: "10", name: "Emily Davis", phone: "+17135551243", source: "Realtor.com", status: "new", created: "2026-02-16", lastMessage: "First-time buyer here" },
  { id: "11", name: "Chris Taylor", phone: "+17135551244", source: "Facebook Leads", status: "contacted", created: "2026-02-15", lastMessage: "Saw your ad for Houston area" },
  { id: "12", name: "Pat Johnson", phone: "+17135551245", source: "Zillow", status: "lost", created: "2026-02-11", lastMessage: "Went with another agent" },
  { id: "13", name: "Jessica Moore", phone: "+17135551246", source: "HAR", status: "new", created: "2026-02-17", lastMessage: "Saw listing on HAR, interested" },
  { id: "14", name: "Daniel Wright", phone: "+17135551247", source: "Open house", status: "contacted", created: "2026-02-16", lastMessage: "Met at Saturday open house" },
];

export const demoConversations: {
  id: string;
  leadName: string;
  leadId: string;
  messages: { from: "lead" | "agent"; text: string; time: string }[];
}[] = [
  {
    id: "c1",
    leadId: "1",
    leadName: "John Doe",
    messages: [
      { from: "lead", text: "Hi, looking for home in Houston", time: "15m ago" },
      { from: "agent", text: "Great! What area and budget?", time: "12m ago" },
      { from: "lead", text: "Heights, 3BR, around 400k", time: "10m ago" },
      { from: "agent", text: "I have a few matches. When can we tour?", time: "2m ago" },
    ],
  },
  {
    id: "c2",
    leadId: "2",
    leadName: "Maria Santos",
    messages: [
      { from: "lead", text: "When can we tour?", time: "1h ago" },
      { from: "agent", text: "Tomorrow after 2pm or Saturday morning.", time: "45m ago" },
      { from: "lead", text: "Saturday works, thanks!", time: "30m ago" },
    ],
  },
  {
    id: "c3",
    leadId: "3",
    leadName: "James Wilson",
    messages: [
      { from: "lead", text: "Interested in the 3BR on W 18th", time: "2h ago" },
      { from: "agent", text: "That one is still available. Wednesday at 2pm?", time: "1h ago" },
      { from: "lead", text: "Wednesday at 2pm works", time: "50m ago" },
    ],
  },
  {
    id: "c4",
    leadId: "4",
    leadName: "Lisa Chen",
    messages: [
      { from: "lead", text: "Hi, looking for home in Houston", time: "5m ago" },
      { from: "agent", text: "Welcome! What areas are you considering?", time: "2m ago" },
    ],
  },
  {
    id: "c5",
    leadId: "5",
    leadName: "Robert Martinez",
    messages: [
      { from: "lead", text: "Budget around 450k", time: "1h ago" },
      { from: "agent", text: "I'll send 3 listings in that range in the Heights.", time: "45m ago" },
    ],
  },
  {
    id: "c6",
    leadId: "7",
    leadName: "David Kim",
    messages: [
      { from: "lead", text: "Interested in 3BR in Heights", time: "2h ago" },
      { from: "agent", text: "Great! I have 2 new listings there. Want a tour this week?", time: "1h ago" },
      { from: "lead", text: "Yes, Thursday afternoon?", time: "45m ago" },
    ],
  },
  {
    id: "c7",
    leadId: "8",
    leadName: "Sarah Nguyen",
    messages: [
      { from: "lead", text: "Saturday 10am?", time: "30m ago" },
      { from: "agent", text: "Saturday 10am works. I'll confirm the address.", time: "15m ago" },
    ],
  },
];

export const demoAnalytics = {
  totalLeads: 14,
  /* was 2.4; beta stub: 3 min for consistency with hero preview */
  avgResponseMin: 3,
  conversionRate: 38,
  responseRate: 95,
};

export const demoAgents: { name: string; email: string; role: string; closeRate: number; phone?: string }[] = [
  { name: "Sarah Chen", email: "sarah@broker.com", role: "Agent", closeRate: 42, phone: "+17135550001" },
  { name: "Mike Torres", email: "mike@broker.com", role: "Agent", closeRate: 38, phone: "+17135550002" },
  { name: "Jennifer Lee", email: "jennifer@broker.com", role: "Agent", closeRate: 45, phone: "+17135550003" },
  { name: "David Park", email: "david@broker.com", role: "Agent", closeRate: 35, phone: "+17135550004" },
  { name: "Amanda Wright", email: "amanda@broker.com", role: "Agent", closeRate: 40, phone: "+17135550005" },
];

// ---- Mappers to app types for API routes ----
export function getDemoLeadsAsAppType(): Lead[] {
  const agents = getDemoAgentsAsAppType();
  return demoLeads.map((l, i) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: `${l.name.toLowerCase().replace(/\s/g, ".")}@example.com`,
    status: l.status,
    source: l.source,
    assignedTo: agents[i % agents.length]?.id,
    assignedToName: agents[i % agents.length]?.name,
    createdAt: l.created + "T12:00:00.000Z",
    updatedAt: l.created + "T12:00:00.000Z",
  }));
}

function derivedWeight(closeRate: number): number {
  const w = Math.round(closeRate / 10);
  return Math.min(10, Math.max(1, w));
}

export function getDemoAgentsAsAppType(): Agent[] {
  return demoAgents.map((a, i) => ({
    id: `agent-demo-${i + 1}`,
    name: a.name,
    email: a.email,
    phone: a.phone ?? "+17135550000",
    active: true,
    closeRate: a.closeRate,
    roundRobinWeight: derivedWeight(a.closeRate),
    createdAt: "2026-02-01T00:00:00.000Z",
    metrics: {
      leadsAssigned: Math.floor(demoLeads.length / demoAgents.length) + (i < demoLeads.length % demoAgents.length ? 1 : 0),
      qualifiedCount: 3,
      appointmentsSet: 2,
      closedCount: Math.floor(a.closeRate / 10) || 1,
    },
  }));
}

export function getDemoMessagesAsAppType(leadId?: string): Message[] {
  if (leadId) {
    const conv = demoConversations.find((c) => c.leadId === leadId);
    if (!conv) return [];
    return conv.messages.map((m, i) => ({
      id: `msg-${conv.id}-${i}`,
      direction: m.from === "lead" ? "in" : "out",
      body: m.text,
      createdAt: new Date(Date.now() - (conv.messages.length - i) * 60 * 1000).toISOString(),
      leadId: conv.leadId,
    }));
  }
  const all: Message[] = [];
  demoConversations.forEach((conv) => {
    conv.messages.forEach((m, i) => {
      all.push({
        id: `msg-${conv.id}-${i}`,
        direction: m.from === "lead" ? "in" : "out",
        body: m.text,
        createdAt: new Date(Date.now() - all.length * 60 * 1000).toISOString(),
        leadId: conv.leadId,
      });
    });
  });
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return all;
}

/** All leads for messages convo list (same as getDemoLeadsAsAppType). */
export function getDemoLeadsForConversations(): Lead[] {
  return getDemoLeadsAsAppType();
}

// ---- Dashboard / Analytics helpers ----
export function getDemoDashboardStats(): DashboardStats {
  const closed = demoLeads.filter((l) => l.status === "closed").length;
  const lost = demoLeads.filter((l) => l.status === "lost").length;
  const activeLeads = demoLeads.length - closed - lost;
  const appointments = demoLeads.filter((l) => l.status === "appointment").length;
  const qualifiedCount = demoLeads.filter(
    (l) => l.status === "qualified" || l.status === "appointment" || l.status === "closed"
  ).length;
  const qualifiedRate = demoLeads.length > 0 ? Math.round((qualifiedCount / demoLeads.length) * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const leadsToday = demoLeads.filter((l) => l.created === today).length || 6;

  return {
    leadsToday,
    qualifiedRate: qualifiedRate || Math.round(demoAnalytics.conversionRate),
    avgResponseTime: `${demoAnalytics.avgResponseMin} min`,
    appointments,
    closedThisMonth: closed || 3,
    activeLeads,
  };
}

export function getDemoActivity(limit = 20): ActivityItem[] {
  const items: ActivityItem[] = [];
  const agents = getDemoAgentsAsAppType();
  const now = Date.now();
  const hour = 60 * 60 * 1000;

  demoLeads.slice(0, 10).forEach((l, i) => {
    const t = new Date(now - (20 - i) * hour);
    items.push({
      id: `act-lead-${l.id}`,
      type: "lead_created",
      title: "Lead added",
      description: l.source,
      leadId: l.id,
      leadName: l.name,
      agentName: agents[i % agents.length]?.name,
      createdAt: t.toISOString(),
    });
  });

  items.push({
    id: "act-status-1",
    type: "status_changed",
    title: "Status updated",
    description: "contacted → qualified",
    leadId: "2",
    leadName: "Maria Santos",
    agentName: agents[1]?.name,
    createdAt: new Date(now - 8 * hour).toISOString(),
  });
  items.push({
    id: "act-status-2",
    type: "status_changed",
    title: "Status updated",
    description: "qualified → appointment",
    leadId: "3",
    leadName: "James Wilson",
    agentName: agents[2]?.name,
    createdAt: new Date(now - 6 * hour).toISOString(),
  });
  items.push({
    id: "act-assign-1",
    type: "lead_assigned",
    title: "Lead assigned",
    description: undefined,
    leadId: "4",
    leadName: "Lisa Chen",
    agentName: agents[3]?.name,
    createdAt: new Date(now - 2 * hour).toISOString(),
  });
  items.push({
    id: "act-assign-2",
    type: "lead_assigned",
    title: "Lead assigned",
    description: undefined,
    leadId: "13",
    leadName: "Jessica Moore",
    agentName: agents[0]?.name,
    createdAt: new Date(now - 1 * hour).toISOString(),
  });

  demoConversations.forEach((c, i) => {
    const last = c.messages[c.messages.length - 1];
    if (last) {
      items.push({
        id: `act-msg-${c.id}`,
        type: last.from === "agent" ? "message_sent" : "message_received",
        title: last.from === "agent" ? "Message sent" : "Message received",
        description: last.text.slice(0, 60),
        leadId: c.leadId,
        leadName: c.leadName,
        createdAt: new Date(now - (i + 3) * hour).toISOString(),
      });
    }
  });

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items.slice(0, limit);
}

export function getDemoLeadsByDay(): { date: string; label: string; leads: number }[] {
  const byDay: Record<string, number> = {};
  demoLeads.forEach((l) => {
    const d = l.created;
    byDay[d] = (byDay[d] ?? 0) + 1;
  });
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, leads]) => ({
      date,
      label: date,
      leads,
    }));
}
