import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getAdminAuth } from "@/lib/firebase-admin";
import { getAirtableUserByEmail, createAirtableUser, getAgentIdByEmail } from "@/lib/airtable";
import { getSession, getDemoEnabled } from "@/lib/auth";
import { env } from "@/lib/env.mjs";

const DEV_ADMIN_EMAIL = "presfv1@gmail.com";
const SESSION_COOKIE_NAME = "lh_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const OVERRIDE_COOKIE = "lh_session_override";
const VIEW_AS_COOKIE = "lh_view_as";
const DEMO_COOKIE = "lh_demo";

type ValidRole = "owner" | "broker" | "agent";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "No session" } },
      { status: 401 }
    );
  }
  const demoEnabled = await getDemoEnabled(session);
  return NextResponse.json({
    success: true,
    data: {
      name: session.name,
      role: session.role,
      effectiveRole: session.effectiveRole,
      userId: session.userId,
      demoEnabled,
      ...(session.agentId != null && { agentId: session.agentId }),
      ...(session.email != null && { email: session.email }),
    },
  });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  const opts = { path: "/" as const, maxAge: 0 };
  res.cookies.set(SESSION_COOKIE_NAME, "", opts);
  res.cookies.set(OVERRIDE_COOKIE, "", opts);
  res.cookies.set(VIEW_AS_COOKIE, "", opts);
  res.cookies.set(DEMO_COOKIE, "", opts);
  return res;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { idToken?: string; name?: string };
    const idToken = typeof body?.idToken === "string" ? body.idToken.trim() : null;
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;

    if (name != null && !idToken) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
          { status: 401 }
        );
      }
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

    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Missing idToken" }, { status: 400 });
    }

    const auth = getAdminAuth();
    if (!auth) {
      console.error("[firebase/session] Firebase Admin not configured");
      return NextResponse.json({ ok: false, error: "Server auth not configured" }, { status: 503 });
    }

    const decoded = await auth.verifyIdToken(idToken);
    const email = decoded.email?.trim();
    const uid = decoded.uid;
    if (!email) {
      return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });
    }

    let role: ValidRole = "broker";
    let airtableUser = await getAirtableUserByEmail(email);
    if (!airtableUser) {
      role = email.toLowerCase() === DEV_ADMIN_EMAIL ? "owner" : "broker";
      airtableUser = await createAirtableUser(email, role);
      if (airtableUser) role = airtableUser.role;
    } else {
      role = airtableUser.role;
    }

    let agentId = airtableUser?.agentId;
    if (role === "agent" && !agentId) {
      agentId = (await getAgentIdByEmail(email)) ?? undefined;
    }

    console.log("[firebase/session] verified email:", email, "role:", role, "cookie will be set");

    const secret = env.server.AUTH_SECRET?.trim() || env.server.NEXTAUTH_SECRET?.trim() || env.server.SESSION_SECRET;
    if (!secret || secret.length < 16) {
      console.error("[firebase/session] AUTH_SECRET (or NEXTAUTH_SECRET/SESSION_SECRET) required and at least 16 chars");
      return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 503 });
    }

    const jwt = await new SignJWT({ email, role, uid, agentId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(SESSION_MAX_AGE)
      .setIssuedAt()
      .sign(new TextEncoder().encode(secret));

    const isProduction = process.env.NODE_ENV === "production";
    const res = NextResponse.json({ ok: true, role });
    res.cookies.set(SESSION_COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (e) {
    console.error("[firebase/session] error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Invalid or expired token" }, { status: 401 });
  }
}
