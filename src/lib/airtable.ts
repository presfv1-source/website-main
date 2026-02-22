import { unstable_cache } from "next/cache";
import { env } from "./env.mjs";
import type { ActivityItem } from "./types";

const BASE_URL = "https://api.airtable.com/v0";
const PAGE_SIZE = 100;

export const hasAirtable =
  !!process.env.AIRTABLE_API_KEY?.trim() && !!process.env.AIRTABLE_BASE_ID?.trim();

/** Thrown when Airtable returns 401; callers can show "check Airtable connection" instead of crashing. */
export class AirtableAuthError extends Error {
  code = "AUTHENTICATION_REQUIRED" as const;
  constructor(message: string) {
    super(message);
    this.name = "AirtableAuthError";
  }
}

type AirtableRecord<T> = { id: string; fields: T; createdTime?: string };

// ---------------------------------------------------------------------------
// Table names (schema)
// ---------------------------------------------------------------------------
const TABLES = {
  Brokerages: "Brokerages",
  Agents: "Agents",
  Leads: env.server.AIRTABLE_TABLE_LEADS || "Leads",
  Messages: env.server.AIRTABLE_TABLE_MESSAGES || "Messages",
  Conversations: "Conversations",
  Phone_Lines: "Phone_Lines",
  Users: env.server.AIRTABLE_TABLE_USERS || "Users",
  ActivityLog: "ActivityLog",
  RoutingLog: "RoutingLog",
  Insights: "Insights",
  Waitlist: env.server.AIRTABLE_TABLE_WAITLIST || "Waitlist",
} as const;

// ---------------------------------------------------------------------------
// Types (Airtable schema)
// ---------------------------------------------------------------------------

export interface AirtableBrokerage {
  id: string;
  name: string;
  ownerEmail: string;
  ownerName: string;
  ownerPhone: string;
  twilioNumber: string;
  planTier: "starter" | "growth";
  status: "active" | "inactive" | "past_due" | "canceled";
  routingMode: "round_robin" | "manual" | "priority";
  /** True when round-robin or priority mode (backend routing may assign leads). */
  routingEnabled: boolean;
  excludeInactiveAgents: boolean;
  escalationEnabled: boolean;
  escalationMinutes: number;
  escalationMax: number;
  onboardingComplete: boolean;
  onboardingStatus: "not_started" | "in_progress" | "complete";
  agentLimit: number;
  marketCity: string;
  timeZone: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  mrr: number;
  createdAt: string;
  updatedAt: string;
  /** Round-robin pointer (index into weighted agent list). */
  rrPointer?: number;
  /** Version for optimistic concurrency when incrementing pointer. */
  rrVersion?: number;
  /** Default agent record ID when no active agents (optional). */
  defaultAgentId?: string | null;
}

export interface AirtableAgent {
  id: string;
  agentId: number;
  brokerageId: string;
  fullName: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  role: "agent" | "admin" | "owner";
  weight: number;
  lastAssignedAt: string | null;
  receiveSmsAlerts: boolean;
  receiveEmailAlerts: boolean;
  notes: string;
}

export interface AirtableLead {
  id: string;
  leadId: number;
  brokerageId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  leadPhone: string;
  leadEmail: string;
  source:
    | "website"
    | "zillow"
    | "realtor"
    | "facebook_ads"
    | "referral"
    | "other"
    | "manual";
  status:
    | "new"
    | "qualifying"
    | "qualified"
    | "unqualified"
    | "assigned"
    | "nurturing"
    | "closed"
    | "complete"
    | "do_not_contact";
  assignedAgentId: string | null;
  assignedLineId: string | null;
  assignedAt: string | null;
  lastAgentReplyAt: string | null;
  lastLeadMessageAt: string | null;
  createdAt: string;
  intentLabel: "high" | "medium" | "low" | null;
  intentReason: string;
  suggestedAction: "call_now" | "follow_up_1hr" | "nurture" | null;
  escalationEnabled: boolean;
  escalationMinutes: number;
  escalationMax: number;
  escalationCount: number;
  lastEscalatedAt: string | null;
  timeline: "0_30" | "30_90" | "90_plus" | "unknown" | null;
  preApproved: "yes" | "no" | "unknown" | null;
  budgetMin: number | null;
  budgetMax: number | null;
  notes: string;
  /** Set by STOP keyword; when true, no outbound messages to this lead. */
  optedOut?: boolean;
}

export interface AirtableMessage {
  id: string;
  messageId: number;
  leadId: string;
  brokerageId: string;
  direction: "inbound" | "outbound";
  fromNumber: string;
  toNumber: string;
  body: string;
  sentAt: string;
  actorType: "lead" | "ai" | "agent" | "system";
  actorAgentId: string | null;
  twilioMessageSid: string;
  deliveryStatus: "queued" | "sent" | "delivered" | "failed";
}

export interface AirtableConversation {
  id: string;
  conversationId: number;
  leadId: string;
  brokerageId: string;
  assignedAgentId: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string;
  status: "new" | "qualifying" | "complete";
  createdAt: string;
}

export interface AirtablePhoneLine {
  id: string;
  lineId: number;
  brokerageId: string;
  twilioPhoneNumber: string;
  friendlyName: string;
  lineType: "main" | "personal";
  assignedAgentId: string | null;
  status: "active" | "paused";
}

