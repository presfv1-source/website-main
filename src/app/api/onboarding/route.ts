// FIXED: Now checks Clerk publicMetadata.brokerageName as fallback
// so onboarding doesn't loop if the cookie gets cleared.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionToken } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";

const ONBOARDING_COOKIE = "lh_onboarding_done";

export async function GET() {
  const session = await getSessionToken();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 },
    );
  }

  // 1) Check cookie first (fast path)
  const cookieStore = await cookies();
  const cookieDone = cookieStore.get(ONBOARDING_COOKIE)?.value === "true";

  if (cookieDone) {
    return NextResponse.json({ success: true, data: { done: true } });
  }

  // 2) Cookie missing — check Clerk metadata as fallback
  //    If brokerageName exists the user already completed onboarding
  //    (cookie was lost / cleared / different device).
  try {
    const user = await currentUser();
    const meta = (user?.publicMetadata ?? {}) as Record<string, unknown>;
    if (typeof meta.brokerageName === "string" && meta.brokerageName.trim().length > 0) {
      // Re-set the cookie so future checks are fast
      const res = NextResponse.json({ success: true, data: { done: true } });
      res.cookies.set(ONBOARDING_COOKIE, "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
      return res;
    }
  } catch (e) {
    console.error("[onboarding] Clerk metadata check:", e);
  }

  // 3) Neither cookie nor metadata — onboarding not done
  return NextResponse.json({ success: true, data: { done: false } });
}

export async function POST(request: NextRequest) {
  const session = await getSessionToken(request);
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 },
    );
  }
  if (session.role === "agent") {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Agents do not complete onboarding" } },
      { status: 403 },
    );
  }
  const body = await request.json().catch(() => ({}));
  const step = body.step as number | undefined;
  const brokerage = body.brokerage as { name?: string; phone?: string; timezone?: string } | undefined;

  if (step === 1 && brokerage?.name) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(session.userId);
      const existing = (user.publicMetadata ?? {}) as Record<string, unknown>;
      await client.users.updateUser(session.userId, {
        publicMetadata: {
          ...existing,
          brokerageName: brokerage.name.trim(),
          brokeragePhone: (brokerage.phone ?? "").trim(),
          timezone: (brokerage.timezone ?? "America/Chicago").trim(),
        },
      });
    } catch (e) {
      console.error("[onboarding] Clerk update:", e);
    }
  }

  if (step === 4 || body.complete) {
    const res = NextResponse.json({ success: true, data: { done: true } });
    res.cookies.set(ONBOARDING_COOKIE, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ success: true, data: { step } });
}
