import type { Session } from "./auth";

/**
 * Platform super_admin = Preston only (DEV_ADMIN_EMAIL).
 * Stored in Clerk publicMetadata as platform_role: "super_admin".
 */
export function isSuperAdmin(session: Session | null): boolean {
  if (!session) return false;
  return session.platformRole === "super_admin";
}

/**
 * Broker-level owner: role is "owner" or "broker".
 * Highest customer-facing role.
 */
export function isBrokerOwner(session: Session | null): boolean {
  if (!session) return false;
  const effective = session.effectiveRole ?? session.role;
  return effective === "owner" || effective === "broker";
}

/** Can the user access billing / subscription management? */
export function canManageBilling(session: Session | null): boolean {
  return isBrokerOwner(session);
}

/** Can the user see internal platform tools (integrations, demo mode, system logs)? */
export function canSeeInternalTools(session: Session | null): boolean {
  return isSuperAdmin(session);
}

/** Is outbound sending allowed? */
export function canSendOutbound(
  subscriptionStatus: string | undefined,
  a2pReady: boolean
): { allowed: boolean; reason?: string } {
  const status = subscriptionStatus ?? "unknown";
  if (status === "canceled" || status === "inactive") {
    return { allowed: false, reason: "Subscription inactive. Reactivate to send messages." };
  }
  if (status === "past_due") {
    return { allowed: false, reason: "Payment past due. Update billing to resume sending." };
  }
  if (!a2pReady) {
    return { allowed: false, reason: "SMS campaign pending approval. Messages will be queued." };
  }
  return { allowed: true };
}

/** Guard: returns 401 Response or null. */
export function requireAuth(session: Session | null): Response | null {
  if (!session) {
    return Response.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }
  return null;
}

/** Guard: returns 403 Response or null. */
export function requireBrokerOwner(session: Session | null): Response | null {
  const authDeny = requireAuth(session);
  if (authDeny) return authDeny;
  if (!isBrokerOwner(session)) {
    return Response.json(
      { success: false, error: { code: "FORBIDDEN", message: "Broker owner access required" } },
      { status: 403 }
    );
  }
  return null;
}

/** Guard: returns 403 Response or null. */
export function requireSuperAdmin(session: Session | null): Response | null {
  const authDeny = requireAuth(session);
  if (authDeny) return authDeny;
  if (!isSuperAdmin(session)) {
    return Response.json(
      { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
      { status: 403 }
    );
  }
  return null;
}
