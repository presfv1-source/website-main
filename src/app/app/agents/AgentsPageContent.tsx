"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { AirtableErrorFallback } from "@/components/app/AirtableErrorFallback";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserCog, UserPlus, Pencil, X } from "lucide-react";
import type { Agent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AgentsPageContentProps {
  agents: Agent[];
  airtableError: boolean;
  showEmptyState: boolean;
  isDemo?: boolean;
}

export function AgentsPageContent({
  agents,
  airtableError,
  showEmptyState,
  isDemo = false,
}: AgentsPageContentProps) {
  const [localAgents, setLocalAgents] = useState<Agent[]>(agents);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    setLocalAgents(agents);
  }, [agents]);

  async function handleAvailabilityChange(agentId: string, active: boolean) {
    setLocalAgents((p) => p.map((a) => (a.id === agentId ? { ...a, active } : a)));
    const res = await fetch(`/api/airtable/agents/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      setLocalAgents((p) => p.map((a) => (a.id === agentId ? { ...a, active: !active } : a)));
      toast.error(data.error?.message ?? "Failed to update availability");
      return;
    }
    if (data.data) {
      setLocalAgents((p) => p.map((a) => (a.id === agentId ? { ...a, ...data.data } : a)));
    }
  }

  if (showEmptyState) {
    return (
      <div className="space-y-8">
        <PageHeader title="Agents" subtitle="Manage your team" />
        <EmptyState
          icon={UserCog}
          title="Add your first agent"
          description="Add team members who will receive and work leads. Connect your sources in Settings or add agents here once set up."
          action={{ label: "Go to Settings", href: "/app/settings" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Agents"
        subtitle={`${localAgents.length} agents`}
        right={
          <Button
            onClick={() => setInviteOpen(true)}
            className="bg-[#111111] hover:opacity-90 font-sans"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Agent
          </Button>
        }
      />
      {airtableError && <AirtableErrorFallback className="mb-4" />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localAgents.map((agent) => {
          const initials = agent.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <div
              key={agent.id}
              className="bg-white rounded-2xl border border-[#e2e2e2] p-5 flex flex-col"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-full bg-[#e2e2e2] flex items-center justify-center text-[#222222] font-display font-semibold text-sm flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold text-[#111111] truncate text-base">
                    {agent.name}
                  </h3>
                  <p className="text-xs font-sans text-[#6a6a6a] mt-0.5">
                    {agent.active ? "Available" : "Unavailable"}
                  </p>
                  <div className="flex items-center gap-2 mt-3 font-sans">
                    <Switch
                      checked={agent.active}
                      onCheckedChange={(checked) =>
                        handleAvailabilityChange(agent.id, checked)
                      }
                    />
                    <span className="text-xs text-[#6a6a6a]">
                      Accepting Leads
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#f0f0f0] grid grid-cols-3 gap-2 text-center font-sans text-sm">
                <div>
                  <p className="text-[#a0a0a0]">Leads</p>
                  <p className="font-semibold text-[#111111]">{agent.metrics?.leadsAssigned ?? 0}</p>
                </div>
                <div>
                  <p className="text-[#a0a0a0]">Avg reply</p>
                  <p className="font-semibold text-[#111111]">—</p>
                </div>
                <div>
                  <p className="text-[#a0a0a0]">Closed</p>
                  <p className="font-semibold text-[#111111]">{agent.metrics?.closedCount ?? 0}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 font-sans"
                  onClick={() => setSelectedAgent(agent)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-sans"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {inviteOpen && (
        <InviteAgentModal
          onClose={() => setInviteOpen(false)}
          onSuccess={(agent) => {
            setLocalAgents((prev) => [...prev, agent]);
            setInviteOpen(false);
          }}
        />
      )}
      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onSave={(updated) => {
            setLocalAgents((prev) =>
              prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
            );
            setSelectedAgent((prev) =>
              prev && prev.id === updated.id ? { ...prev, ...updated } : prev
            );
            toast.success("Agent updated");
          }}
        />
      )}
    </div>
  );
}

function InviteAgentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (agent: Agent) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const em = email.trim();
    if (!n || !em) {
      toast.error("Name and email are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/airtable/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, email: em, phone: phone.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        toast.error(data.error?.message ?? "Failed to invite agent");
        return;
      }
      onSuccess(data.data as Agent);
      onClose();
      toast.success("Agent invited");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl shadow-xl border border-[#e2e2e2] w-full max-w-md p-6">
        <h3 className="font-display font-semibold text-lg text-[#111111] mb-4">
          Invite Agent
        </h3>
        <form className="space-y-4 font-sans" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-[#222222]">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e2e2e2] px-3 py-2 text-sm"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#222222]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e2e2e2] px-3 py-2 text-sm"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#222222]">Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e2e2e2] px-3 py-2 text-sm"
              placeholder="+1 555 000 0000"
            />
          </div>
          <p className="text-xs text-[#a0a0a0]">Role: Agent</p>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-sans">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#111111] hover:opacity-90 font-sans"
            >
              {submitting ? "Sending…" : "Send Invite"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AgentDetailPanel({
  agent,
  onClose,
  onSave,
}: {
  agent: Agent;
  onClose: () => void;
  onSave: (updated: Agent) => void;
}) {
  const [name, setName] = useState(agent.name);
  const [email, setEmail] = useState(agent.email);
  const [phone, setPhone] = useState(agent.phone);
  const [active, setActive] = useState(agent.active);
  const [saving, setSaving] = useState(false);

  // Sync form when agent changes (e.g. after list update)
  useEffect(() => {
    setName(agent.name);
    setEmail(agent.email);
    setPhone(agent.phone);
    setActive(agent.active);
  }, [agent.id, agent.name, agent.email, agent.phone, agent.active]);

  const initials = (name || agent.name).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/airtable/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          active,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        toast.error(data.error?.message ?? "Failed to update agent");
        return;
      }
      onSave(data.data as Agent);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20" aria-hidden onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl border-l border-[#e2e2e2] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#e2e2e2]">
          <h2 className="font-display font-semibold text-lg text-[#111111] truncate">{name || agent.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#e2e2e2] flex items-center justify-center text-xl font-display font-semibold text-[#222222] flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1 space-y-2 font-sans">
              <div>
                <label className="text-xs font-medium text-[#a0a0a0]">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-[#e2e2e2] px-3 py-2 text-sm text-[#111111]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#a0a0a0]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-[#e2e2e2] px-3 py-2 text-sm text-[#111111]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#a0a0a0]">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-[#e2e2e2] px-3 py-2 text-sm text-[#111111]"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Switch checked={active} onCheckedChange={setActive} />
                <span className="text-sm text-[#6a6a6a]">{active ? "Available" : "Unavailable"}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-[#111111] mb-2">Stats</h4>
            <ul className="space-y-1 font-sans text-sm text-[#6a6a6a]">
              <li>Leads assigned: {agent.metrics?.leadsAssigned ?? 0}</li>
              <li>Qualified: {agent.metrics?.qualifiedCount ?? 0}</li>
              <li>Appointments: {agent.metrics?.appointmentsSet ?? 0}</li>
              <li>Closed: {agent.metrics?.closedCount ?? 0}</li>
            </ul>
          </div>
          <Button
            variant="outline"
            className="w-full font-sans"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </>
  );
}
