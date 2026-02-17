import { unstable_cache } from "next/cache";
import { env } from "./env.mjs";
import { hasAirtable } from "./config";
import type { ActivityItem, Agent, Lead, Message } from "./types";

const BASE_URL = "https://api.airtable.com/v0";
const PAGE_SIZE = 100;

/** Thrown when Airtable returns 401; callers can show "check Airtable connection" instead of crashing. */
export class AirtableAuthError extends Error {
  code = "AUTHENTICATION_REQUIRED" as const;
  constructor(message: string) {
    super(message);
    this.name = "AirtableAuthError";
  }
}

type AirtableRecord<T> = { id: string; fields: T; createdTime?: string };

let patLogged = false;

function getHeaders(): HeadersInit {
  const key = env.server.AIRTABLE_API_KEY?.trim();
  const baseId = env.server.AIRTABLE_BASE_ID?.trim();
  if (!key || !baseId) {
    throw new Error("Missing Airtable env vars: AIRTABLE_API_KEY and AIRTABLE_BASE_ID required");
  }
  if (!patLogged) {
    patLogged = true;
    console.log("[airtable] PAT:", key ? key.slice(0, 10) + "..." : "MISSING");
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

/** Fetch all records with pagination. */
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
    const data = (await res.json()) as { records: AirtableRecord<T>[]; offset?: string };
    all.push(...data.records);
    offset = data.offset;
  } while (offset);
  return all;
}

// ---- Leads ----
// Expected Airtable fields: Name, Email, Phone, Source, Status, Assigned To (link), Notes.
// createdTime on record; optional Last modified in fields.
type LeadFields = {
  Name?: string;
  Email?: string;
  Phone?: string;
  Source?: string;
  Status?: string;
  "Assigned To"?: string[];
  Notes?: string;
  "Assigned To Name"?: string;
  "Last modified"?: string;
};

function recordToLead(r: AirtableRecord<LeadFields>): Lead {
  const f = r.fields ?? {};
  const status = (f.Status ?? "new").toString().toLowerCase();
  const validStatus = ["new", "contacted", "qualified", "appointment", "closed", "lost"] as const;
  const leadStatus = validStatus.includes(status as (typeof validStatus)[number])
    ? (status as Lead["status"])
    : "new";
  const assignedTo = Array.isArray(f["Assigned To"]) ? f["Assigned To"][0] : undefined;
  return {
    id: r.id,
    name: (f.Name ?? "").toString().trim() || "—",
    email: (f.Email ?? "").toString().trim(),
    phone: (f.Phone ?? "").toString().trim(),
    status: leadStatus,
    source: (f.Source ?? "").toString().trim() || "—",
    assignedTo: assignedTo ?? undefined,
    assignedToName: (f["Assigned To Name"] ?? "").toString().trim() || undefined,
    notes: (f.Notes ?? "").toString().trim() || undefined,
    createdAt: r.createdTime ?? undefined,
    updatedAt: (f["Last modified"] ?? r.createdTime) ?? undefined,
  };
}

async function getLeadsUncached(): Promise<Lead[]> {
  if (!hasAirtable) return [];
  const table = env.server.AIRTABLE_TABLE_LEADS;
  const records = await listAllRecords<LeadFields>(table);
  const leads = records.map(recordToLead);
  const needsEnrichment = leads.some((l) => l.assignedTo && !l.assignedToName);
  if (needsEnrichment) {
    const agents = await getAgents();
    const agentMap = new Map(agents.map((a) => [a.id, a.name]));
    for (const lead of leads) {
      if (lead.assignedTo && !lead.assignedToName) {
        lead.assignedToName = agentMap.get(lead.assignedTo) ?? undefined;
      }
    }
  }
  return leads;
}

const getLeadsCachedAll = hasAirtable
  ? unstable_cache(getLeadsUncached, ["airtable-leads"], { revalidate: 60, tags: ["leads"] })
  : getLeadsUncached;

/** Get all leads, or only leads assigned to the given agent (Airtable Agent record id). */
export async function getLeads(assignedToAgentId?: string): Promise<Lead[]> {
  const all = await getLeadsCachedAll();
  if (assignedToAgentId) {
    return all.filter((l) => l.assignedTo === assignedToAgentId);
  }
  return all;
}

