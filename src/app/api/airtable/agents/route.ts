import { NextRequest, NextResponse } from "next/server";
import { hasAirtable } from "@/lib/config";
import { getDemoAgentsAsAppType } from "@/lib/demoData";
import { getDemoEnabled, getSessionToken } from "@/lib/auth";
import { AirtableAuthError } from "@/lib/airtable";

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
