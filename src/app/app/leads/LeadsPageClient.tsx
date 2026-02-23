"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { ResponsiveDataList } from "@/components/app/ResponsiveDataList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/app/PageHeader";
import { LeadStatusPill } from "@/components/app/LeadStatusPill";
import { StatusBadge } from "@/components/app/Badge";
import { LeadDetailPanel } from "./LeadDetailPanel";
import { useUser } from "@/hooks/useUser";
import { Search, MoreHorizontal, Download, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Lead, Agent } from "@/lib/types";
import { cn } from "@/lib/utils";

const SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "zillow", label: "Zillow" },
  { value: "realtor", label: "Realtor.com" },
  { value: "direct", label: "Direct" },
  { value: "other", label: "Other" },
];

function qualificationColor(score: number): string {
  if (score <= 40) return "bg-red-100 text-red-800";
  if (score <= 70) return "bg-orange-100 text-orange-800";
  return "bg-green-100 text-green-800";
}

/** Demo fallback: derive a stable pseudo score from lead id when qualificationScore not set. */
function fallbackQualificationScore(leadId: string): number {
  let h = 0;
  for (let i = 0; i < leadId.length; i++) h = (h << 5) - h + leadId.charCodeAt(i);
  return Math.abs(h) % 101;
}

interface LeadsPageClientProps {
  leads: Lead[];
  agents: Agent[];
  airtableError: boolean;
  demoEnabled?: boolean;
}

