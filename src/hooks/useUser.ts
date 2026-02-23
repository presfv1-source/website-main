"use client";

import { useState, useEffect } from "react";
import type { Role } from "@/lib/types";

/**
 * Minimal useUser hook — reads session data from /api/auth/session.
 * Returns role flags, plan, and agent info for filtering and permissions.
 */

interface UserData {
  role: Role;
  effectiveRole: Role;
  plan: string;
  name: string;
  email: string;
  agentId: string | null;
  isOwner: boolean;
  isAgent: boolean;
  isPro: boolean;
  isSuperAdmin: boolean;
  isLoaded: boolean;
}

const DEFAULT_USER: UserData = {
  role: "agent",
  effectiveRole: "agent",
  plan: "essential",
  name: "",
  email: "",
  agentId: null,
  isOwner: false,
  isAgent: true,
  isPro: false,
  isSuperAdmin: false,
  isLoaded: false,
};

function toRole(raw: unknown): Role {
  if (raw === "owner" || raw === "broker" || raw === "agent") return raw;
  return "agent";
}

export function useUser(): UserData {
  const [user, setUser] = useState<UserData>(DEFAULT_USER);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((json) => {
        if (json?.success && json?.data) {
          const data = json.data;
          const role = toRole(data.role);
          const effectiveRole = toRole(data.effectiveRole ?? data.role);
          const rawPlan = typeof data.plan === "string" ? data.plan : "essential";
          const plan = rawPlan === "essentials" ? "essential" : rawPlan;
          const platformRole = data.platformRole ?? null;
          setUser({
            role,
            effectiveRole,
            plan,
            name: data.name ?? "",
            email: data.email ?? "",
            agentId: data.agentId ?? null,
            isOwner: role === "owner" || role === "broker",
            isAgent: role === "agent",
            isPro: plan === "pro",
            isSuperAdmin: platformRole === "super_admin",
            isLoaded: true,
          });
        } else {
          setUser((prev) => ({ ...prev, isLoaded: true }));
        }
      })
      .catch(() => {
        setUser((prev) => ({ ...prev, isLoaded: true }));
      });
  }, []);

  return user;
}
