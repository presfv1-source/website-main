import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const VALID_ROLES = ["owner", "broker", "agent", "broker-owner"] as const;
type RoleInput = (typeof VALID_ROLES)[number];

/** Normalize role for storage: broker-owner → owner */
function normalizeRole(role: RoleInput): "owner" | "broker" | "agent" {
  if (role === "broker-owner") return "owner";
  return role as "owner" | "broker" | "agent";
}

/**
 * POST /api/set-role — Set current user's role in Clerk publicMetadata.
 * Dev-only: only allowed when NODE_ENV === "development" (or with optional secret header).
 * Body: { role: "owner" | "broker" | "agent" | "broker-owner" }
 */
export async function POST(request: Request) {
  const isDev = process.env.NODE_ENV === "development";
  const secret = request.headers.get("x-set-role-secret");
  const allowed = isDev || secret === process.env.SET_ROLE_SECRET;
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Set-role not allowed" } },
      { status: 403 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not signed in" } },
      { status: 401 }
    );
  }

  let body: { role?: string };
  try {
    body = (await request.json().catch(() => ({}))) as { role?: string };
  } catch {
    body = {};
  }
  const raw = body?.role?.trim()?.toLowerCase();
  if (!raw || !VALID_ROLES.includes(raw as RoleInput)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: `role must be one of: ${VALID_ROLES.join(", ")}`,
        },
      },
      { status: 400 }
    );
  }

  const roleToStore = normalizeRole(raw as RoleInput);
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const existing = (user.publicMetadata ?? {}) as Record<string, unknown>;
    await client.users.updateUser(userId, {
      publicMetadata: { ...existing, role: roleToStore },
    });
    return NextResponse.json({
      success: true,
      data: { role: roleToStore, message: "Role updated. Reload the page to see changes." },
    });
  } catch (e) {
    console.error("[set-role]", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update role" } },
      { status: 500 }
    );
  }
}