export async function createLead(
  lead: Omit<Lead, "id" | "createdAt" | "updatedAt">
): Promise<Lead> {
  if (!hasAirtable) {
    return {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  const table = env.server.AIRTABLE_TABLE_LEADS;
  const url = tableUrl(table);
  const fields: Record<string, unknown> = {
    Name: lead.name,
    Email: lead.email ?? "",
    Phone: lead.phone ?? "",
    Source: lead.source ?? "website",
    Status: lead.status,
  };
  if (lead.notes) fields.Notes = lead.notes;
  if (lead.assignedTo) fields["Assigned To"] = [lead.assignedTo];

  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) {
      console.error("[airtable] AUTHENTICATION_REQUIRED createLead", err);
      throw new AirtableAuthError(`Airtable create lead: 401 ${err}`);
    }
    console.error("[airtable] createLead failed:", res.status, err);
    throw new Error(`Airtable create lead: ${res.status} ${err}`);
  }
  const created = (await res.json()) as AirtableRecord<LeadFields>;
  return recordToLead(created);
}

// ---- Agents ----
// Expected fields: Name, Email, Phone, Active (checkbox), Round Robin Weight (1–10), Close Rate (0–100 optional).
type AgentFields = {
  Name?: string;
  Email?: string;
  Phone?: string;
  Active?: boolean;
  RoundRobinWeight?: number;
  CloseRate?: number;
};

function recordToAgent(r: AirtableRecord<AgentFields>): Agent {
  const f = r.fields ?? {};
  const w = f.RoundRobinWeight;
  const num = typeof w === "number" && !Number.isNaN(w) ? Math.min(10, Math.max(1, Math.round(w))) : undefined;
  const cr = f.CloseRate;
  const closeRate = typeof cr === "number" && !Number.isNaN(cr) ? Math.min(100, Math.max(0, Math.round(cr))) : undefined;
  return {
    id: r.id,
    name: (f.Name ?? "").toString().trim() || "—",
    email: (f.Email ?? "").toString().trim(),
    phone: (f.Phone ?? "").toString().trim(),
    active: f.Active === true,
    roundRobinWeight: num,
    closeRate,
    createdAt: r.createdTime ?? undefined,
  };
}

async function getAgentsUncached(): Promise<Agent[]> {
  if (!hasAirtable) return [];
  const table = env.server.AIRTABLE_TABLE_AGENTS;
  const records = await listAllRecords<AgentFields>(table);
  return records.map(recordToAgent);
}

export const getAgents = hasAirtable
  ? unstable_cache(getAgentsUncached, ["airtable-agents"], { revalidate: 60, tags: ["agents"] })
  : getAgentsUncached;

/** Update one agent's round-robin weight (1–10). Used by routing settings. */
export async function updateAgentRoundRobinWeight(agentId: string, weight: number): Promise<void> {
  const table = env.server.AIRTABLE_TABLE_AGENTS;
  if (!table || !hasAirtable) return;
  const n = Math.min(10, Math.max(1, Math.round(weight)));
  const url = `${tableUrl(table)}/${agentId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ fields: { RoundRobinWeight: n } }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new AirtableAuthError(`Airtable update agent: 401 ${err}`);
    throw new Error(`Airtable update agent weight: ${res.status} ${err}`);
  }
}

// ---- Users (optional: Email, Role owner/broker/agent, Agent link) ----
export type AirtableUser = { role: "owner" | "broker" | "agent"; agentId?: string };

type UserFields = {
  Email?: string;
  Role?: string;
  Agent?: string[];
  /** Optional bcrypt hash for Credentials login. Only read for server-side auth. */
  PasswordHash?: string;
  /** Optional: subscription plan from Stripe (free | essentials | pro). */
  Plan?: string;
};

const VALID_ROLES = ["owner", "broker", "agent"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

function parseRole(raw: string): ValidRole {
  const r = (raw ?? "").toString().toLowerCase();
  if (VALID_ROLES.includes(r as ValidRole)) return r as ValidRole;
  return "broker";
}

/** Look up user by email in optional Users table. Returns null if table not configured or user not found. Does not include PasswordHash. */
export async function getAirtableUserByEmail(email: string): Promise<AirtableUser | null> {
  const withHash = await getAirtableUserByEmailForAuth(email);
  if (!withHash) return null;
  return { role: withHash.role, agentId: withHash.agentId };
}

/** Look up user by email including PasswordHash. For server-side Credentials auth only; do not expose hash. */
export async function getAirtableUserByEmailForAuth(
  email: string
): Promise<{ role: ValidRole; agentId?: string; passwordHash?: string } | null> {
  const table = env.server.AIRTABLE_TABLE_USERS?.trim();
  if (!table || !hasAirtable) return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER({Email}) = "${escaped}"`;
  try {
    const records = await listAllRecords<UserFields>(table, formula);
    const first = records[0];
    if (!first?.fields) return null;
    const role = parseRole((first.fields.Role ?? "").toString());
    const agentLink = Array.isArray(first.fields.Agent) ? first.fields.Agent[0] : undefined;
    const passwordHash =
      typeof first.fields.PasswordHash === "string" && first.fields.PasswordHash.trim()
        ? first.fields.PasswordHash.trim()
        : undefined;
    return { role, agentId: agentLink ?? undefined, passwordHash };
  } catch {
    return null;
  }
}

