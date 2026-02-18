import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { env } from "./env.mjs";
import type { Role } from "./types";

export interface Session {
  userId: string;
  role: Role;
  effectiveRole: Role;
  name?: string;
  email?: string;
  isDemo: boolean;
  agentId?: string;
}

const SESSION_COOKIE_NAME = "lh_session";
const VIEW_AS_COOKIE = "lh_view_as";
const VALID_VIEW_AS = ["owner", "broker", "agent"] as const;
const OVERRIDE_COOKIE = "lh_session_override";

function getSessionSecret(): string {
  return (
    env.server.AUTH_SECRET?.trim() ||
    env.server.NEXTAUTH_SECRET?.trim() ||
    env.server.SESSION_SECRET ||
    ""
  );
}

type SessionPayload = { email?: string; role?: string; uid?: string; agentId?: string };

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const secret = getSessionSecret();
  if (!token || secret.length < 16) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    const p = payload as SessionPayload;
    const role = (p.role === "owner" || p.role === "broker" || p.role === "agent" ? p.role : "broker") as Role;
    const viewAsRaw = cookieStore.get(VIEW_AS_COOKIE)?.value?.toLowerCase();
    const effectiveRole: Role =
      role === "owner" && viewAsRaw && VALID_VIEW_AS.includes(viewAsRaw as Role)
        ? (viewAsRaw as Role)
        : role;

    const override = cookieStore.get(OVERRIDE_COOKIE)?.value;
    let name: string | undefined;
    if (override?.trim()) {
      try {
        const parsed = JSON.parse(override) as { name?: string };
        name = typeof parsed.name === "string" ? parsed.name.trim() : undefined;
      } catch {
        // ignore
      }
    }
    name = name ?? (p.email ? p.email.split("@")[0] : undefined);

    const demoCookie = cookieStore.get("lh_demo")?.value;
    const isDemo =
      role === "owner" &&
      (demoCookie === "true" || (demoCookie !== "false" && env.server.DEMO_MODE_DEFAULT));

    return {
      userId: p.uid ?? "",
      role,
      effectiveRole,
      name,
      email: p.email,
      isDemo,
      agentId: p.agentId,
    };
  } catch {
    return null;
  }
}

export async function getDemoEnabled(session?: Session | null): Promise<boolean> {
  if (session?.role !== "owner") return false;
  const cookieStore = await cookies();
  const cookie = cookieStore.get("lh_demo")?.value;
  if (cookie === "true") return true;
  if (cookie === "false") return false;
  return env.server.DEMO_MODE_DEFAULT;
}

/** For API routes: same as getSession(). */
export async function getSessionToken(_request?: NextRequest): Promise<Session | null> {
  return getSession();
}
