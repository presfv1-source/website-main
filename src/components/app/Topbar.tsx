"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Search, LogOut, User, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { DemoToggle } from "./DemoToggle";
import { MobileNav } from "./MobileNav";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const VIEW_AS_COOKIE = "lh_view_as";
const VIEW_AS_STORAGE = "viewAsRole";
const ROLES: Role[] = ["owner", "broker", "agent"];
function viewAsLabel(r: Role) {
  return r === "owner" ? "Owner" : r === "broker" ? "Broker" : "Agent";
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
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await signOut({ redirectUrl: "/login" });
  }

  function handleViewAs(role: Role) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(VIEW_AS_STORAGE, role);
      document.cookie = `${VIEW_AS_COOKIE}=${role}; path=/; max-age=86400`;
    }
    toast.success(`Switched to ${viewAsLabel(role)} view`);
    requestAnimationFrame(() => router.refresh());
  }

  const effectiveRole = session?.effectiveRole ?? session?.role;
  const realRole = session?.role;
  const roleLabel =
    effectiveRole === "owner" ? "Owner" : effectiveRole === "broker" ? "Broker" : "Agent";
  const displayName = !demoEnabled ? roleLabel : (session?.name ?? "User");
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <header
      className={cn(
        "flex h-14 items-center gap-4 border-b bg-background px-4 shrink-0",
        className
      )}
    >
      <MobileNav
        role={effectiveRole ?? "agent"}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        demoEnabled={demoEnabled}
        isOwner={isOwner}
      />
      <div className="flex-1 flex items-center gap-4">
        <div className="hidden sm:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-9 bg-muted/50"
              readOnly
            />
          </div>
        </div>
        {isOwner && (
          <DemoToggle
            demoEnabled={demoEnabled}
            onToggle={onDemoToggle}
            disabled={false}
            className="hidden sm:flex"
          />
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-11 w-11 min-h-[44px] min-w-[44px] rounded-full md:h-9 md:w-9 md:min-h-0 md:min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{displayName}</span>
              <span className="text-xs font-normal text-muted-foreground">
                Viewing as {roleLabel}
                {demoEnabled && <span className="ml-0.5">(Demo)</span>}
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
                  <Building2 className="mr-2 h-4 w-4" />
                  {viewAsLabel(r)}
                  {effectiveRole === r && (
                    <span className="ml-auto text-xs text-primary">✓</span>
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
          <DropdownMenuItem onClick={handleLogout} className="max-md:min-h-[44px]">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
