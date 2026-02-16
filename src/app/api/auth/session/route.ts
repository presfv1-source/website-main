import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { env } from "@/lib/env.mjs";
import { hasAirtable } from "@/lib/config";
import type { Role } from "@/lib/types";

const COOKIE_NAME = "lh_session";
const DEMO_COOKIE_NAME = "lh_demo";

const signPayload = (payload: Record<string, unknown>) =>
  new SignJWT(payload as import("jose").JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(env.server.SESSION_SECRET));

export async function getSessionToken(
  request: NextRequest
): Promise<{ userId: string; role: Role; name?: string; isDemo: boolean } | null> {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(
      cookie,
      new TextEncoder().encode(env.server.SESSION_SECRET)
    );
    return payload as unknown as {
      userId: string;
      role: Role;
      name?: string;
      isDemo: boolean;
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const session = await getSessionToken(request);
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "No session" } }, { status: 401 });
  }
  const demoEnabled = await getDemoEnabled(request);
  return NextResponse.json({
    success: true,
    data: { name: session.name, role: session.role, userId: session.userId, demoEnabled },
  });
}

export async function getDemoEnabled(request: NextRequest): Promise<boolean> {
  if (hasAirtable) return false;
  const cookie = request.cookies.get(DEMO_COOKIE_NAME)?.value;
  if (cookie === "true") return true;
  if (cookie === "false") return false;
  return env.server.DEMO_MODE_DEFAULT;
}

const demoLoginSchema = z.object({
  role: z.enum(["owner", "agent"]),
  name: z.string().optional(),
});

const brokerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

function getAllowedBrokerEmail(): string {
  const fromEnv = env.server.DEV_ADMIN_EMAIL?.trim();
  return fromEnv || "presfv1@gmail.com";
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.email != null && body.password != null) {
    const parsed = brokerLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid email or password" } },
        { status: 400 }
      );
    }
    const { email } = parsed.data;
    const allowedEmail = getAllowedBrokerEmail().toLowerCase();
    if (allowedEmail === "" || email.toLowerCase().trim() !== allowedEmail) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid email or password" } },
        { status: 401 }
      );
    }
    const userId = `broker-${Buffer.from(email).toString("base64url").slice(0, 24)}`;
    const token = await signPayload({
      userId,
      role: "owner",
      name: email.split("@")[0],
      isDemo: false,
    });
    const res = NextResponse.json({ success: true, data: { redirect: "/app/dashboard" } });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    res.cookies.set(DEMO_COOKIE_NAME, "false", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  }

  const parsed = demoLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }
  const { role, name } = parsed.data;
  const userId = `user-${Date.now()}-${role}`;
  const token = await signPayload({
    userId,
    role,
    name: name ?? (role === "owner" ? "Demo Broker" : "Demo Agent"),
    isDemo: true,
  });
  const res = NextResponse.json({ success: true, data: { redirect: "/app/dashboard" } });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  res.cookies.set(DEMO_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
