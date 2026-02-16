"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types";

const BADGE_BY_TYPE: Record<
  ActivityItem["type"],
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  lead_created: { label: "New lead", variant: "default" },
  message_sent: { label: "Replied", variant: "default" },
  message_received: { label: "Message", variant: "secondary" },
  status_changed: { label: "Status", variant: "outline" },
  lead_assigned: { label: "Assigned", variant: "default" },
};

const DOT_CLASS_BY_TYPE: Record<ActivityItem["type"], string> = {
  lead_created: "bg-primary",
  message_sent: "bg-emerald-600",
  message_received: "bg-muted-foreground",
  status_changed: "bg-amber-500",
  lead_assigned: "bg-primary",
};

function getActionText(item: ActivityItem): string {
  const name = item.agentName ?? item.leadName ?? "Someone";
  if (item.type === "lead_created") return `New lead from ${item.leadName ?? "inbound"}`;
  if (item.type === "message_sent") return `Replied to ${item.leadName ?? "lead"}`;
  if (item.type === "message_received") return `Message from ${item.leadName ?? "lead"}`;
  if (item.type === "status_changed") return item.description ?? "Status updated";
  if (item.type === "lead_assigned") return `${item.leadName ?? "Lead"} assigned to ${item.agentName ?? "agent"}`;
  return item.title;
}

function getDetailsFull(item: ActivityItem): string {
  const parts: string[] = [];
  if (item.description) parts.push(item.description);
  if (item.leadName && !getActionText(item).includes(item.leadName)) parts.push(item.leadName);
  return parts.join(" — ");
}

function getDetailsTruncated(item: ActivityItem, maxLen = 100): string {
  const full = getDetailsFull(item);
  return full.length > maxLen ? full.slice(0, maxLen) + "…" : full;
}

interface RecentActivityProps {
  items: ActivityItem[];
  className?: string;
  emptyMessage?: string;
}

export function RecentActivity({
  items,
  className,
  emptyMessage = "No recent activity—add a lead!",
}: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4" role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        className="absolute left-4 top-0 bottom-0 w-px border-l border-border"
        aria-hidden
      />
      <ul className="relative space-y-4" aria-label="Recent activity">
        {items.map((item, i) => {
          const badge = BADGE_BY_TYPE[item.type];
          const dotClass = DOT_CLASS_BY_TYPE[item.type];
          const detailsShort = getDetailsTruncated(item);
          const detailsFull = getDetailsFull(item);
          const initials = (item.agentName ?? item.leadName ?? "?")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?";

          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="relative flex gap-4 pl-10"
            >
              <div
                className={cn(
                  "absolute left-0 top-1.5 h-2 w-2 rounded-full -translate-x-[3px] border-2 border-background",
                  dotClass
                )}
              />
              <Avatar className="h-8 w-8 shrink-0 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {item.leadId ? (
                    <Link
                      href={`/app/leads/${item.leadId}`}
                      className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    >
                      {item.leadName ?? "Lead"}
                    </Link>
                  ) : (
                    <span>{item.leadName ?? "Lead"}</span>
                  )}{" "}
                  <Badge variant={badge.variant} className="ml-1.5 text-xs">
                    {badge.label}
                  </Badge>
                </p>
                {detailsFull ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-full">
                        {detailsShort}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      {detailsFull}
                    </TooltipContent>
                  </Tooltip>
                ) : null}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
