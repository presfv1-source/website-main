import { NextRequest, NextResponse } from "next/server";
import { getDemoEnabled, getSessionToken } from "@/lib/auth";
import { requireAuth } from "@/lib/guards";
import { markLeadMessagesAsRead } from "@/lib/demo/data";

/** Mark all messages for this lead as read (when conversation is opened). Demo only; non-demo no-op. */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionToken(_request);
    const deny = requireAuth(session);
    if (deny) return deny;
    const demo = await getDemoEnabled(session!);
    const { id: leadId } = await params;
    if (demo && leadId) {
      markLeadMessagesAsRead(leadId);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[leads/[id]/messages/read PATCH]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to mark as read" } },
      { status: 500 }
    );
  }
}
