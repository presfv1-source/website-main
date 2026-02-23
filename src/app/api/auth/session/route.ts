import { NextResponse } from "next/server";
import { getSession, getDemoEnabled } from "@/lib/auth";
import { getAirtableUserPlan } from "@/lib/airtable";

const OVERRIDE_COOKIE = "lh_session_override";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "No session" } },
      { status: 401 }
    );
  }
  const [demoEnabled, plan] = await Promise.all([
    getDemoEnabled(session),
    session.email ? getAirtableUserPlan(session.email) : Promise.resolve(null),
  ]);
  return NextResponse.json({
    success: true,
    data: {
      name: session.name,
      role: session.role,
      effectiveRole: session.effectiveRole,
      userId: session.userId,
      demoEnabled,
      platformRole: session.platformRole,
      ...(plan != null && { plan }),
      ...(session.agentId != null && { agentId: session.agentId }),
      ...(session.email != null && { email: session.email }),
    },
  });
}

/** Update display name (stored in override cookie). */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
      { status: 401 }
    );
  }
  const body = (await request.json().catch(() => ({}))) as { name?: string };
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const res = NextResponse.json({ success: true });
  res.cookies.set(OVERRIDE_COOKIE, JSON.stringify({ name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
