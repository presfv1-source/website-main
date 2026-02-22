import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasAirtable } from "@/lib/config";
import { getDemoLeadsAsAppType } from "@/lib/demoData";
import { getDemoMessages } from "@/lib/demo/data";
import { getDemoEnabled, getSessionToken } from "@/lib/auth";
import { requireAuth } from "@/lib/guards";
import { AirtableAuthError } from "@/lib/airtable";

const postSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "appointment", "closed", "lost"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionToken(request);
    const deny = requireAuth(session);
    if (deny) return deny;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const source = searchParams.get("source") ?? undefined;
    const agentIdParam = searchParams.get("agentId") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const since = searchParams.get("since") ?? undefined;

    const demo = await getDemoEnabled(session!);
    const requestedAgentId = session!.role === "agent" ? session!.agentId : agentIdParam;
    let leads: Awaited<ReturnType<typeof getDemoLeadsAsAppType>>;
    if (demo) {
      leads = getDemoLeadsAsAppType();
    } else if (!hasAirtable) {
      return NextResponse.json({ success: true, data: [] });
    } else {
      leads = await import("@/lib/airtable").then((m) => m.getLeads(requestedAgentId));
    }

    if (status && status !== "all") {
      leads = leads.filter((l) => l.status === status);
    }
    if (source && source !== "all") {
      leads = leads.filter((l) => (l.source ?? "").toLowerCase() === source.toLowerCase());
    }
    if (agentIdParam && agentIdParam !== "all") {
      leads = leads.filter((l) => l.assignedTo === agentIdParam);
    }
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      leads = leads.filter(
        (l) =>
          (l.name ?? "").toLowerCase().includes(q) ||
          (l.phone ?? "").includes(q) ||
          (l.email ?? "").toLowerCase().includes(q)
      );
    }
    if (since) {
      const sinceDate = new Date(since);
      if (!Number.isNaN(sinceDate.getTime())) {
        leads = leads.filter((l) => l.createdAt && new Date(l.createdAt) >= sinceDate);
      }
    }

    if (demo) {
      leads = leads.map((l) => ({
        ...l,
        unreadCount: getDemoMessages(l.id).filter((m) => m.direction === "in" && m.read === false).length,
      }));
    }

    return NextResponse.json({ success: true, data: leads });
  } catch (err) {
    if (err instanceof AirtableAuthError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "AUTHENTICATION_REQUIRED", message: "Check Airtable connection in Settings." },
          data: [],
        },
        { status: 200 }
      );
    }
    console.error("[airtable/leads GET]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch leads" }, data: [] },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  const parsed = postSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }
  try {
    const session = await getSessionToken(request);
    const deny = requireAuth(session);
    if (deny) return deny;
    const demo = await getDemoEnabled(session!);
    const body = parsed.data;
    const leadData = {
      name: body.name,
      email: body.email || "",
      phone: body.phone || "",
      source: body.source || "website",
      status: (body.status ?? "new") as
        | "new"
        | "contacted"
        | "qualified"
        | "appointment"
        | "closed"
        | "lost",
      assignedTo: body.assignedTo,
    };
    if (demo) {
      const leads = getDemoLeadsAsAppType();
      return NextResponse.json({ success: true, data: { created: true, lead: leads[0] } });
    }
    if (!hasAirtable) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_CONFIGURED",
            message: "Airtable not connected. Add AIRTABLE_API_KEY and AIRTABLE_BASE_ID.",
          },
        },
        { status: 503 }
      );
    }
    const lead = await import("@/lib/airtable").then((m) => m.createLead(leadData));
    return NextResponse.json({ success: true, data: { created: true, lead } });
  } catch (err) {
    console.error("[airtable/leads POST]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create lead" } },
      { status: 500 }
    );
  }
}