// Legacy status for API compat (Lead in types.ts)
const AIRTABLE_TO_LEGACY_STATUS: Record<string, string> = {
  new: "new",
  qualifying: "qualifying",
  qualified: "qualified",
  unqualified: "lost",
  assigned: "appointment",
  nurturing: "contacted",
  closed: "closed",
  complete: "closed",
  do_not_contact: "do_not_contact",
};
const LEGACY_TO_AIRTABLE_STATUS: Record<string, string> = {
  new: "new",
  contacted: "qualifying",
  qualifying: "qualifying",
  qualified: "qualified",
  appointment: "assigned",
  lost: "unqualified",
  closed: "closed",
  do_not_contact: "do_not_contact",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHeaders(): HeadersInit {
  const key = env.server.AIRTABLE_API_KEY?.trim();
  const baseId = env.server.AIRTABLE_BASE_ID?.trim();
  if (!key || !baseId) {
    throw new Error(
      "Missing Airtable env vars: AIRTABLE_API_KEY and AIRTABLE_BASE_ID required"
    );
  }
  return {
    Authorization: `Bearer ${env.server.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

function tableUrl(tableName: string, params?: string): string {
  const baseId = env.server.AIRTABLE_BASE_ID;
  const table = encodeURIComponent(tableName);
  const url = `${BASE_URL}/${baseId}/${table}`;
  return params ? `${url}?${params}` : url;
}

async function listAllRecords<T>(
  tableName: string,
  filterByFormula?: string
): Promise<AirtableRecord<T>[]> {
  const all: AirtableRecord<T>[] = [];
  let offset: string | undefined;
  do {
    const params = new URLSearchParams();
    params.set("pageSize", String(PAGE_SIZE));
    if (offset) params.set("offset", offset);
    if (filterByFormula) params.set("filterByFormula", filterByFormula);
    const url = tableUrl(tableName, params.toString());
    const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
    if (!res.ok) {
      const err = await res.text();
      if (res.status === 401) {
        console.error("[airtable] AUTHENTICATION_REQUIRED", tableName, err);
        throw new AirtableAuthError(`Airtable ${tableName}: 401 ${err}`);
      }
      console.error(`[airtable] ${tableName} fetch failed: ${res.status}`, err);
      throw new Error(`Airtable ${tableName}: ${res.status} ${err}`);
    }
    const data = (await res.json()) as {
      records: AirtableRecord<T>[];
      offset?: string;
    };
    all.push(...data.records);
    offset = data.offset;
  } while (offset);
  return all;
}

function normalizePhone(phone: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.slice(-10);
}

/** Direction: treat any value that is not inbound/outbound as outbound */
function normalizeDirection(raw: string): "inbound" | "outbound" {
  const d = (raw ?? "").toString().toLowerCase();
  return d === "inbound" ? "inbound" : "outbound";
}

// ---------------------------------------------------------------------------
// Brokerages
// ---------------------------------------------------------------------------

type BrokerageFields = {
  Name?: string;
  OwnerEmail?: string;
  OwnerName?: string;
  OwnerPhone?: string;
  TwilioNumber?: string;
  PlanTier?: string;
  Status?: string;
  RoutingMode?: string;
  ExcludeInactiveAgents?: boolean;
  EscalationEnabled?: boolean;
  EscalationMinutes?: number;
  EscalationMax?: number;
  OnboardingComplete?: boolean;
  OnboardingStatus?: string;
  AgentLimit?: number;
  MarketCity?: string;
  TimeZone?: string;
  StripeCustomerId?: string;
  StripeSubscriptionId?: string;
  MRR?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  RrPointer?: number;
  RrVersion?: number;
  DefaultAgent?: string[];
};

function recordToBrokerage(r: AirtableRecord<BrokerageFields>): AirtableBrokerage {
  const f = r.fields ?? {};
  const planTier =
    f.PlanTier === "growth" ? "growth" : "starter";
  const status = (f.Status ?? "active").toString().toLowerCase() as AirtableBrokerage["status"];
  const routingMode = (f.RoutingMode ?? "round_robin").toString().toLowerCase() as AirtableBrokerage["routingMode"];
  const onboardingStatus = (f.OnboardingStatus ?? "not_started").toString().toLowerCase() as AirtableBrokerage["onboardingStatus"];
  const routingEnabled = routingMode === "round_robin" || routingMode === "priority";
  const defaultAgentId = Array.isArray(f.DefaultAgent) ? f.DefaultAgent[0] ?? null : null;
  return {
    id: r.id,
    name: (f.Name ?? "").toString().trim(),
    ownerEmail: (f.OwnerEmail ?? "").toString().trim(),
    ownerName: (f.OwnerName ?? "").toString().trim(),
    ownerPhone: (f.OwnerPhone ?? "").toString().trim(),
    twilioNumber: (f.TwilioNumber ?? "").toString().trim(),
    planTier,
    status: ["active", "inactive", "past_due", "canceled"].includes(status) ? status : "active",
    routingMode: ["round_robin", "manual", "priority"].includes(routingMode) ? routingMode : "round_robin",
    routingEnabled,
    excludeInactiveAgents: f.ExcludeInactiveAgents === true,
    escalationEnabled: f.EscalationEnabled === true,
    escalationMinutes: typeof f.EscalationMinutes === "number" ? f.EscalationMinutes : 0,
    escalationMax: typeof f.EscalationMax === "number" ? f.EscalationMax : 0,
    onboardingComplete: f.OnboardingComplete === true,
    onboardingStatus: ["not_started", "in_progress", "complete"].includes(onboardingStatus) ? onboardingStatus : "not_started",
    agentLimit: typeof f.AgentLimit === "number" ? f.AgentLimit : 0,
    marketCity: (f.MarketCity ?? "").toString().trim(),
    timeZone: (f.TimeZone ?? "").toString().trim(),
    stripeCustomerId: (f.StripeCustomerId ?? "").toString().trim(),
    stripeSubscriptionId: (f.StripeSubscriptionId ?? "").toString().trim(),
    mrr: typeof f.MRR === "number" ? f.MRR : 0,
    createdAt: (f.CreatedAt ?? r.createdTime ?? "").toString(),
    updatedAt: (f.UpdatedAt ?? r.createdTime ?? "").toString(),
    rrPointer: typeof f.RrPointer === "number" ? f.RrPointer : 0,
    rrVersion: typeof f.RrVersion === "number" ? f.RrVersion : 0,
    defaultAgentId: defaultAgentId ?? undefined,
  };
}

export async function getBrokerageByEmail(
  email: string
): Promise<AirtableBrokerage | null> {
  if (!hasAirtable) return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER({OwnerEmail}) = "${escaped}"`;
  const records = await listAllRecords<BrokerageFields>(TABLES.Brokerages, formula);
  const first = records[0];
  if (!first) return null;
  return recordToBrokerage(first);
}

export async function getBrokerageById(
  id: string
): Promise<AirtableBrokerage | null> {
  if (!hasAirtable) return null;
  const url = `${tableUrl(TABLES.Brokerages)}/${id}`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) {
    if (res.status === 401) throw new AirtableAuthError(`Airtable getBrokerageById: 401`);
    if (res.status === 404) return null;
    throw new Error(`Airtable getBrokerageById: ${res.status}`);
  }
  const r = (await res.json()) as AirtableRecord<BrokerageFields>;
  return recordToBrokerage(r);
}

export async function createBrokerage(
  data: Partial<AirtableBrokerage>
): Promise<AirtableBrokerage> {
  if (!hasAirtable) throw new Error("Airtable not configured");
  const url = tableUrl(TABLES.Brokerages);
  const fields: Record<string, unknown> = {};
  if (data.name != null) fields.Name = data.name;
  if (data.ownerEmail != null) fields.OwnerEmail = data.ownerEmail;
  if (data.ownerName != null) fields.OwnerName = data.ownerName;
  if (data.ownerPhone != null) fields.OwnerPhone = data.ownerPhone;
  if (data.twilioNumber != null) fields.TwilioNumber = data.twilioNumber;
  if (data.planTier != null) fields.PlanTier = data.planTier;
  if (data.status != null) fields.Status = data.status;
  if (data.routingMode != null) fields.RoutingMode = data.routingMode;
  if (data.excludeInactiveAgents != null) fields.ExcludeInactiveAgents = data.excludeInactiveAgents;
  if (data.escalationEnabled != null) fields.EscalationEnabled = data.escalationEnabled;
  if (data.escalationMinutes != null) fields.EscalationMinutes = data.escalationMinutes;
  if (data.escalationMax != null) fields.EscalationMax = data.escalationMax;
  if (data.onboardingComplete != null) fields.OnboardingComplete = data.onboardingComplete;
  if (data.onboardingStatus != null) fields.OnboardingStatus = data.onboardingStatus;
  if (data.agentLimit != null) fields.AgentLimit = data.agentLimit;
  if (data.marketCity != null) fields.MarketCity = data.marketCity;
  if (data.timeZone != null) fields.TimeZone = data.timeZone;
  if (data.stripeCustomerId != null) fields.StripeCustomerId = data.stripeCustomerId;
  if (data.stripeSubscriptionId != null) fields.StripeSubscriptionId = data.stripeSubscriptionId;
  if (data.mrr != null) fields.MRR = data.mrr;
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable createBrokerage: 401 ${err}`);
    throw new Error(`Airtable createBrokerage: ${res.status} ${err}`);
  }
  const created = (await res.json()) as AirtableRecord<BrokerageFields>;
  return recordToBrokerage(created);
}

export async function updateBrokerage(
  id: string,
  data: Partial<AirtableBrokerage>
): Promise<AirtableBrokerage> {
  if (!hasAirtable) throw new Error("Airtable not configured");
  const url = `${tableUrl(TABLES.Brokerages)}/${id}`;
  const fields: Record<string, unknown> = {};
  if (data.name != null) fields.Name = data.name;
  if (data.ownerEmail != null) fields.OwnerEmail = data.ownerEmail;
  if (data.ownerName != null) fields.OwnerName = data.ownerName;
  if (data.ownerPhone != null) fields.OwnerPhone = data.ownerPhone;
  if (data.twilioNumber != null) fields.TwilioNumber = data.twilioNumber;
  if (data.planTier != null) fields.PlanTier = data.planTier;
  if (data.status != null) fields.Status = data.status;
  if (data.routingMode != null) fields.RoutingMode = data.routingMode;
  if (data.excludeInactiveAgents != null) fields.ExcludeInactiveAgents = data.excludeInactiveAgents;
  if (data.escalationEnabled != null) fields.EscalationEnabled = data.escalationEnabled;
  if (data.escalationMinutes != null) fields.EscalationMinutes = data.escalationMinutes;
  if (data.escalationMax != null) fields.EscalationMax = data.escalationMax;
  if (data.onboardingComplete != null) fields.OnboardingComplete = data.onboardingComplete;
  if (data.onboardingStatus != null) fields.OnboardingStatus = data.onboardingStatus;
  if (data.agentLimit != null) fields.AgentLimit = data.agentLimit;
  if (data.marketCity != null) fields.MarketCity = data.marketCity;
  if (data.timeZone != null) fields.TimeZone = data.timeZone;
  if (data.stripeCustomerId != null) fields.StripeCustomerId = data.stripeCustomerId;
  if (data.stripeSubscriptionId != null) fields.StripeSubscriptionId = data.stripeSubscriptionId;
  if (data.mrr != null) fields.MRR = data.mrr;
  if (data.updatedAt != null) fields.UpdatedAt = data.updatedAt;
  if (data.rrPointer !== undefined) fields.RrPointer = data.rrPointer;
  if (data.rrVersion !== undefined) fields.RrVersion = data.rrVersion;
  if (data.defaultAgentId !== undefined) fields.DefaultAgent = data.defaultAgentId ? [data.defaultAgentId] : [];
  if (Object.keys(fields).length === 0) {
    const b = await getBrokerageById(id);
    if (!b) throw new Error("Brokerage not found");
    return b;
  }
  const res = await fetch(url, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable updateBrokerage: 401 ${err}`);
    throw new Error(`Airtable updateBrokerage: ${res.status} ${err}`);
  }
  const updated = (await res.json()) as AirtableRecord<BrokerageFields>;
  return recordToBrokerage(updated);
}

