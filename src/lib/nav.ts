import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  UserCog,
  Settings,
  CreditCard,
  Route,
  User,
} from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles: Role[];
  tooltip?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner", "agent"], tooltip: "View dashboard" },
    ],
  },
  {
    label: "Leads & Inbox",
    items: [
      { href: "/app/leads", label: "Leads", icon: Users, roles: ["owner", "agent"], tooltip: "View leads" },
      { href: "/app/messages", label: "Messages", icon: MessageSquare, roles: ["owner", "agent"], tooltip: "Inbox" },
    ],
  },
  {
    label: "Routing & Settings",
    items: [
      { href: "/app/agents", label: "Agents", icon: UserCog, roles: ["owner"], tooltip: "Manage agents" },
      { href: "/app/routing", label: "Routing", icon: Route, roles: ["owner"], tooltip: "Routing setup" },
      { href: "/app/billing", label: "Billing", icon: CreditCard, roles: ["owner"], tooltip: "Billing" },
      { href: "/app/settings", label: "Settings", icon: Settings, roles: ["owner"], tooltip: "Settings" },
    ],
  },
  {
    label: "Me",
    items: [
      { href: "/app/account", label: "Account", icon: User, roles: ["owner", "agent"], tooltip: "Account" },
    ],
  },
];

export function getNavItemsForRole(role: Role): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}
