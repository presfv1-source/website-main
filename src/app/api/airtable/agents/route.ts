import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { hasAirtable } from "@/lib/config";
import { getDemoAgentsAsAppType } from "@/lib/demoData";
import { getDemoEnabled, getSessionToken } from "@/lib/auth";
import { requireBrokerOwner } from "@/lib/guards";
import { AirtableAuthError, createAgent } from "@/lib/airtable";
import type { Agent } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionToken(request);
    const demo = await getDemoEnabled(session);
    if (demo) {
      const agents = getDemoAgentsAsAppType();
      return NextResponse.json({ success: true, data: agents });
    }
    if (!hasAirtable) {
      return NextResponse.json({ success: true, data: [] });
    }
    const agents = await import("@/lib/airtable").then((m) => m.getAgents());
    return NextResponse.json({ success: true, data: agents });
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
    console.error("[airtable/agents GET]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch agents" }, data: [] },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionToken(request);
    const deny = requireBrokerOwner(session);
    if (deny) return deny;
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name and email are required." } },
        { status: 400 }
      );
    }

    const demo = await getDemoEnabled(session!);
    if (demo) {
      const synthetic: Agent = {
        id: `agent-demo-${Date.now()}`,
        name,
        email,
        phone: phone ?? "",
        active: true,
        metrics: { leadsAssigned: 0, qualifiedCount: 0, appointmentsSet: 0, closedCount: 0 },
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: synthetic });
    }

    if (!hasAirtable) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_CONFIGURED", message: "Airtable not configured." } },
        { status: 400 }
      );
    }
    const agent = await createAgent({ name, email, phone });
    if (!agent) {
      return NextResponse.json(
        { success: false, error: { code: "SERVER_ERROR", message: "Failed to create agent." } },
        { status: 500 }
      );
    }
    revalidateTag("agents", "max");
    return NextResponse.json({ success: true, data: agent });
  } catch (err) {
    if (err instanceof AirtableAuthError) {
      return NextResponse.json(
        { success: false, error: { code: "AUTHENTICATION_REQUIRED", message: "Check Airtable connection in Settings." } },
        { status: 502 }
      );
    }
    console.error("[airtable/agents POST]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create agent." } },
      { status: 500 }
    );
  }
}
