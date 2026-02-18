import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { env } from "@/lib/env.mjs";
import { getSessionToken } from "@/lib/auth";

const DEMO_COOKIE = "lh_demo";

const postSchema = z.object({ enabled: z.boolean() });

export async function GET(request: NextRequest) {
  const session = await getSessionToken(request);
  if (session?.role === "agent") {
    return NextResponse.json({ success: true, data: { enabled: false } });
  }
  const cookieStore = await cookies();
  const val = cookieStore.get(DEMO_COOKIE)?.value;
  const enabled = val === "true" ? true : val === "false" ? false : null;
  const defaultVal = env.server.DEMO_MODE_DEFAULT;
  return NextResponse.json({
    success: true,
    data: { enabled: enabled ?? defaultVal },
  });
}

export async function POST(request: NextRequest) {
  const parsed = postSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }
  const session = await getSessionToken(request);
  const effective = session?.role === "agent" ? false : parsed.data.enabled;
  const res = NextResponse.json({ success: true, data: { enabled: effective } });
  res.cookies.set(DEMO_COOKIE, effective ? "true" : "false", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}
