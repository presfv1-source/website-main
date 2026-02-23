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
  BarChart3,
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
      { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner", "broker", "agent"], tooltip: "View dashboard" },
    ],
  },
  {
    label: "Leads & Inbox",
    items: [
      { href: "/app/leads", label: "Leads", icon: Users, roles: ["owner", "broker", "agent"], tooltip: "View leads" },
      { href: "/app/messages", label: "Messages", icon: MessageSquare, roles: ["owner", "broker", "agent"], tooltip: "Inbox" },
    ],
  },
  {
    label: "Routing",
    items: [
      { href: "/app/agents", label: "Agents", icon: UserCog, roles: ["owner", "broker"], tooltip: "Manage agents" },
      { href: "/app/routing", label: "Routing", icon: Route, roles: ["owner", "broker"], tooltip: "Routing setup" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/app/analytics", label: "Analytics", icon: BarChart3, roles: ["owner", "broker"], tooltip: "Analytics" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/app/billing", label: "Billing", icon: CreditCard, roles: ["owner", "broker"], tooltip: "Billing" },
      { href: "/app/settings", label: "Settings", icon: Settings, roles: ["owner", "broker"], tooltip: "Settings" },
    ],
  },
  {
    label: "Me",
    items: [
      { href: "/app/account", label: "Profile", icon: User, roles: ["owner", "broker", "agent"], tooltip: "Profile" },
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
