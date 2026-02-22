import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionToken } from "@/lib/auth";
import { requireBrokerOwner } from "@/lib/guards";

const DEMO_COOKIE = "lh_demo";

/**
 * POST /api/demo/reset — Clear demo mode cookie so demo state resets to default.
 * Owner/broker only. Used by Settings Danger Zone "Reset Demo Data".
 */
export async function POST() {
  const session = await getSessionToken();
  const deny = requireBrokerOwner(session);
  if (deny) return deny;
  const res = NextResponse.json({ success: true });
  res.cookies.set(DEMO_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
