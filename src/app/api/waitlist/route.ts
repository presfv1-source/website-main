import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createWaitlistEntry, AirtableAuthError } from "@/lib/airtable";

const waitlistSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    const msg =
      parsed.error.issues?.map((e) => e.message).join("; ") || parsed.error.message || "Validation failed";
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: msg } },
      { status: 400 }
    );
  }

  try {
    await createWaitlistEntry(parsed.data.email, parsed.data.name, parsed.data.source);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AirtableAuthError) {
      return NextResponse.json(
        { success: false, error: { code: "SERVER_ERROR", message: "Service temporarily unavailable" } },
        { status: 500 }
      );
    }
    console.error("[waitlist] POST error:", e);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to join waitlist" } },
      { status: 500 }
    );
  }
}
