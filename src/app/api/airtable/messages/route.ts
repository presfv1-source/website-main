import { NextRequest, NextResponse } from "next/server";
import { hasAirtable } from "@/lib/config";
import { getDemoMessagesAsAppType } from "@/lib/demoData";
import { getDemoEnabled, getSessionToken } from "@/lib/auth";
import { requireAuth } from "@/lib/guards";
import { AirtableAuthError } from "@/lib/airtable";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionToken(request);
    const deny = requireAuth(session);
    if (deny) return deny;
    const demo = await getDemoEnabled(session!);
    if (demo) {
      const { searchParams } = new URL(request.url);
      const leadId = searchParams.get("leadId") ?? undefined;
      const messages = getDemoMessagesAsAppType(leadId);
      return NextResponse.json({ success: true, data: messages });
    }
    if (!hasAirtable) {
      return NextResponse.json({ success: true, data: [] });
    }
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId") ?? undefined;
    const messages = await import("@/lib/airtable").then((m) => m.getMessages(leadId));
    return NextResponse.json({ success: true, data: messages });
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
    console.error("[airtable/messages GET]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch messages" }, data: [] },
      { status: 200 }
    );
  }
}