export function LeadsPageClient({ leads: initialLeads, agents, airtableError, demoEnabled = false }: LeadsPageClientProps) {
  const router = useRouter();
  const { isOwner } = useUser();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [newLeadSubmitting, setNewLeadSubmitting] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "website",
    assignedTo: "",
  });

  const filteredLeads = useMemo(() => {
    let list = initialLeads;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.phone ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter((l) => l.status === statusFilter);
    if (sourceFilter !== "all" && sourceFilter !== "__har_com__" && sourceFilter !== "__zillow__") list = list.filter((l) => (l.source ?? "") === sourceFilter);
    if (agentFilter !== "all") list = list.filter((l) => l.assignedTo === agentFilter);
    return list;
  }, [initialLeads, search, statusFilter, sourceFilter, agentFilter]);

  const columns: ColumnDef<Lead>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedLeadId(row.original.id); }}
            className="font-semibold text-[#111111] hover:underline text-left font-sans"
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-[#6a6a6a] font-sans">{row.original.phone ?? "—"}</span>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => (
          <StatusBadge variant="contacted">{row.original.source ?? "—"}</StatusBadge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <LeadStatusPill status={row.original.status} />,
      },
      {
        id: "qualification",
        header: "Score",
        cell: ({ row }) => {
          const score = row.original.qualificationScore ?? fallbackQualificationScore(row.original.id);
          return (
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium font-sans",
                qualificationColor(score)
              )}
            >
              {score}
            </span>
          );
        },
      },
      ...(isOwner
        ? [
            {
              accessorKey: "assignedToName",
              header: "Assigned Agent",
              cell: ({ row }: { row: Row<Lead> }) => (
                <span className="font-sans text-[#6a6a6a]">
                  {row.original.assignedToName ?? "—"}
                </span>
              ),
            } as ColumnDef<Lead>,
          ]
        : []),
      {
        id: "firstReply",
        header: "First Reply",
        cell: () => <span className="text-[#a0a0a0] font-sans text-sm">—</span>,
      },
      {
        id: "lastActivity",
        header: "Last Activity",
        cell: ({ row }) => {
          const t = row.original.updatedAt ?? row.original.createdAt;
          if (!t) return "—";
          const d = new Date(t);
          const now = Date.now();
          const diff = now - d.getTime();
          if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
          if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
          return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedLeadId(row.original.id)}>
                View
              </DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuItem>Reassign</DropdownMenuItem>
                  <DropdownMenuItem>Change Status</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [isOwner]
  );

  const selectedLead = selectedLeadId ? initialLeads.find((l) => l.id === selectedLeadId) : null;

  const sinceRef = useRef<string>(new Date().toISOString());
  const prevNewCountRef = useRef(0);
  useEffect(() => {
    if (demoEnabled || !isOwner) return;
    const interval = setInterval(() => {
      fetch(`/api/leads?since=${encodeURIComponent(sinceRef.current)}`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => {
          if (!data.success || !Array.isArray(data.data)) return;
          const count = (data.data as Lead[]).length;
          if (count > prevNewCountRef.current) {
            const n = count - prevNewCountRef.current;
            toast.info(`${n} new lead${n > 1 ? "s" : ""} arrived`);
          }
          prevNewCountRef.current = count;
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [demoEnabled, isOwner]);

  function exportCsv() {
    const headers = ["Name", "Phone", "Email", "Source", "Status", "Assigned Agent", "Created"];
    const rows = filteredLeads.map((l) => [
      l.name ?? "",
      l.phone ?? "",
      l.email ?? "",
      l.source ?? "",
      l.status ?? "",
      l.assignedToName ?? "",
      l.createdAt ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  }

  async function handleNewLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = newLeadForm.name.trim();
    if (!name) {
      toast.error("Name is required");
      return;
    }
    setNewLeadSubmitting(true);
    try {
      if (demoEnabled) {
        toast.info("Demo: lead not saved.");
        setNewLeadOpen(false);
        setNewLeadForm({ name: "", email: "", phone: "", source: "website", assignedTo: "" });
        return;
      }
      const res = await fetch("/api/airtable/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email: newLeadForm.email.trim() || undefined,
          phone: newLeadForm.phone.trim() || undefined,
          source: newLeadForm.source || "website",
          assignedTo: newLeadForm.assignedTo || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Failed to create lead");
        return;
      }
      toast.success("Lead created");
      setNewLeadOpen(false);
      setNewLeadForm({ name: "", email: "", phone: "", source: "website", assignedTo: "" });
      router.refresh();
    } catch {
      toast.error("Failed to create lead");
    } finally {
      setNewLeadSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        subtitle={`${filteredLeads.length} leads`}
        right={
          isOwner ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportCsv} className="font-sans gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => setNewLeadOpen(true)}
                className="bg-[#111111] hover:opacity-90 font-sans gap-2"
              >
                <Plus className="h-4 w-4" />
                New Lead
              </Button>
            </div>
          ) : null
        }
      />

      {airtableError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 font-sans">
          Check Airtable connection in Settings.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a0a0a0]" />
          <Input
            placeholder="Search name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-[#e2e2e2] font-sans"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] font-sans">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="appointment">Appointment</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[140px] font-sans">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Array.from(new Set(initialLeads.map((l) => l.source).filter(Boolean))).map((s) => (
              <SelectItem key={s!} value={s!}>
                {s}
              </SelectItem>
            ))}
            <SelectItem value="__har_com__" disabled className="opacity-80">
              <span className="flex items-center gap-2">
                HAR.com
                <span className="rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[10px] font-medium text-[#6a6a6a]">
                  Coming soon
                </span>
              </span>
            </SelectItem>
            <SelectItem value="__zillow__" disabled className="opacity-80">
              <span className="flex items-center gap-2">
                Zillow
                <span className="rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[10px] font-medium text-[#6a6a6a]">
                  Coming soon
                </span>
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        {isOwner && (
          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="w-[140px] font-sans">
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px] font-sans">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e2e2] overflow-hidden">
        <ResponsiveDataList<Lead>
          columns={columns}
          data={filteredLeads}
          onRowClick={(row) => setSelectedLeadId(row.original.id)}
          emptyMessage="No leads match your filters."
          mobileCard={(row) => {
            const l = row.original;
            const score = l.qualificationScore ?? fallbackQualificationScore(l.id);
            return (
              <div className="rounded-lg border border-[#e2e2e2] bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="font-semibold text-[#111111] hover:underline text-left font-sans"
                    onClick={(e) => { e.stopPropagation(); setSelectedLeadId(l.id); }}
                  >
                    {l.name}
                  </button>
                  <LeadStatusPill status={l.status} />
                </div>
                <p className="text-sm text-[#6a6a6a] font-sans mt-1">{l.phone ?? "—"}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <StatusBadge variant="contacted">{l.source ?? "—"}</StatusBadge>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium font-sans",
                      qualificationColor(score)
                    )}
                  >
                    Score {score}
                  </span>
                  {isOwner && l.assignedToName && (
                    <span className="text-xs text-[#a0a0a0] font-sans">{l.assignedToName}</span>
                  )}
                </div>
                <p className="text-xs text-[#a0a0a0] font-sans mt-2">
                  {l.updatedAt ?? l.createdAt
                    ? (() => {
                        const t = l.updatedAt ?? l.createdAt!;
                        const d = new Date(t);
                        const now = Date.now();
                        const diff = now - d.getTime();
                        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
                        return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                      })()
                    : "—"}
                </p>
              </div>
            );
          }}
        />
      </div>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLeadId(null)}
          isOwner={isOwner}
        />
      )}

      <Dialog open={newLeadOpen} onOpenChange={setNewLeadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewLeadSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-lead-name">Name *</Label>
              <Input
                id="new-lead-name"
                value={newLeadForm.name}
                onChange={(e) => setNewLeadForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Lead name"
                className="font-sans"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-lead-email">Email</Label>
              <Input
                id="new-lead-email"
                type="email"
                value={newLeadForm.email}
                onChange={(e) => setNewLeadForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                className="font-sans"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-lead-phone">Phone</Label>
              <Input
                id="new-lead-phone"
                value={newLeadForm.phone}
                onChange={(e) => setNewLeadForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 234 567 8900"
                className="font-sans"
              />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={newLeadForm.source}
                onValueChange={(v) => setNewLeadForm((f) => ({ ...f, source: v }))}
              >
                <SelectTrigger className="font-sans">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned Agent</Label>
              <Select
                value={newLeadForm.assignedTo || "none"}
                onValueChange={(v) => setNewLeadForm((f) => ({ ...f, assignedTo: v === "none" ? "" : v }))}
              >
                <SelectTrigger className="font-sans">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewLeadOpen(false)}
                disabled={newLeadSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#111111] hover:opacity-90" disabled={newLeadSubmitting}>
                {newLeadSubmitting ? "Creating…" : "Create Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
