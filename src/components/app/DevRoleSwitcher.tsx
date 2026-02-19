"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Dev-only: buttons to set current user's role via /api/set-role.
 * Only rendered when NODE_ENV === "development" (inlined at build time).
 */
export function DevRoleSwitcher() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (process.env.NODE_ENV !== "development") return null;

  async function setRole(role: "owner" | "broker" | "agent") {
    setLoading(role);
    setMessage(null);
    try {
      const res = await fetch("/api/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { message?: string };
        error?: { message?: string };
      };
      if (res.ok && data.success) {
        setMessage(data.data?.message ?? "Role updated. Reload to see changes.");
        window.location.reload();
      } else {
        setMessage(data.error?.message ?? "Failed to set role");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
      <span className="text-xs font-medium text-muted-foreground">Dev: Set role</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!!loading}
        onClick={() => setRole("owner")}
      >
        {loading === "owner" ? "…" : "Set as Owner"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!!loading}
        onClick={() => setRole("broker")}
      >
        {loading === "broker" ? "…" : "Set as Broker"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!!loading}
        onClick={() => setRole("agent")}
      >
        {loading === "agent" ? "…" : "Set as Agent"}
      </Button>
      {message && <span className="text-xs text-muted-foreground">{message}</span>}
    </div>
  );
}