/** Alias for getBrokerageById for backend routing (returns brokerage with rrPointer, rrVersion, defaultAgentId, routingEnabled). */
export async function getBrokerage(brokerageId: string): Promise<AirtableBrokerage | null> {
  return getBrokerageById(brokerageId);
}

/** Increment round-robin pointer with optimistic concurrency. Throws if current pointer/version do not match. */
export async function incrementBrokeragePointer(
  brokerageId: string,
  currentPointer: number,
  currentVersion: number
): Promise<void> {
  if (!hasAirtable) throw new Error("Airtable not configured");
  const b = await getBrokerageById(brokerageId);
  if (!b) throw new Error("Brokerage not found");
  const ptr = b.rrPointer ?? 0;
  const ver = b.rrVersion ?? 0;
  if (ptr !== currentPointer || ver !== currentVersion) {
    throw new Error(
      `Brokerage pointer/version mismatch: expected ${currentPointer}/${currentVersion}, got ${ptr}/${ver}`
    );
  }
  await updateBrokerage(brokerageId, {
    rrPointer: currentPointer + 1,
    rrVersion: currentVersion + 1,
  });
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

type AgentFields = {
  AgentID?: number;
  "Full Name"?: string;
  Email?: string;
  Phone?: string;
  Status?: string;
  Role?: string;
  Weight?: number;
  LastAssignedAt?: string;
  ReceiveSmsAlerts?: boolean;
  ReceiveEmailAlerts?: boolean;
  Notes?: string;
  Brokerage?: string[];
};

function recordToAgent(r: AirtableRecord<AgentFields>): AirtableAgent {
  const f = r.fields ?? {};
  const status = (f.Status ?? "active").toString().toLowerCase() as "active" | "inactive";
  const role = (f.Role ?? "agent").toString().toLowerCase() as "agent" | "admin" | "owner";
  return {
    id: r.id,
    agentId: typeof f.AgentID === "number" ? f.AgentID : 0,
    brokerageId: Array.isArray(f.Brokerage) ? f.Brokerage[0] ?? "" : "",
    fullName: (f["Full Name"] ?? "").toString().trim(),
    email: (f.Email ?? "").toString().trim(),
    phone: (f.Phone ?? "").toString().trim(),
    status: status === "inactive" ? "inactive" : "active",
    role: ["agent", "admin", "owner"].includes(role) ? role : "agent",
    weight: typeof f.Weight === "number" ? f.Weight : 0,
    lastAssignedAt: f.LastAssignedAt?.trim() ?? null,
    receiveSmsAlerts: f.ReceiveSmsAlerts === true,
    receiveEmailAlerts: f.ReceiveEmailAlerts === true,
    notes: (f.Notes ?? "").toString().trim(),
  };
}

/** Get agents. When brokerageId provided, filter by brokerage; otherwise return all (backward compat). */
export async function getAgents(brokerageId?: string): Promise<AgentCompat[]> {
  if (!hasAirtable) return [];
  let formula: string | undefined;
  if (brokerageId?.trim()) {
    const escaped = brokerageId.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    formula = `FIND("${escaped}", ARRAYJOIN({Brokerage}))`;
  }
  const records = await listAllRecords<AgentFields>(TABLES.Agents, formula);
  return records.map(recordToAgent).map(toAgentCompat);
}

/** Active agents for a brokerage, with rrWeight (1–10) for weighted round-robin. */
export async function getActiveAgentsForBrokerage(
  brokerageId: string
): Promise<{ id: string; name: string; phone: string; rrWeight: number }[]> {
  const agents = await getAgents(brokerageId);
  const active = agents.filter((a) => a.active);
  return active.map((a) => ({
    id: a.id,
    name: a.name,
    phone: a.phone ?? "",
    rrWeight: Math.max(1, Math.min(10, a.weight ?? 5)),
  }));
}

export async function getAgentById(id: string): Promise<AirtableAgent | null> {
  if (!hasAirtable) return null;
  const url = `${tableUrl(TABLES.Agents)}/${id}`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) {
    if (res.status === 401) throw new AirtableAuthError(`Airtable getAgentById: 401`);
    if (res.status === 404) return null;
    throw new Error(`Airtable getAgentById: ${res.status}`);
  }
  const r = (await res.json()) as AirtableRecord<AgentFields>;
  return recordToAgent(r);
}

export async function getAgentByEmail(
  email: string
): Promise<AirtableAgent | null> {
  if (!hasAirtable) return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER({Email}) = "${escaped}"`;
  const records = await listAllRecords<AgentFields>(TABLES.Agents, formula);
  const first = records[0];
  if (!first) return null;
  return recordToAgent(first);
}

export async function createAgent(
  data: Partial<AirtableAgent> & { name?: string }
): Promise<AgentCompat> {
  if (!hasAirtable) throw new Error("Airtable not configured");
  const url = tableUrl(TABLES.Agents);
  const fullName = data.fullName ?? (data as { name?: string }).name ?? "";
  const fields: Record<string, unknown> = {
    "Full Name": fullName || data.email?.split("@")[0] || "Agent",
    Email: data.email ?? "",
    Phone: data.phone ?? "",
    Status: (data.status ?? "active").toString(),
    Role: (data.role ?? "agent").toString(),
    Weight: typeof data.weight === "number" ? data.weight : 0,
    ReceiveSmsAlerts: data.receiveSmsAlerts ?? false,
    ReceiveEmailAlerts: data.receiveEmailAlerts ?? false,
    Notes: data.notes ?? "",
  };
  if (data.lastAssignedAt != null) fields.LastAssignedAt = data.lastAssignedAt;
  if (data.brokerageId) fields.Brokerage = [data.brokerageId];
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable createAgent: 401 ${err}`);
    throw new Error(`Airtable createAgent: ${res.status} ${err}`);
  }
  const created = (await res.json()) as AirtableRecord<AgentFields>;
  return toAgentCompat(recordToAgent(created));
}

