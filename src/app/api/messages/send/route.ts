import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDemoEnabled, getSessionToken } from "@/lib/auth";
import { appendMessage } from "@/lib/demo/data";
import { sendMessage } from "@/lib/twilio";

const postSchema = z.object({
  to: z.string(),
  body: z.string().min(1),
  leadId: z.string().optional(),
});

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
    const { to, body, leadId } = parsed.data;
    if (demo && leadId) {
      appendMessage(leadId, body, "out");
      return NextResponse.json({
        success: true,
        data: { queued: true, provider: "demo" },
      });
    }
    const result = await sendMessage(to, body, leadId);
    return NextResponse.json({
      success: true,
      data: { queued: result.queued, provider: result.sid ? "twilio" : "stub", sid: result.sid },
    });
  } catch (err) {
    console.error("[messages/send POST]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to send message" } },
      { status: 500 }
    );
  }
}
