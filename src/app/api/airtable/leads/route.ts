import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasAirtable } from "@/lib/config";
import { getDemoLeadsAsAppType } from "@/lib/demoData";
import { getDemoEnabled, getSessionToken } from "@/lib/auth";
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
    const demo = await getDemoEnabled(session);
    if (demo) {
      const leads = getDemoLeadsAsAppType();
      return NextResponse.json({ success: true, data: leads });
    }
    if (!hasAirtable) {
      return NextResponse.json({ success: true, data: [] });
    }
    const agentId = session?.role === "agent" ? session?.agentId : undefined;
    const leads = await import("@/lib/airtable").then((m) => m.getLeads(agentId));
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
    const demo = await getDemoEnabled(session);
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