export async function updateAgent(
  id: string,
  data: Partial<AirtableAgent> & { name?: string; email?: string; phone?: string; active?: boolean }
): Promise<AgentCompat> {
  if (!hasAirtable) throw new Error("Airtable not configured");
  const url = `${tableUrl(TABLES.Agents)}/${id}`;
  const fields: Record<string, unknown> = {};
  const name = data.fullName ?? (data as { name?: string }).name;
  if (name !== undefined) fields["Full Name"] = name.toString().trim();
  if (data.email !== undefined) fields.Email = data.email.toString().trim();
  if (data.phone !== undefined) fields.Phone = data.phone.toString().trim();
  if ((data as { active?: boolean }).active !== undefined) {
    fields.Status = (data as { active?: boolean }).active ? "active" : "inactive";
  }
  if (data.status !== undefined) fields.Status = data.status;
  if (data.role !== undefined) fields.Role = data.role;
  if (data.weight !== undefined) fields.Weight = data.weight;
  if (data.lastAssignedAt !== undefined) fields.LastAssignedAt = data.lastAssignedAt;
  if (data.receiveSmsAlerts !== undefined) fields.ReceiveSmsAlerts = data.receiveSmsAlerts;
  if (data.receiveEmailAlerts !== undefined) fields.ReceiveEmailAlerts = data.receiveEmailAlerts;
  if (data.notes !== undefined) fields.Notes = data.notes;
  if (data.brokerageId !== undefined) fields.Brokerage = data.brokerageId ? [data.brokerageId] : [];
  if (Object.keys(fields).length === 0) {
    const a = await getAgentById(id);
    if (!a) throw new Error("Agent not found");
    return toAgentCompat(a);
  }
  const res = await fetch(url, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable updateAgent: 401 ${err}`);
    throw new Error(`Airtable updateAgent: ${res.status} ${err}`);
  }
  const updated = (await res.json()) as AirtableRecord<AgentFields>;
  return toAgentCompat(recordToAgent(updated));
}

export async function updateAgentRoundRobinWeight(
  agentId: string,
  weight: number
): Promise<void> {
  if (!hasAirtable) return;
  const n = Math.min(10, Math.max(1, Math.round(weight)));
  const url = `${tableUrl(TABLES.Agents)}/${agentId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ fields: { Weight: n } }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable update agent weight: 401 ${err}`);
    throw new Error(`Airtable update agent weight: ${res.status} ${err}`);
  }
}

/** Agent compat: name and active for API/frontend that expect Agent shape */
export type AgentCompat = AirtableAgent & { name: string; active: boolean };

function toAgentCompat(a: AirtableAgent): AgentCompat {
  return {
    ...a,
    name: a.fullName || "—",
    active: a.status === "active",
  };
}

/** Resolve Airtable Agent record id by email. */
export async function getAgentIdByEmail(email: string): Promise<string | null> {
  const agent = await getAgentByEmail(email);
  return agent?.id ?? null;
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

type LeadFields = {
  LeadID?: number;
  "First Name"?: string;
  "Last Name"?: string;
  "Full Name"?: string;
  "Lead Phone"?: string;
  "Lead Email"?: string;
  Source?: string;
  Status?: string;
  "Assigned Agent"?: string[];
  "Assigned Line"?: string[];
  "Assigned At"?: string;
  "Last Agent Reply At"?: string;
  "Last Lead Message At"?: string;
  "Created At"?: string;
  "Intent Label"?: string;
  "Intent Reason"?: string;
  "Suggested Action"?: string;
  "Escalation Enabled"?: boolean;
  "Escalation Minutes"?: number;
  "Escalation Max"?: number;
  "Escalation Count"?: number;
  "Last Escalated At"?: string;
  Timeline?: string;
  "Pre Approved"?: string;
  "Budget Min"?: number;
  "Budget Max"?: number;
  Notes?: string;
  Brokerage?: string[];
  "Opted Out"?: boolean;
};

const LEAD_SOURCES = [
  "website",
  "zillow",
  "realtor",
  "facebook_ads",
  "referral",
  "other",
  "manual",
] as const;
const LEAD_STATUSES = [
  "new",
  "qualifying",
  "qualified",
  "unqualified",
  "assigned",
  "nurturing",
  "closed",
  "complete",
  "do_not_contact",
] as const;
const INTENT_LABELS = ["high", "medium", "low"] as const;
const SUGGESTED_ACTIONS = ["call_now", "follow_up_1hr", "nurture"] as const;
const TIMELINES = ["0_30", "30_90", "90_plus", "unknown"] as const;
const PRE_APPROVED = ["yes", "no", "unknown"] as const;

function recordToLead(r: AirtableRecord<LeadFields>): AirtableLead {
  const f = r.fields ?? {};
  const rawStatus = (f.Status ?? "new").toString().toLowerCase();
  const status = LEAD_STATUSES.includes(rawStatus as (typeof LEAD_STATUSES)[number])
    ? (rawStatus as AirtableLead["status"])
    : "new";
  const source = LEAD_SOURCES.includes((f.Source ?? "").toString().toLowerCase() as (typeof LEAD_SOURCES)[number])
    ? (f.Source as AirtableLead["source"])
    : "other";
  const intentLabel = INTENT_LABELS.includes((f["Intent Label"] ?? "").toString().toLowerCase() as (typeof INTENT_LABELS)[number])
    ? (f["Intent Label"] as AirtableLead["intentLabel"])
    : null;
  const suggestedAction = SUGGESTED_ACTIONS.includes((f["Suggested Action"] ?? "").toString().toLowerCase() as (typeof SUGGESTED_ACTIONS)[number])
    ? (f["Suggested Action"] as AirtableLead["suggestedAction"])
    : null;
  const timeline = TIMELINES.includes((f.Timeline ?? "").toString() as (typeof TIMELINES)[number])
    ? (f.Timeline as AirtableLead["timeline"])
    : null;
  const preApproved = PRE_APPROVED.includes((f["Pre Approved"] ?? "").toString().toLowerCase() as (typeof PRE_APPROVED)[number])
    ? (f["Pre Approved"] as AirtableLead["preApproved"])
    : null;
  return {
    id: r.id,
    leadId: typeof f.LeadID === "number" ? f.LeadID : 0,
    brokerageId: Array.isArray(f.Brokerage) ? f.Brokerage[0] ?? "" : "",
    firstName: (f["First Name"] ?? "").toString().trim(),
    lastName: (f["Last Name"] ?? "").toString().trim(),
    fullName: (f["Full Name"] ?? "").toString().trim(),
    leadPhone: (f["Lead Phone"] ?? "").toString().trim(),
    leadEmail: (f["Lead Email"] ?? "").toString().trim(),
    source,
    status,
    assignedAgentId: Array.isArray(f["Assigned Agent"]) ? f["Assigned Agent"][0] ?? null : null,
    assignedLineId: Array.isArray(f["Assigned Line"]) ? f["Assigned Line"][0] ?? null : null,
    assignedAt: f["Assigned At"]?.trim() ?? null,
    lastAgentReplyAt: f["Last Agent Reply At"]?.trim() ?? null,
    lastLeadMessageAt: f["Last Lead Message At"]?.trim() ?? null,
    createdAt: (f["Created At"] ?? r.createdTime ?? "").toString(),
    intentLabel,
    intentReason: (f["Intent Reason"] ?? "").toString().trim(),
    suggestedAction,
    escalationEnabled: f["Escalation Enabled"] === true,
    escalationMinutes: typeof f["Escalation Minutes"] === "number" ? f["Escalation Minutes"] : 0,
    escalationMax: typeof f["Escalation Max"] === "number" ? f["Escalation Max"] : 0,
    escalationCount: typeof f["Escalation Count"] === "number" ? f["Escalation Count"] : 0,
    lastEscalatedAt: f["Last Escalated At"]?.trim() ?? null,
    timeline,
    preApproved,
    budgetMin: typeof f["Budget Min"] === "number" ? f["Budget Min"] : null,
    budgetMax: typeof f["Budget Max"] === "number" ? f["Budget Max"] : null,
    notes: (f.Notes ?? "").toString().trim(),
    optedOut: f["Opted Out"] === true,
  };
}

/** Lead shape with legacy name/phone/email/status for API compat */
export type LeadCompat = AirtableLead & {
  name: string;
  phone: string;
  email: string;
  status: "new" | "contacted" | "qualifying" | "qualified" | "appointment" | "closed" | "lost" | "do_not_contact";
  assignedTo?: string;
  assignedToName?: string;
  lastMessageAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function toLeadCompat(l: AirtableLead, assignedToName?: string): LeadCompat {
  const legacyStatus = (AIRTABLE_TO_LEGACY_STATUS[l.status] ?? l.status) as LeadCompat["status"];
  return {
    ...l,
    name: l.fullName || "—",
    phone: l.leadPhone || "",
    email: l.leadEmail || "",
    status: legacyStatus,
    assignedTo: l.assignedAgentId ?? undefined,
    assignedToName,
    lastMessageAt: l.lastLeadMessageAt,
    createdAt: l.createdAt,
    updatedAt: l.lastLeadMessageAt ?? l.assignedAt ?? l.createdAt,
  };
}

async function getLeadsUncached(
  brokerageId?: string,
  filters?: { status?: string; agentId?: string }
): Promise<LeadCompat[]> {
  if (!hasAirtable) return [];
  let formula: string | undefined;
  if (brokerageId?.trim()) {
    const escaped = brokerageId.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    formula = `FIND("${escaped}", ARRAYJOIN({Brokerage}))`;
  }
  if (filters?.agentId?.trim()) {
    const escaped = (filters.agentId ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const agentFilter = `{Assigned Agent} = "${escaped}"`;
    formula = formula ? `AND(${formula}, ${agentFilter})` : agentFilter;
  }
  if (filters?.status?.trim() && filters.status !== "all") {
    const statusVal = LEGACY_TO_AIRTABLE_STATUS[filters.status] ?? filters.status;
    const statusFilter = `{Status} = "${statusVal}"`;
    formula = formula ? `AND(${formula}, ${statusFilter})` : statusFilter;
  }
  const records = await listAllRecords<LeadFields>(TABLES.Leads, formula);
  const leads = records.map(recordToLead);
  const agentIds = [...new Set(leads.map((l) => l.assignedAgentId).filter(Boolean))] as string[];
  let agentNames: Map<string, string> = new Map();
  if (agentIds.length > 0) {
    const agents = await getAgents();
    agentNames = new Map(agents.map((a) => [a.id, a.fullName]));
  }
  return leads.map((l) => toLeadCompat(l, l.assignedAgentId ? agentNames.get(l.assignedAgentId) : undefined));
}

const getLeadsCachedAll = hasAirtable
  ? unstable_cache(
      () => getLeadsUncached(undefined, undefined),
      ["airtable-leads"],
      { revalidate: 60, tags: ["leads"] }
    )
  : () => Promise.resolve([]);

/**
 * Get leads. Backward compat: when only one string arg is passed, treat as agentId filter.
 * getLeads() → all leads; getLeads(agentId) → leads for that agent; getLeads(brokerageId, filters) → filtered.
 */
export async function getLeads(
  brokerageIdOrAgentId?: string,
  filters?: { status?: string; agentId?: string }
): Promise<LeadCompat[]> {
  if (filters != null && Object.keys(filters).length > 0) {
    return getLeadsUncached(brokerageIdOrAgentId, filters);
  }
  if (brokerageIdOrAgentId != null && brokerageIdOrAgentId.trim() !== "") {
    return getLeadsUncached(undefined, { agentId: brokerageIdOrAgentId });
  }
  return getLeadsCachedAll();
}

export async function getLeadById(id: string): Promise<AirtableLead | null> {
  if (!hasAirtable) return null;
  const url = `${tableUrl(TABLES.Leads)}/${id}`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) {
    if (res.status === 401) throw new AirtableAuthError(`Airtable getLeadById: 401`);
    if (res.status === 404) return null;
    throw new Error(`Airtable getLeadById: ${res.status}`);
  }
  const r = (await res.json()) as AirtableRecord<LeadFields>;
  return recordToLead(r);
}

export async function getLeadByPhone(phone: string): Promise<LeadCompat | null> {
  if (!hasAirtable) return null;
  try {
    const normalized = normalizePhone(phone);
    if (!normalized) return null;
    const escaped = `"+1${normalized}"`;
    const formula = `OR({Lead Phone} = "${normalized}", {Lead Phone} = ${escaped})`;
    const records = await listAllRecords<LeadFields>(TABLES.Leads, formula);
    const first = records[0];
    if (!first) return null;
    const lead = recordToLead(first);
    const agentName = lead.assignedAgentId
      ? (await getAgentById(lead.assignedAgentId))?.fullName
      : undefined;
    return toLeadCompat(lead, agentName);
  } catch (e) {
    if (e instanceof AirtableAuthError) throw e;
    console.warn("[airtable] getLeadByPhone failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Input for createLead; source/status as string for API compat */
export type CreateLeadInput = Omit<Partial<AirtableLead>, "source" | "status"> & {
  name?: string;
  phone?: string;
  email?: string;
  status?: string;
  source?: string;
  assignedTo?: string;
  brokerageId?: string;
};

export async function createLead(data: CreateLeadInput): Promise<LeadCompat> {
  if (!hasAirtable) {
    const name = data.fullName ?? data.name ?? "—";
    const phone = data.leadPhone ?? data.phone ?? "";
    return toLeadCompat({
      id: `lead-${Date.now()}`,
      leadId: 0,
      brokerageId: data.brokerageId ?? "",
      firstName: "",
      lastName: "",
      fullName: name,
      leadPhone: phone,
      leadEmail: data.leadEmail ?? data.email ?? "",
      source: (data.source as AirtableLead["source"]) ?? "other",
      status: "new",
      assignedAgentId: data.assignedAgentId ?? data.assignedTo ?? null,
      assignedLineId: null,
      assignedAt: null,
      lastAgentReplyAt: null,
      lastLeadMessageAt: null,
      createdAt: new Date().toISOString(),
      intentLabel: null,
      intentReason: "",
      suggestedAction: null,
      escalationEnabled: false,
      escalationMinutes: 0,
      escalationMax: 0,
      escalationCount: 0,
      lastEscalatedAt: null,
      timeline: null,
      preApproved: null,
      budgetMin: null,
      budgetMax: null,
      notes: "",
    });
  }
  const url = tableUrl(TABLES.Leads);
  const fullName = data.fullName ?? data.name ?? "";
  const parts = (fullName || "").trim().split(/\s+/);
  const firstName = data.firstName ?? parts[0] ?? "";
  const lastName = data.lastName ?? parts.slice(1).join(" ") ?? "";
  const leadPhone = data.leadPhone ?? data.phone ?? "";
  const leadEmail = data.leadEmail ?? data.email ?? "";
  const rawStatus = (data.status ?? "new").toString().toLowerCase();
  const status = (LEGACY_TO_AIRTABLE_STATUS[rawStatus] ?? rawStatus) as AirtableLead["status"];
  const source = LEAD_SOURCES.includes((data.source ?? "other").toLowerCase() as (typeof LEAD_SOURCES)[number])
    ? (data.source as AirtableLead["source"])
    : "other";
  const fields: Record<string, unknown> = {
    "First Name": firstName,
    "Last Name": lastName,
    "Full Name": (fullName || `${firstName} ${lastName}`).trim() || "—",
    "Lead Phone": leadPhone,
    "Lead Email": leadEmail,
    Source: source,
    Status: status,
    Notes: data.notes ?? "",
  };
  if (data.brokerageId) fields.Brokerage = [data.brokerageId];
  if (data.assignedAgentId ?? data.assignedTo) {
    fields["Assigned Agent"] = [data.assignedAgentId ?? data.assignedTo!];
  }
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable createLead: 401 ${err}`);
    throw new Error(`Airtable createLead: ${res.status} ${err}`);
  }
  const created = (await res.json()) as AirtableRecord<LeadFields>;
  const lead = recordToLead(created);
  return toLeadCompat(lead);
}