/** Create a user in the optional Users table (e.g. for OAuth first sign-in). Returns created AirtableUser or null if table not configured / request failed. */
export async function createAirtableUser(
  email: string,
  role: ValidRole
): Promise<AirtableUser | null> {
  const table = env.server.AIRTABLE_TABLE_USERS?.trim();
  if (!table || !hasAirtable) return null;
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
      console.error("[airtable] createAirtableUser failed:", res.status, err);
      return null;
    }
    const created = (await res.json()) as AirtableRecord<UserFields>;
    const roleParsed = parseRole((created.fields?.Role ?? "").toString());
    return { role: roleParsed, agentId: undefined };
  } catch (e) {
    if (e instanceof AirtableAuthError) throw e;
    return null;
  }
}

/** Update a user's role in the Users table. Returns true if updated. */
export async function updateUserRole(email: string, role: ValidRole): Promise<boolean> {
  const table = env.server.AIRTABLE_TABLE_USERS?.trim();
  if (!table || !hasAirtable) return false;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return false;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER({Email}) = "${escaped}"`;
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

/** Resolve Airtable Agent record id by email (from Agents table). Used when Users table has no Agent link. */
export async function getAgentIdByEmail(email: string): Promise<string | null> {
  if (!hasAirtable) return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  const table = env.server.AIRTABLE_TABLE_AGENTS;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER({Email}) = "${escaped}"`;
  try {
    const records = await listAllRecords<AgentFields>(table, formula);
    return records[0]?.id ?? null;
  } catch {
    return null;
  }
}

/** Plan id stored in Airtable Users (optional Plan field). Returns null if no table/field or not set. */
export async function getAirtableUserPlan(email: string): Promise<string | null> {
  const table = env.server.AIRTABLE_TABLE_USERS?.trim();
  if (!table || !hasAirtable) return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER({Email}) = "${escaped}"`;
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

/** Update Plan field for user by email. No-op if Users table or record not found. */
export async function updateAirtableUserPlan(email: string, planId: string): Promise<void> {
  const table = env.server.AIRTABLE_TABLE_USERS?.trim();
  if (!table || !hasAirtable) return;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER({Email}) = "${escaped}"`;
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

// ---- Messages ----
// Expected fields: Body, Direction ("in" | "out" or "In" | "Out"), Lead (link to Leads).
// createdTime on record or field "Created".
type MessageFields = {
  Body?: string;
  Direction?: string;
  Lead?: string[];
  Created?: string;
};

function recordToMessage(r: AirtableRecord<MessageFields>, leadId?: string): Message {
  const f = r.fields ?? {};
  const dir = (f.Direction ?? "out").toString().toLowerCase();
  const direction = dir === "in" ? "in" : "out";
  const linkLead = Array.isArray(f.Lead) ? f.Lead[0] : undefined;
  return {
    id: r.id,
    direction: direction as "in" | "out",
    body: (f.Body ?? "").toString().trim(),
    createdAt: (f.Created ?? r.createdTime) ?? new Date().toISOString(),
    leadId: linkLead ?? leadId,
  };
}

export async function getMessages(leadId?: string): Promise<Message[]> {
  if (!hasAirtable) return [];
  const table = env.server.AIRTABLE_TABLE_MESSAGES;
  let records: AirtableRecord<MessageFields>[];
  if (leadId) {
    // Filter by linked Lead. Airtable: link field "Lead" — single link comparison.
    const escaped = leadId.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const formula = `{Lead} = "${escaped}"`;
    records = await listAllRecords<MessageFields>(table, formula);
  } else {
    records = await listAllRecords<MessageFields>(table);
  }
  const byCreated = (a: Message, b: Message) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  return records.map((r) => recordToMessage(r, leadId)).sort(byCreated);
}

// ---- Activity (derived from leads + messages) ----

/** Build ActivityItem[] from leads and messages for dashboard. No ActivityLog table required. */
export async function getRecentActivities(limit = 20, assignedToAgentId?: string): Promise<ActivityItem[]> {
  if (!hasAirtable) return [];
  const [leads, messages, agents] = await Promise.all([
    getLeads(assignedToAgentId),
    getMessages(),
    getAgents(),
  ]);
  const leadById = new Map(leads.map((l) => [l.id, l.name]));
  const agentById = new Map(agents.map((a) => [a.id, a.name]));

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
