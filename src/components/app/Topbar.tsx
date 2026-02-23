"use client";

import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavContent } from "./Sidebar";
import { AccountMenu } from "./AccountMenu";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

interface TopbarProps {
  session: { name?: string; role: Role; effectiveRole?: Role } | null;
  demoEnabled: boolean;
  isOwner: boolean;
  isSuperAdmin?: boolean;
  onDemoToggle?: (enabled: boolean) => void;
  className?: string;
}

export function Topbar({
  session,
  demoEnabled,
  isOwner,
  isSuperAdmin: isSuperAdminProp = false,
  onDemoToggle,
  className,
}: TopbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const effectiveRole = session?.effectiveRole ?? session?.role ?? "agent";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[#e2e2e2] bg-white px-4 shrink-0",
          className
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 min-h-[44px] min-w-[44px] text-[#6a6a6a]"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 max-w-[calc(100vw-2rem)] bg-white border-[#e2e2e2] p-0"
            >
              <div className="p-4 border-b border-[#e2e2e2]">
                <span className="font-display font-semibold text-[#111111]">
                  LeadHandler
                </span>
              </div>
              <SidebarNavContent
                role={effectiveRole}
                onLinkClick={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-[#a0a0a0] hover:text-[#111111]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          {session && (
            <AccountMenu
              name={session.name ?? "User"}
              role={session.role}
              effectiveRole={effectiveRole}
              platformRole={isSuperAdminProp ? "super_admin" : null}
              demoEnabled={demoEnabled}
            />
          )}
        </div>
      </header>
    </>
  );
}