export async function updateLead(
  id: string,
  data: Partial<Pick<AirtableLead, "assignedAgentId" | "lastLeadMessageAt" | "assignedAt">> & {
    status?: string;
    assignedTo?: string;
    lastMessageAt?: string;
    notes?: string;
    intent?: string;
    optedOut?: boolean;
  }
): Promise<LeadCompat> {
  if (!hasAirtable) {
    const existing = await getLeadById(id);
    if (!existing) throw new Error("Lead not found");
    return toLeadCompat(existing);
  }
  const url = `${tableUrl(TABLES.Leads)}/${id}`;
  const fields: Record<string, unknown> = {};
  if (data.lastLeadMessageAt != null) fields["Last Lead Message At"] = data.lastLeadMessageAt;
  if ((data as { lastMessageAt?: string }).lastMessageAt != null) {
    fields["Last Lead Message At"] = (data as { lastMessageAt?: string }).lastMessageAt;
  }
  if (data.status != null) {
    const raw = data.status.toString().toLowerCase();
    fields.Status = LEGACY_TO_AIRTABLE_STATUS[raw] ?? raw;
  }
  if (data.assignedTo !== undefined) {
    fields["Assigned Agent"] = data.assignedTo ? [data.assignedTo] : [];
  }
  if (data.assignedAgentId !== undefined) {
    fields["Assigned Agent"] = data.assignedAgentId ? [data.assignedAgentId] : [];
  }
  if (data.assignedAt != null) fields["Assigned At"] = data.assignedAt;
  if (data.notes != null) fields["Notes"] = data.notes;
  if (data.intent != null) fields["Intent"] = data.intent;
  if ("optedOut" in data) {
    fields["Opted Out"] = Boolean(data.optedOut);
  }
  if (Object.keys(fields).length === 0) {
    const lead = await getLeadById(id);
    if (!lead) throw new Error("Lead not found");
    return toLeadCompat(lead);
  }
  const res = await fetch(url, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable updateLead: 401 ${err}`);
    throw new Error(`Airtable updateLead: ${res.status} ${err}`);
  }
  const updated = (await res.json()) as AirtableRecord<LeadFields>;
  const lead = recordToLead(updated);
  return toLeadCompat(lead);
}

/** Update lead assignment/qualification (used by backend round-robin routing). */
export async function updateLeadQualification(
  leadId: string,
  data: { assignedAgent: string; status: string; lastRoutedAt: string }
): Promise<LeadCompat> {
  const statusNorm = data.status.toLowerCase() === "assigned" ? "assigned" : data.status;
  return updateLead(leadId, {
    assignedAgentId: data.assignedAgent,
    status: statusNorm,
    assignedAt: data.lastRoutedAt,
  });
}

export async function deleteLead(id: string): Promise<void> {
  if (!hasAirtable) return;
  const url = `${tableUrl(TABLES.Leads)}/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable deleteLead: 401 ${err}`);
    throw new Error(`Airtable deleteLead: ${res.status} ${err}`);
  }
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

type MessageFields = {
  MessageID?: number;
  Lead?: string[];
  Brokerage?: string[];
  Direction?: string;
  "From Number"?: string;
  "To Number"?: string;
  Body?: string;
  "Sent At"?: string;
  "Actor Type"?: string;
  "Actor Agent"?: string[];
  "Twilio Message SID"?: string;
  "Delivery Status"?: string;
};

function recordToMessage(r: AirtableRecord<MessageFields>): AirtableMessage {
  const f = r.fields ?? {};
  const dir = normalizeDirection((f.Direction ?? "").toString());
  const actorType = (f["Actor Type"] ?? "lead").toString().toLowerCase() as AirtableMessage["actorType"];
  const deliveryStatus = (f["Delivery Status"] ?? "sent").toString().toLowerCase() as AirtableMessage["deliveryStatus"];
  return {
    id: r.id,
    messageId: typeof f.MessageID === "number" ? f.MessageID : 0,
    leadId: Array.isArray(f.Lead) ? f.Lead[0] ?? "" : "",
    brokerageId: Array.isArray(f.Brokerage) ? f.Brokerage[0] ?? "" : "",
    direction: dir,
    fromNumber: (f["From Number"] ?? "").toString().trim(),
    toNumber: (f["To Number"] ?? "").toString().trim(),
    body: (f.Body ?? "").toString().trim(),
    sentAt: (f["Sent At"] ?? r.createdTime ?? "").toString(),
    actorType: ["lead", "ai", "agent", "system"].includes(actorType) ? actorType : "lead",
    actorAgentId: Array.isArray(f["Actor Agent"]) ? f["Actor Agent"][0] ?? null : null,
    twilioMessageSid: (f["Twilio Message SID"] ?? "").toString().trim(),
    deliveryStatus: ["queued", "sent", "delivered", "failed"].includes(deliveryStatus) ? deliveryStatus : "sent",
  };
}

/** Message compat: direction "in" | "out" and createdAt for API (overrides AirtableMessage.direction) */
export type MessageCompat = Omit<AirtableMessage, "direction"> & {
  direction: "in" | "out";
  createdAt: string;
  leadId?: string;
  senderType?: "ai" | "agent" | "lead";
};

function toMessageCompat(m: AirtableMessage): MessageCompat {
  return {
    ...m,
    direction: m.direction === "inbound" ? "in" : "out",
    createdAt: m.sentAt,
    leadId: m.leadId,
    senderType: m.actorType === "ai" ? "ai" : m.actorType === "agent" ? "agent" : "lead",
  };
}

export async function getMessages(leadId?: string): Promise<MessageCompat[]> {
  if (!hasAirtable) return [];
  let formula: string | undefined;
  if (leadId?.trim()) {
    const escaped = leadId.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    formula = `{Lead} = "${escaped}"`;
  }
  const records = await listAllRecords<MessageFields>(TABLES.Messages, formula);
  const list = records.map(recordToMessage).map(toMessageCompat);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

export type CreateMessageInput = {
  leadId: string;
  body: string;
  direction: "in" | "out";
  senderType?: "ai" | "agent" | "lead";
  brokerageId?: string;
  fromNumber?: string;
  toNumber?: string;
  actorAgentId?: string | null;
  twilioMessageSid?: string;
  deliveryStatus?: AirtableMessage["deliveryStatus"];
};

export async function createMessage(data: CreateMessageInput): Promise<MessageCompat> {
  if (!hasAirtable) {
    return toMessageCompat({
      id: `msg-${Date.now()}`,
      messageId: 0,
      leadId: data.leadId,
      brokerageId: data.brokerageId ?? "",
      direction: data.direction === "in" ? "inbound" : "outbound",
      fromNumber: data.fromNumber ?? "",
      toNumber: data.toNumber ?? "",
      body: data.body ?? "",
      sentAt: new Date().toISOString(),
      actorType: (data.senderType as "lead" | "ai" | "agent" | "system") ?? "lead",
      actorAgentId: data.actorAgentId ?? null,
      twilioMessageSid: data.twilioMessageSid ?? "",
      deliveryStatus: data.deliveryStatus ?? "sent",
    });
  }
  const url = tableUrl(TABLES.Messages);
  const direction = data.direction === "in" ? "inbound" : "outbound";
  const actorType = (data.senderType ?? "lead") as "lead" | "ai" | "agent" | "system";
  const now = new Date().toISOString();
  const fields: Record<string, unknown> = {
    Lead: [data.leadId],
    Direction: direction,
    Body: data.body ?? "",
    "Sent At": now,
    "Actor Type": actorType,
    "Twilio Message SID": data.twilioMessageSid ?? "",
    "Delivery Status": data.deliveryStatus ?? "sent",
  };
  if (data.brokerageId) fields.Brokerage = [data.brokerageId];
  if (data.fromNumber) fields["From Number"] = data.fromNumber;
  if (data.toNumber) fields["To Number"] = data.toNumber;
  if (data.actorAgentId) fields["Actor Agent"] = [data.actorAgentId];
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable createMessage: 401 ${err}`);
    throw new Error(`Airtable createMessage: ${res.status} ${err}`);
  }
  const created = (await res.json()) as AirtableRecord<MessageFields>;
  return toMessageCompat(recordToMessage(created));
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

