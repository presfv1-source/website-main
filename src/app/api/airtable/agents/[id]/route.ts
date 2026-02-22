import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { hasAirtable } from "@/lib/config";
import { getDemoEnabled, getSessionToken } from "@/lib/auth";
import { requireBrokerOwner } from "@/lib/guards";
import { AirtableAuthError, updateAgent } from "@/lib/airtable";
import type { Agent } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionToken(request);
    const deny = requireBrokerOwner(session);
    if (deny) return deny;
    const demo = await getDemoEnabled(session!);
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Agent id required" } },
        { status: 400 }
      );
    }
    const body = await request.json().catch(() => ({}));
    const updates: Partial<Pick<Agent, "name" | "email" | "phone" | "active">> = {};
    if (typeof body.name === "string") updates.name = body.name.trim();
    if (typeof body.email === "string") updates.email = body.email.trim();
    if (typeof body.phone === "string") updates.phone = body.phone.trim();
    if (typeof body.active === "boolean") updates.active = body.active;

    if (demo) {
      const data = { id, ...updates } as Agent;
      return NextResponse.json({ success: true, data });
    }

    if (!hasAirtable) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_CONFIGURED", message: "Airtable not configured" } },
        { status: 400 }
      );
    }
    const agent = await updateAgent(id, updates);
    revalidateTag("agents", "max");
    return NextResponse.json({ success: true, data: agent });
  } catch (err) {
    if (err instanceof AirtableAuthError) {
      return NextResponse.json(
        { success: false, error: { code: "AUTHENTICATION_REQUIRED", message: "Check Airtable connection in Settings." } },
        { status: 401 }
      );
    }
    console.error("[airtable/agents PATCH]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update agent" } },
      { status: 500 }
    );
  }
}
