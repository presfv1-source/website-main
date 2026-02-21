"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  GitBranch,
  UserCog,
  BarChart3,
  CreditCard,
  Settings,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const ownerNav = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/leads", label: "Leads", icon: Users },
  { href: "/app/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/app/routing", label: "Routing", icon: GitBranch },
  { href: "/app/agents", label: "Agents", icon: UserCog },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

const agentNav = [
  { href: "/app/leads", label: "My Leads", icon: Users },
  { href: "/app/inbox", label: "Inbox", icon: MessageSquare },
];

interface SidebarProps {
  role?: Role;
  className?: string;
}

export function Sidebar({ role: roleProp, className }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useClerk();
  const { role: roleFromHook } = useUser();
  const role = roleProp ?? roleFromHook;
  const isOwnerRole = role === "owner" || role === "broker";
  const nav = isOwnerRole ? ownerNav : agentNav;

  const firstName = user?.firstName ?? user?.username ?? "User";
  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((n) => String(n)[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <aside
      className={cn(
        "group fixed left-0 top-0 z-40 hidden h-full w-16 flex-col border-r border-sidebar-border/70 bg-sidebar/95 backdrop-blur-xl transition-all duration-200 ease-in-out hover:w-56 md:flex",
        className
      )}
    >
      <div className="shrink-0 border-b border-sidebar-border/60 p-4">
        <Link
          href={isOwnerRole ? "/app/dashboard" : "/app/leads"}
          className="flex min-h-[44px] items-center gap-3 rounded-xl px-2 py-2 text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/20 text-sm font-bold text-sidebar-primary-foreground ring-1 ring-sidebar-primary/40">
            LH
          </span>
          <span className="overflow-hidden whitespace-nowrap text-sm font-display font-semibold opacity-0 transition-opacity duration-150 delay-75 group-hover:opacity-100">
            LeadHandler
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4" aria-label="App navigation">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mx-2 flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-all duration-150",
                isActive
                  ? "border-violet-300/30 bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-violet-950/20"
                  : "text-sidebar-foreground/75 hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-150 delay-75 group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 border-t border-sidebar-border/60 p-2">
        <Link
          href="/app/account"
          className={cn(
            "mx-2 flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-all",
            pathname === "/app/account" || pathname.startsWith("/app/account/")
              ? "border-violet-300/30 bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/75 hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <UserCircle className="h-5 w-5 shrink-0" />
          <span className="overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-150 delay-75 group-hover:opacity-100">
            Account
          </span>
        </Link>
        <div className="mx-2 flex items-center gap-3 px-3 py-3 opacity-0 transition-opacity duration-150 delay-75 group-hover:opacity-100">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{firstName}</p>
            <p className="text-xs text-sidebar-foreground/65">{isOwnerRole ? "Owner" : "Agent"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/login" })}
          className="mx-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="opacity-0 transition-opacity duration-150 delay-75 group-hover:opacity-100">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export function SidebarNavContent({
  role,
  onLinkClick,
}: {
  role: Role;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const isOwner = role === "owner" || role === "broker";
  const nav = isOwner ? ownerNav : agentNav;
  return (
    <nav className="flex flex-col gap-1 py-4" aria-label="App navigation">
      {nav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "mx-2 flex min-h-[44px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <Link
        href="/app/account"
        onClick={onLinkClick}
        className={cn(
          "mx-2 mt-4 flex min-h-[44px] items-center gap-3 border-t border-sidebar-border px-4 pt-4 text-sm font-medium transition-colors",
          pathname === "/app/account"
            ? "text-sidebar-primary-foreground"
            : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
        )}
      >
        <UserCircle className="h-5 w-5 shrink-0" />
        <span>Account</span>
      </Link>
    </nav>
  );
}