type ConversationFields = {
  ConversationID?: number;
  Lead?: string[];
  Brokerage?: string[];
  AssignedAgent?: string[];
  LastMessageAt?: string;
  LastMessagePreview?: string;
  Status?: string;
  CreatedAt?: string;
};

function recordToConversation(
  r: AirtableRecord<ConversationFields>
): AirtableConversation {
  const f = r.fields ?? {};
  const status = (f.Status ?? "new").toString().toLowerCase() as AirtableConversation["status"];
  return {
    id: r.id,
    conversationId: typeof f.ConversationID === "number" ? f.ConversationID : 0,
    leadId: Array.isArray(f.Lead) ? f.Lead[0] ?? "" : "",
    brokerageId: Array.isArray(f.Brokerage) ? f.Brokerage[0] ?? "" : "",
    assignedAgentId: Array.isArray(f.AssignedAgent) ? f.AssignedAgent[0] ?? null : null,
    lastMessageAt: f.LastMessageAt?.trim() ?? null,
    lastMessagePreview: (f.LastMessagePreview ?? "").toString().trim(),
    status: ["new", "qualifying", "complete"].includes(status) ? status : "new",
    createdAt: (f.CreatedAt ?? r.createdTime ?? "").toString(),
  };
}

export async function getConversations(
  brokerageId: string
): Promise<AirtableConversation[]> {
  if (!hasAirtable) return [];
  const escaped = brokerageId.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `FIND("${escaped}", ARRAYJOIN({Brokerage}))`;
  const records = await listAllRecords<ConversationFields>(
    TABLES.Conversations,
    formula
  );
  return records.map(recordToConversation);
}

