"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, RefreshCw, Send, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AirtableErrorFallback } from "@/components/app/AirtableErrorFallback";
import { EmptyState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/Badge";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/types";

interface Message {
  id: string;
  direction: "in" | "out";
  body: string;
  createdAt: string;
  leadId?: string;
  from?: string;
}

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  status?: LeadStatus;
  assignedTo?: string;
  assignedToName?: string;
  unreadCount?: number;
}

const INBOX_SOURCE_OPTIONS = ["All sources", "Website", "Realtor.com", "Referral", "Open house"] as const;
type InboxSourceFilter = (typeof INBOX_SOURCE_OPTIONS)[number];

function normalizeInboxSource(s: string | undefined): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function formatRelative(time: string): string {
  const d = new Date(time);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60 * 1000) return "Just now";
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function InboxPage() {
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "mine" | "unread" | "hot">("all");
  const [sourceFilter, setSourceFilter] = useState<InboxSourceFilter>("All sources");
  const [sessionAgentId, setSessionAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [demoEnabled, setDemoEnabled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.agentId != null) setSessionAgentId(data.data.agentId);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/demo/state", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/airtable/leads", { credentials: "include" }).then((r) => r.json()),
    ]).then(([demoRes, leadsRes]) => {
      if (demoRes.success && demoRes.data?.enabled) setDemoEnabled(true);
      if (leadsRes.success && leadsRes.data) {
        const l = leadsRes.data as Lead[];
        setLeads(l.slice(0, 50));
        if (l.length > 0) {
          const fromUrl = searchParams.get("leadId");
          const toSelect = fromUrl && l.some((x) => x.id === fromUrl) ? fromUrl : l[0].id;
          setSelectedLeadId(toSelect);
        }
        setLoadError(false);
      } else {
        setLoadError(true);
      }
      setLoading(false);
    }).catch(() => {
      setLoadError(true);
      setLoading(false);
    });
  }, [searchParams]);

  const q = searchQuery.trim().toLowerCase();
  const tabFiltered =
    filterTab === "all"
      ? leads
      : filterTab === "mine"
        ? leads.filter((l) => l.assignedTo === sessionAgentId)
        : filterTab === "unread"
          ? leads.filter((l) => (l.unreadCount ?? 0) > 0)
          : leads.filter((l) => l.status === "qualified" || l.status === "appointment");
  const sourceFiltered =
    sourceFilter === "All sources"
      ? tabFiltered
      : tabFiltered.filter((l) => normalizeInboxSource(l.source) === normalizeInboxSource(sourceFilter));
  const filteredLeads = q
    ? sourceFiltered.filter(
        (l) =>
          (l.name ?? "").toLowerCase().includes(q) ||
          (l.phone ?? "").replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
          (l.email ?? "").toLowerCase().includes(q)
      )
    : sourceFiltered;

  useEffect(() => {
    const fromUrl = searchParams.get("leadId");
    if (fromUrl && leads.some((l) => l.id === fromUrl)) setSelectedLeadId(fromUrl);
  }, [searchParams, leads]);

  const refetchMessages = useCallback(() => {
    if (!selectedLeadId) return;
    const params = new URLSearchParams({ leadId: selectedLeadId });
    fetch(`/api/airtable/messages?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) setMessages(data.data as Message[]);
        else setMessages([]);
      })
      .catch(() => setMessages([]));
  }, [selectedLeadId]);

  useEffect(() => {
    if (!selectedLeadId) return;
    refetchMessages();
    const interval = setInterval(refetchMessages, 30_000);
    return () => clearInterval(interval);
  }, [selectedLeadId, refetchMessages]);

  useEffect(() => {
    if (!selectedLeadId) return;
    fetch(`/api/leads/${selectedLeadId}/messages/read`, { method: "PATCH", credentials: "include" }).then(() => {
      setLeads((prev) =>
        prev.map((l) => (l.id === selectedLeadId ? { ...l, unreadCount: 0 } : l))
      );
    });
  }, [selectedLeadId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !selectedLeadId) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedLead?.phone ?? "",
          body: body.trim(),
          leadId: selectedLeadId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Message sent");
        setBody("");
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            direction: "out",
            body: body.trim(),
            createdAt: new Date().toISOString(),
            leadId: selectedLeadId,
          },
        ]);
      } else {
        toast.error(data.error?.message ?? "Failed to send");
      }
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] gap-4 min-w-0">
        <Skeleton className="w-full md:w-80 shrink-0 h-48 md:h-full rounded-2xl" />
        <Skeleton className="flex-1 min-h-64 md:min-h-0 rounded-2xl" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6 w-full">
        <AirtableErrorFallback showSettingsLink />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="space-y-6 w-full">
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Turn on Demo Mode or connect sources in Settings to see messages here."
          action={{ label: "Go to Settings", href: "/app/settings" }}
        />
      </div>
    );
  }

  const selectedLead = leads.find((l) => l.id === selectedLeadId);
  const agentName = selectedLead?.assignedToName ?? "Agent";

  return (
    <div className="space-y-4 flex flex-col min-h-0">
      <PageHeader title="Inbox" subtitle="SMS conversations with your leads" />
      <div className="flex flex-col md:flex-row flex-1 min-h-[400px] gap-0 md:gap-4 min-w-0 h-[calc(100vh-14rem)]">
      {/* Left: conversation list */}
      <Card className="w-full md:w-80 shrink-0 flex flex-col rounded-2xl border-[#e2e2e2] overflow-hidden">
        <CardHeader className="py-4 border-b border-[#e2e2e2]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a0a0a0]" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-[#fafafa] border-[#e2e2e2] font-sans"
            />
          </div>
          <div className="flex gap-1 mt-3">
            {(["all", "mine", "unread", "hot"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium font-sans capitalize",
                  filterTab === tab
                    ? "bg-[#111111] text-white"
                    : "text-[#6a6a6a] hover:bg-[#f5f5f5]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as InboxSourceFilter)}>
              <SelectTrigger className="w-full h-9 bg-[#fafafa] border-[#e2e2e2] font-sans text-sm">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {INBOX_SOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
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
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
          {filteredLeads.map((lead) => {
            const isActive = selectedLeadId === lead.id;
            const initials = lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <button
                key={lead.id}
                type="button"
                onClick={() => setSelectedLeadId(lead.id)}
                className={cn(
                  "w-full text-left px-4 py-3 min-h-[44px] flex items-center gap-3 border-b border-[#f0f0f0] last:border-0 transition-colors",
                  isActive ? "bg-[#f5f5f5] border-l-4 border-l-[#111111]" : "hover:bg-[#fafafa]"
                )}
              >
                <div className="h-10 w-10 rounded-full bg-[#e2e2e2] flex items-center justify-center text-sm font-medium text-[#6a6a6a] flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium truncate font-sans", isActive && "text-[#111111]")}>
                    {lead.name}
                  </p>
                  <p className="text-xs text-[#a0a0a0] truncate font-sans">Last message preview…</p>
                </div>
                {(lead.unreadCount ?? 0) > 0 && (
                  <span className="shrink-0 h-2.5 min-w-2.5 rounded-full bg-[#111111]" aria-label={`${lead.unreadCount} unread`} />
                )}
                <div className="shrink-0 text-xs text-[#a0a0a0] font-sans">
                  {formatRelative(new Date().toISOString())}
                </div>
                {lead.status && (
                  <StatusBadge
                    variant={
                      lead.status === "new"
                        ? "new"
                        : lead.status === "contacted"
                          ? "contacted"
                          : lead.status === "qualified"
                            ? "qualified"
                            : lead.status === "appointment"
                              ? "appointment"
                              : lead.status === "closed"
                                ? "closed"
                                : lead.status === "lost"
                                  ? "lost"
                                  : "contacted"
                    }
                  >
                    {lead.status}
                  </StatusBadge>
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Right: thread — message list scrolls, composer pinned at bottom */}
      <Card className="flex-1 flex flex-col min-w-0 min-h-0 rounded-2xl border-[#e2e2e2] overflow-hidden">
        {selectedLeadId && selectedLead ? (
          <div className="flex flex-col flex-1 min-h-0">
            <CardHeader className="py-4 border-b border-[#e2e2e2] flex flex-row items-center justify-between gap-2 flex-wrap shrink-0">
              <div className="min-w-0">
                <h2 className="font-display font-semibold text-[#111111] truncate">
                  {selectedLead.name}
                </h2>
                <p className="text-sm text-[#a0a0a0] font-sans">
                  {selectedLead.phone ?? ""}
                  {selectedLead.source && (
                    <StatusBadge variant="contacted" className="ml-2">
                      {selectedLead.source}
                    </StatusBadge>
                  )}
                  {selectedLead.status && (
                    <StatusBadge
                      variant={
                        selectedLead.status === "qualified"
                          ? "qualified"
                          : selectedLead.status === "appointment"
                            ? "appointment"
                            : "contacted"
                      }
                      className="ml-2"
                    >
                      {selectedLead.status}
                    </StatusBadge>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-sans"
                  onClick={() => refetchMessages()}
                  aria-label="Refresh messages"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" asChild className="font-sans">
                  <Link href={`/app/leads?leadId=${selectedLead.id}`}>View Lead →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => {
                const isOut = m.direction === "out";
                const isSystem = false;
                if (isSystem) {
                  return (
                    <div key={m.id} className="flex justify-center">
                      <span className="text-xs text-[#a0a0a0] bg-[#f5f5f5] px-2 py-1 rounded-full font-sans">
                        System event
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex flex-col gap-0.5",
                      isOut ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-sans",
                        isOut
                          ? "bg-[#111111] text-white"
                          : "bg-white border border-[#e2e2e2] text-[#111111]"
                      )}
                    >
                      {m.body}
                    </div>
                    <span className="text-xs text-[#a0a0a0] px-1 font-sans">
                      {new Date(m.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-32 text-[#a0a0a0] font-sans">
                  <MessageSquare className="h-8 w-8 mr-2" />
                  No messages yet
                </div>
              )}
            </CardContent>
            <div className="flex-shrink-0 min-h-[72px] p-4 border-t border-[#e2e2e2] bg-white">
              {demoEnabled && (
                <p className="text-xs text-amber-600 mb-2 font-sans" title="Demo: messages stored locally">
                  Demo: messages stored locally. Connect integrations in Settings for real SMS.
                </p>
              )}
              <form ref={formRef} onSubmit={handleSend} className="flex gap-2">
                <Textarea
                  placeholder={`Reply as ${agentName}...`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (body.trim()) formRef.current?.requestSubmit();
                    }
                  }}
                  rows={2}
                  className="resize-none flex-1 rounded-xl border-[#e2e2e2] font-sans"
                />
                <Button
                  type="submit"
                  disabled={sending || !body.trim()}
                  size="icon"
                  className="shrink-0 min-h-[44px] min-w-[44px] bg-[#111111] hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center text-[#a0a0a0] font-sans">
            <MessageSquare className="h-12 w-12 mr-2" />
            Select a conversation
          </CardContent>
        )}
        </Card>
      </div>
    </div>
  );
}
