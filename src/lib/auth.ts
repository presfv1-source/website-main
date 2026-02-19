import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { env } from "./env.mjs";
import type { Role } from "./types";
import {
  getAirtableUserByEmail,
  createAirtableUser,
  getAgentIdByEmail,
} from "./airtable";

export interface Session {
  userId: string;
  role: Role;
  effectiveRole: Role;
  name?: string;
  email?: string;
  isDemo: boolean;
  agentId?: string;
}

const VIEW_AS_COOKIE = "lh_view_as";
const VALID_VIEW_AS = ["owner", "broker", "agent"] as const;
const OVERRIDE_COOKIE = "lh_session_override";

type ValidRole = "owner" | "broker" | "agent";

function toRole(raw: unknown): Role {
  if (raw === "owner" || raw === "broker" || raw === "agent") return raw;
  // Map marketing label "broker-owner" to app role "owner"
  if (raw === "broker-owner") return "owner";
  // Global fallback: undefined or invalid → broker
  return "broker";
}

async function syncRoleToClerk(userId: string, email: string): Promise<{
  role: ValidRole;
  agentId?: string;
}> {
  let role: ValidRole = "broker";
  let airtableUser = await getAirtableUserByEmail(email);
  const devAdmin = env.server.DEV_ADMIN_EMAIL?.trim().toLowerCase();
  if (!airtableUser) {
    role = email.toLowerCase() === devAdmin ? "owner" : "broker";
    airtableUser = await createAirtableUser(email, role);
    if (airtableUser) role = airtableUser.role;
  } else {
    role = airtableUser.role;
  }
  let agentId = airtableUser?.agentId;
  if (role === "agent" && !agentId) {
    agentId = (await getAgentIdByEmail(email)) ?? undefined;
  }
  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { role, ...(agentId != null && { agentId }) },
    });
  } catch (e) {
    console.error("[auth] Failed to sync role to Clerk:", e instanceof Error ? e.message : e);
  }
  return { role, agentId };
}

export async function getSession(): Promise<Session | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const email =
    user.primaryEmailAddress?.emailAddress?.trim() ??
    user.emailAddresses?.[0]?.emailAddress?.trim();
  const meta = user.publicMetadata as { role?: string; agentId?: string } | undefined;
  let role: Role = toRole(meta?.role);
  let agentId: string | undefined =
    typeof meta?.agentId === "string" ? meta.agentId : undefined;

  const hasValidRole =
    meta?.role === "owner" ||
    meta?.role === "broker" ||
    meta?.role === "agent" ||
    meta?.role === "broker-owner";
  if (!hasValidRole && email) {
    const synced = await syncRoleToClerk(userId, email);
    role = synced.role;
    agentId = synced.agentId;
  }

  const cookieStore = await cookies();
  const viewAsRaw = cookieStore.get(VIEW_AS_COOKIE)?.value?.toLowerCase();
  const effectiveRole: Role =
    role === "owner" && viewAsRaw && VALID_VIEW_AS.includes(viewAsRaw as Role)
      ? (viewAsRaw as Role)
      : role;

  let name: string | undefined;
  const override = cookieStore.get(OVERRIDE_COOKIE)?.value;
  if (override?.trim()) {
    try {
      const parsed = JSON.parse(override) as { name?: string };
      name = typeof parsed.name === "string" ? parsed.name.trim() : undefined;
    } catch {
      // ignore
    }
  }
  name =
    name ??
    ([user.firstName, user.lastName].filter(Boolean).join(" ")?.trim() ||
      (email ? email.split("@")[0] : undefined));

  const demoCookie = cookieStore.get("lh_demo")?.value;
  const isDemo =
    role === "owner" &&
    (demoCookie === "true" || (demoCookie !== "false" && env.server.DEMO_MODE_DEFAULT));

  return {
    userId,
    role,
    effectiveRole,
    name,
    email: email ?? undefined,
    isDemo,
    agentId,
  };
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