export async function getConversationByLeadId(
  leadId: string
): Promise<AirtableConversation | null> {
  if (!hasAirtable) return null;
  const escaped = leadId.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `{Lead} = "${escaped}"`;
  const records = await listAllRecords<ConversationFields>(
    TABLES.Conversations,
    formula
  );
  const first = records[0];
  if (!first) return null;
  return recordToConversation(first);
}

export async function createConversation(
  data: Partial<AirtableConversation>
): Promise<AirtableConversation> {
  if (!hasAirtable) throw new Error("Airtable not configured");
  const url = tableUrl(TABLES.Conversations);
  const fields: Record<string, unknown> = {
    LastMessagePreview: data.lastMessagePreview ?? "",
    Status: data.status ?? "new",
  };
  if (data.leadId) fields.Lead = [data.leadId];
  if (data.brokerageId) fields.Brokerage = [data.brokerageId];
  if (data.assignedAgentId) fields.AssignedAgent = [data.assignedAgentId];
  if (data.lastMessageAt) fields.LastMessageAt = data.lastMessageAt;
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable createConversation: 401 ${err}`);
    throw new Error(`Airtable createConversation: ${res.status} ${err}`);
  }
  const created = (await res.json()) as AirtableRecord<ConversationFields>;
  return recordToConversation(created);
}

export async function updateConversation(
  id: string,
  data: Partial<AirtableConversation>
): Promise<AirtableConversation> {
  if (!hasAirtable) throw new Error("Airtable not configured");
  const url = `${tableUrl(TABLES.Conversations)}/${id}`;
  const fields: Record<string, unknown> = {};
  if (data.assignedAgentId !== undefined) fields.AssignedAgent = data.assignedAgentId ? [data.assignedAgentId] : [];
  if (data.lastMessageAt !== undefined) fields.LastMessageAt = data.lastMessageAt;
  if (data.lastMessagePreview !== undefined) fields.LastMessagePreview = data.lastMessagePreview;
  if (data.status !== undefined) fields.Status = data.status;
  if (Object.keys(fields).length === 0) {
    const list = await listAllRecords<ConversationFields>(TABLES.Conversations);
    const found = list.find((rec) => rec.id === id);
    if (!found) throw new Error("Conversation not found");
    return recordToConversation(found);
  }
  const res = await fetch(url, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable updateConversation: 401 ${err}`);
    throw new Error(`Airtable updateConversation: ${res.status} ${err}`);
  }
  const updated = (await res.json()) as AirtableRecord<ConversationFields>;
  return recordToConversation(updated);
}

// ---------------------------------------------------------------------------
// Phone Lines
// ---------------------------------------------------------------------------

type PhoneLineFields = {
  LineID?: number;
  "Twilio Phone Number"?: string;
  "Friendly Name"?: string;
  "Line Type"?: string;
  "Assigned Agent"?: string[];
  Status?: string;
  Brokerage?: string[];
};

function recordToPhoneLine(r: AirtableRecord<PhoneLineFields>): AirtablePhoneLine {
  const f = r.fields ?? {};
  const lineType = (f["Line Type"] ?? "main").toString().toLowerCase() as "main" | "personal";
  const status = (f.Status ?? "active").toString().toLowerCase() as "active" | "paused";
  return {
    id: r.id,
    lineId: typeof f.LineID === "number" ? f.LineID : 0,
    brokerageId: Array.isArray(f.Brokerage) ? f.Brokerage[0] ?? "" : "",
    twilioPhoneNumber: (f["Twilio Phone Number"] ?? "").toString().trim(),
    friendlyName: (f["Friendly Name"] ?? "").toString().trim(),
    lineType: lineType === "personal" ? "personal" : "main",
    assignedAgentId: Array.isArray(f["Assigned Agent"]) ? f["Assigned Agent"][0] ?? null : null,
    status: status === "paused" ? "paused" : "active",
  };
}

export async function getPhoneLines(
  brokerageId: string
): Promise<AirtablePhoneLine[]> {
  if (!hasAirtable) return [];
  const escaped = brokerageId.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `FIND("${escaped}", ARRAYJOIN({Brokerage}))`;
  const records = await listAllRecords<PhoneLineFields>(
    TABLES.Phone_Lines,
    formula
  );
  return records.map(recordToPhoneLine);
}

