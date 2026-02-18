"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types";
import { TYPO } from "@/lib/ui";

const TYPE_META: Record<
  ActivityItem["type"],
  { emoji: string; label: string }
> = {
  lead_created: { emoji: "📥", label: "New lead" },
  message_sent: { emoji: "💬", label: "Replied" },
  message_received: { emoji: "💬", label: "Message" },
  status_changed: { emoji: "📅", label: "Status" },
  lead_assigned: { emoji: "📥", label: "Assigned" },
};

const demoData: ActivityItem[] = [
  {
    id: "demo-1",
    type: "lead_created",
    title: "Lead added",
    description: "Website",
    leadId: "8",
    leadName: "Sarah",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-2",
    type: "message_sent",
    title: "Message sent",
    description: "Wednesday at 2pm works",
    leadId: "3",
    leadName: "James R.",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-3",
    type: "status_changed",
    title: "Status updated",
    description: "Maria S. set to Appointment",
    leadId: "2",
    leadName: "Maria S.",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-4",
    type: "message_received",
    title: "Message received",
    description: "Hi, looking for home in Houston",
    leadId: "4",
    leadName: "Lisa C.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-5",
    type: "lead_created",
    title: "Lead added",
    description: "Zillow",
    leadId: "5",
    leadName: "Robert M.",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

function getActionText(item: ActivityItem): string {
  if (item.type === "lead_created") return `New lead from ${item.leadName ?? "inbound"}`;
  if (item.type === "message_sent") return `Replied to ${item.leadName ?? "lead"}`;
  if (item.type === "message_received") return `Message from ${item.leadName ?? "lead"}`;
  if (item.type === "status_changed") return item.description ?? "Status updated";
  if (item.type === "lead_assigned") return `${item.leadName ?? "Lead"} assigned to ${item.agentName ?? "agent"}`;
  return item.title;
}

interface RecentActivityProps {
  items?: ActivityItem[];
  className?: string;
  emptyMessage?: string;
}

export function RecentActivity({
  items,
  className,
  emptyMessage = "No recent activity—add a lead!",
}: RecentActivityProps) {
  const list = (items?.length ? items : demoData).slice(0, 20);

  if (list.length === 0) {
    return (
      <p className={cn(TYPO.muted, "py-6")} role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      <ul className="flex flex-col gap-3 min-w-0" aria-label="Recent activity">
        {list.map((item) => {
          const meta = TYPE_META[item.type];
          const actionText = getActionText(item);

          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border border-l-4 border-l-orange-600 bg-card shadow-sm px-4 py-3",
                "transition-all duration-200 ease-out",
                "hover:-translate-y-0.5 hover:shadow-md hover:border-orange-500"
              )}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/40 text-lg"
                aria-hidden
              >
                {meta.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn(TYPO.bodySmall, "font-semibold text-foreground")}>
                  {item.leadId ? (
                    <Link
                      href={`/app/leads/${item.leadId}`}
                      className="text-orange-600 dark:text-orange-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded py-2 -my-2 px-1 -mx-1 inline-flex items-center"
                    >
                      {item.leadName ?? "Lead"}
                    </Link>
                  ) : (
                    <span>{item.leadName ?? "Lead"}</span>
                  )}{" "}
                  <span className="ml-1.5 text-xs font-normal text-orange-600 dark:text-orange-500">
                    {meta.label}
                  </span>
                </p>
                <p className={cn(TYPO.bodySmall, "text-foreground mt-0.5 truncate")}>
                  {actionText}
                </p>
                <p className={cn(TYPO.mutedSmall, "mt-1 tabular-nums")}>
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
