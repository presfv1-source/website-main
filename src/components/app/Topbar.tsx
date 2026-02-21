"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Bell, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DemoToggle } from "./DemoToggle";
import { SidebarNavContent } from "./Sidebar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const VIEW_AS_COOKIE = "lh_view_as";
const VIEW_AS_STORAGE = "viewAsRole";
const ROLES: Role[] = ["owner", "broker", "agent"];
function viewAsLabel(r: Role) {
  return r === "owner" ? "Owner" : r === "broker" ? "Broker" : "Agent";
}

const PATH_TITLES: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/leads": "Leads",
  "/app/inbox": "Inbox",
  "/app/routing": "Lead Routing",
  "/app/agents": "Agents",
  "/app/analytics": "Analytics",
  "/app/billing": "Billing & Plan",
  "/app/settings": "Settings",
  "/app/account": "Account",
};

function getPageTitle(pathname: string): string {
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname];
  for (const [path, title] of Object.entries(PATH_TITLES)) {
    if (pathname.startsWith(path + "/")) return title;
  }
  return "App";
}

interface TopbarProps {
  session: { name?: string; role: Role; effectiveRole?: Role } | null;
  demoEnabled: boolean;
  isOwner: boolean;
  onDemoToggle?: (enabled: boolean) => void;
  className?: string;
}

export function Topbar({
  session,
  demoEnabled,
  isOwner,
  onDemoToggle,
  className,
}: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await signOut({ redirectUrl: "/login" });
  }

  function handleViewAs(role: Role) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(VIEW_AS_STORAGE, role);
      const cookie = `${VIEW_AS_COOKIE}=${role}; path=/; max-age=86400`;
      queueMicrotask(() => {
        if (typeof document !== "undefined") document.cookie = cookie;
      });
    }
    toast.success(`Switched to ${viewAsLabel(role)} view`);
    requestAnimationFrame(() => router.refresh());
  }

  const effectiveRole = session?.effectiveRole ?? session?.role ?? "agent";
  const realRole = session?.role;
  const roleLabel =
    effectiveRole === "owner" ? "Owner" : effectiveRole === "broker" ? "Broker" : "Agent";
  const displayName = session?.name ?? "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const pageTitle = getPageTitle(pathname);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-[64px] shrink-0 items-center gap-4 border-b border-white/40 bg-white/70 px-4 backdrop-blur-xl",
          className
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 min-h-[44px] min-w-[44px] text-muted-foreground"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 max-w-[calc(100vw-2rem)] border-sidebar-border bg-sidebar p-0"
            >
              <div className="border-b border-sidebar-border p-4">
                <span className="font-display font-semibold text-sidebar-foreground">
                  LeadHandler
                </span>
              </div>
              <SidebarNavContent
                role={effectiveRole}
                onLinkClick={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <h1 className="truncate bg-gradient-to-r from-violet-700 to-sky-500 bg-clip-text text-lg font-display font-semibold text-transparent">
            {pageTitle}
          </h1>
        </div>

        {isOwner && (
          <div className="hidden sm:flex items-center">
            <DemoToggle
              demoEnabled={demoEnabled}
              onToggle={onDemoToggle}
              disabled={false}
            />
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full min-h-[44px] min-w-[44px] md:h-9 md:w-9 md:min-h-0 md:min-w-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-violet-100 text-violet-700 font-sans">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col font-sans">
                  <span className="text-foreground">{displayName}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Viewing as {roleLabel}
                    {demoEnabled && " (Demo)"}
                  </span>
                </div>
              </DropdownMenuLabel>
              {realRole === "owner" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    View as
                  </DropdownMenuLabel>
                  {ROLES.map((r) => (
                    <DropdownMenuItem
                      key={r}
                      onClick={() => handleViewAs(r)}
                      className="max-md:min-h-[44px]"
                    >
                      {viewAsLabel(r)}
                      {effectiveRole === r && (
                        <span className="ml-auto text-xs text-blue-600">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="max-md:min-h-[44px]">
                <a href="/app/account" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Account
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="max-md:min-h-[44px] text-rose-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
