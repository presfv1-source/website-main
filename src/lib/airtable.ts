import { unstable_cache } from "next/cache";
import { env } from "./env.mjs";
import { hasAirtable } from "./config";
import type { ActivityItem, Agent, Lead, Message } from "./types";

const BASE_URL = "https://api.airtable.com/v0";
const PAGE_SIZE = 100;

type AirtableRecord<T> = { id: string; fields: T; createdTime?: string };

function getHeaders(): HeadersInit {
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

export const getLeads = hasAirtable
  ? unstable_cache(getLeadsUncached, ["airtable-leads"], { revalidate: 60, tags: ["leads"] })
  : getLeadsUncached;

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
    console.error("[airtable] createLead failed:", res.status, err);
    throw new Error(`Airtable create lead: ${res.status} ${err}`);
  }
  const created = (await res.json()) as AirtableRecord<LeadFields>;
  return recordToLead(created);
}

// ---- Agents ----
// Expected fields: Name, Email, Phone, Active (checkbox).
type AgentFields = {
  Name?: string;
  Email?: string;
  Phone?: string;
  Active?: boolean;
};

function recordToAgent(r: AirtableRecord<AgentFields>): Agent {
  const f = r.fields ?? {};
  return {
    id: r.id,
    name: (f.Name ?? "").toString().trim() || "—",
    email: (f.Email ?? "").toString().trim(),
    phone: (f.Phone ?? "").toString().trim(),
    active: f.Active === true,
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
export async function getRecentActivities(limit = 20): Promise<ActivityItem[]> {
  if (!hasAirtable) return [];
  const [leads, messages, agents] = await Promise.all([
    getLeads(),
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