export async function getPhoneLineByNumber(
  number: string
): Promise<AirtablePhoneLine | null> {
  if (!hasAirtable) return null;
  const normalized = normalizePhone(number);
  if (!normalized) return null;
  const escaped = `"+1${normalized}"`;
  const formula = `OR({Twilio Phone Number} = "${normalized}", {Twilio Phone Number} = ${escaped})`;
  const records = await listAllRecords<PhoneLineFields>(
    TABLES.Phone_Lines,
    formula
  );
  const first = records[0];
  if (!first) return null;
  return recordToPhoneLine(first);
}

// ---------------------------------------------------------------------------
// Users (Airtable Users table)
// ---------------------------------------------------------------------------

export type AirtableUser = { role: ValidRole; agentId?: string };

type UserFields = {
  Name?: string;
  demoMode?: boolean;
  role?: string;
  onboardingStatus?: string;
  onboardingStep?: number;
  OwnerEmail?: string[];
  Email?: string;
  Role?: string;
  Agent?: string[];
  PasswordHash?: string;
  Plan?: string;
};

const VALID_ROLES = ["owner", "broker", "agent"] as const;
export type ValidRole = (typeof VALID_ROLES)[number];

function parseRole(raw: string): ValidRole {
  const r = (raw ?? "").toString().toLowerCase();
  if (VALID_ROLES.includes(r as ValidRole)) return r as ValidRole;
  return "broker";
}

/** Users table: primary is Name; we look up by Email (or OwnerEmail link). */
export async function getAirtableUserByEmail(
  email: string
): Promise<AirtableUser | null> {
  const withHash = await getAirtableUserByEmailForAuth(email);
  if (!withHash) return null;
  return { role: withHash.role, agentId: withHash.agentId };
}

export async function getAirtableUserByEmailForAuth(
  email: string
): Promise<{
  role: ValidRole;
  agentId?: string;
  passwordHash?: string;
} | null> {
  const table = TABLES.Users;
  if (!table?.trim() || !hasAirtable) return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER(TRIM(IF(Email, Email, ""))) = "${escaped}"`;
  try {
    const records = await listAllRecords<UserFields>(table, formula);
    const first = records[0];
    if (!first?.fields) return null;
    const role = parseRole((first.fields.Role ?? first.fields.role ?? "").toString());
    const agentLink = Array.isArray(first.fields.Agent)
      ? first.fields.Agent[0]
      : undefined;
    const passwordHash =
      typeof first.fields.PasswordHash === "string" &&
      first.fields.PasswordHash.trim()
        ? first.fields.PasswordHash.trim()
        : undefined;
    return {
      role,
      agentId: agentLink ?? undefined,
      passwordHash,
    };
  } catch {
    return null;
  }
}

export async function createAirtableUser(
  email: string,
  role: string
): Promise<AirtableUser | null> {
  const table = TABLES.Users;
  if (!table?.trim() || !hasAirtable) return null;
  const trimmed = email.trim();
  if (!trimmed) return null;
  const url = tableUrl(table);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        fields: {
          Email: trimmed,
          Role: role,
        },
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const err = await res.text();
      if (res.status === 401) throw new AirtableAuthError(`Airtable Users create: 401 ${err}`);
      return null;
    }
    const created = (await res.json()) as AirtableRecord<UserFields>;
    const roleParsed = parseRole((created.fields?.Role ?? created.fields?.role ?? "").toString()) as ValidRole;
    return { role: roleParsed, agentId: undefined };
  } catch (e) {
    if (e instanceof AirtableAuthError) throw e;
    return null;
  }
}

export async function updateUserRole(
  email: string,
  role: ValidRole
): Promise<boolean> {
  const table = TABLES.Users;
  if (!table?.trim() || !hasAirtable) return false;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return false;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER(TRIM(IF(Email, Email, ""))) = "${escaped}"`;
  try {
    const records = await listAllRecords<UserFields>(table, formula);
    const recordId = records[0]?.id;
    if (!recordId) return false;
    const url = `${tableUrl(table)}/${recordId}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ fields: { Role: role } }),
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 401) throw new AirtableAuthError(`Airtable Users update: 401`);
      return false;
    }
    return true;
  } catch (e) {
    if (e instanceof AirtableAuthError) throw e;
    return false;
  }
}

export async function getAirtableUserPlan(email: string): Promise<string | null> {
  const table = TABLES.Users;
  if (!table?.trim() || !hasAirtable) return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER(TRIM(IF(Email, Email, ""))) = "${escaped}"`;
  try {
    const records = await listAllRecords<UserFields>(table, formula);
    const plan = records[0]?.fields?.Plan;
    if (typeof plan !== "string" || !plan.trim()) return null;
    const lower = plan.trim().toLowerCase();
    if (lower === "essentials" || lower === "pro" || lower === "free") return lower;
    return null;
  } catch {
    return null;
  }
}

export async function updateAirtableUserPlan(
  email: string,
  planId: string
): Promise<void> {
  const table = TABLES.Users;
  if (!table?.trim() || !hasAirtable) return;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER(TRIM(IF(Email, Email, ""))) = "${escaped}"`;
  try {
    const records = await listAllRecords<UserFields>(table, formula);
    const recordId = records[0]?.id;
    if (!recordId) return;
    const url = `${tableUrl(table)}/${recordId}`;
    await fetch(url, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ fields: { Plan: planId } }),
      cache: "no-store",
    });
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Waitlist
// ---------------------------------------------------------------------------

export async function createWaitlistEntry(
  email: string,
  name?: string,
  source?: string
): Promise<{ id: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) throw new Error("Email is required");
  if (!hasAirtable) {
    return { id: `waitlist-mock-${Date.now()}` };
  }
  const table = TABLES.Waitlist;
  const url = tableUrl(table);
  const fields: Record<string, string> = { Email: trimmed };
  if (name?.trim()) fields.Name = name.trim();
  if (source?.trim()) fields.Source = source.trim();
  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) {
      throw new AirtableAuthError(`Airtable Waitlist: 401 ${err}`);
    }
    throw new Error(`Airtable Waitlist: ${res.status} ${err}`);
  }
  const created = (await res.json()) as { id: string };
  return { id: created.id };
}

// ---------------------------------------------------------------------------
// Activity (derived from leads + messages for dashboard)
// ---------------------------------------------------------------------------

export async function getRecentActivities(
  limit = 20,
  assignedToAgentId?: string
): Promise<ActivityItem[]> {
  if (!hasAirtable) return [];
  const [leads, messages, agents] = await Promise.all([
    getLeads(assignedToAgentId),
    getMessages(),
    getAgents(),
  ]);
  const leadById = new Map(leads.map((l) => [l.id, l.name]));
  const agentById = new Map(agents.map((a) => [a.id, a.fullName]));

  const activities: ActivityItem[] = [];

  for (const lead of leads) {
    activities.push({
      id: `activity-lead-${lead.id}`,
      type: "lead_created",
      title: "Lead added",
      description: lead.source ?? undefined,
      leadId: lead.id,
      leadName: lead.name,
      agentName: lead.assignedToName ?? (lead.assignedTo ? agentById.get(lead.assignedTo) : undefined),
      createdAt: lead.createdAt ?? new Date().toISOString(),
    });
  }

  for (const msg of messages) {
    const leadName = msg.leadId ? leadById.get(msg.leadId) : undefined;
    activities.push({
      id: `activity-msg-${msg.id}`,
      type: msg.direction === "out" ? "message_sent" : "message_received",
      title: msg.direction === "out" ? "Message sent" : "Message received",
      description: msg.body.slice(0, 100) + (msg.body.length > 100 ? "…" : ""),
      leadId: msg.leadId,
      leadName: leadName ?? undefined,
      createdAt: msg.createdAt,
    });
  }

  activities.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return activities.slice(0, limit);
}
