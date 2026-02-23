"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { User, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PlanViewSelector } from "./PlanViewSelector";
import type { Role } from "@/lib/types";

const VIEW_AS_COOKIE = "lh_view_as";
const VIEW_AS_STORAGE = "viewAsRole";
const ROLES: Role[] = ["owner", "broker", "agent"];

function viewAsLabel(r: Role) {
  return r === "owner" ? "Owner" : r === "broker" ? "Broker" : "Agent";
}

interface AccountMenuProps {
  name: string;
  role: Role;
  effectiveRole: Role;
  platformRole?: "super_admin" | null;
  demoEnabled?: boolean;
  className?: string;
}

function getRoleLabel(
  effectiveRole: Role,
  platformRole?: "super_admin" | null
): string {
  if (platformRole === "super_admin") return "Platform Admin";
  if (effectiveRole === "owner" || effectiveRole === "broker") return "Broker Owner";
  return "Agent";
}

export function AccountMenu({
  name,
  role,
  effectiveRole,
  platformRole = null,
  demoEnabled = false,
  className,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { signOut } = useClerk();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await signOut({ redirectUrl: "/login" });
  }

  function handleViewAs(r: Role) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(VIEW_AS_STORAGE, r);
      const cookie = `${VIEW_AS_COOKIE}=${r}; path=/; max-age=86400`;
      queueMicrotask(() => {
        if (typeof document !== "undefined") document.cookie = cookie;
      });
    }
    toast.success(`Switched to ${viewAsLabel(r)} view`);
    setOpen(false);
    requestAnimationFrame(() => router.refresh());
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  const roleLabel = getRoleLabel(effectiveRole, platformRole);
  const showViewAs = platformRole === "super_admin" && role === "owner";

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold font-sans flex-shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <p className="text-sm font-medium text-[#111111] truncate font-sans leading-tight">
            {name}
          </p>
          <p className="text-[11px] text-[#a0a0a0] font-sans leading-tight">
            {roleLabel}
            {demoEnabled && " (Demo)"}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-400 transition-transform hidden sm:block flex-shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-[#e2e2e2] bg-white shadow-lg z-50 py-1 animate-in fade-in-0 slide-in-from-top-2 duration-150"
        >
          {showViewAs && (
            <>
              <div className="px-4 py-2">
                <p className="text-xs font-normal text-[#a0a0a0] font-sans">
                  View as
                </p>
              </div>
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="menuitem"
                  onClick={() => handleViewAs(r)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm text-[#111111] hover:bg-slate-50 font-sans transition-colors min-h-[44px] md:min-h-[36px]"
                >
                  {viewAsLabel(r)}
                  {effectiveRole === r && (
                    <span className="text-xs text-[#111111]">✓</span>
                  )}
                </button>
              ))}
              <div className="px-4 py-2">
                <p className="text-xs font-normal text-[#a0a0a0] font-sans mb-1.5">
                  View as plan
                </p>
                <div onClick={(e) => e.stopPropagation()}>
                  <PlanViewSelector />
                </div>
              </div>
              <div className="my-1 border-t border-slate-100" />
            </>
          )}
          <Link
            href="/app/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#111111] hover:bg-slate-50 font-sans transition-colors min-h-[44px] md:min-h-[36px]"
          >
            <User className="h-4 w-4 text-[#a0a0a0]" />
            Profile
          </Link>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-slate-50 font-sans transition-colors min-h-[44px] md:min-h-[36px]"
          >
            <LogOut className="h-4 w-4 text-[#a0a0a0]" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
