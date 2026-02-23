"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PageHeader } from "@/components/app/PageHeader";
import { UpgradeCard } from "@/components/app/UpgradeCard";
import { AirtableErrorFallback } from "@/components/app/AirtableErrorFallback";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Check, GripVertical, Info } from "lucide-react";
import { toast } from "sonner";
import type { Agent } from "@/lib/types";
import { cn } from "@/lib/utils";

type Mode = "round-robin" | "weighted" | "performance";

interface RoutingPageContentProps {
  agents: Agent[];
  demoEnabled: boolean;
  airtableError: boolean;
}

const initialOrderFromAgents = (agents: Agent[]): string[] => {
  return [...agents]
    .sort((a, b) => (b.roundRobinWeight ?? 5) - (a.roundRobinWeight ?? 5))
    .map((a) => a.id);
};

function SortableAgentRow({
  agent,
  index,
  weights,
  setWeights,
  isPro,
}: {
  agent: Agent;
  index: number;
  weights: Record<string, number>;
  setWeights: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  isPro: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: agent.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn("border-[#f0f0f0]", isDragging && "opacity-50 bg-[#fafafa]")}
    >
      <TableCell className="text-[#a0a0a0] cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </TableCell>
      <TableCell className="font-medium font-sans">{agent.name}</TableCell>
      <TableCell>
        <Switch checked={agent.active} disabled />
      </TableCell>
      <TableCell className="font-sans text-[#6a6a6a]">{index + 1}</TableCell>
      <TableCell className="font-sans text-[#6a6a6a]">
        {agent.metrics?.leadsAssigned ?? 0}
      </TableCell>
      {isPro && (
        <TableCell>
          <Input
            type="number"
            min={1}
            max={10}
            value={weights[agent.id] ?? 5}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!Number.isNaN(n) && n >= 1 && n <= 10)
                setWeights((prev) => ({ ...prev, [agent.id]: n }));
            }}
            className="h-9 w-20 font-sans"
          />
        </TableCell>
      )}
    </TableRow>
  );
}

export function RoutingPageContent({
  agents,
  demoEnabled,
  airtableError,
}: RoutingPageContentProps) {
  const { isPro } = useUser();
  const [mode, setMode] = useState<Mode>("round-robin");
  const [orderedIds, setOrderedIds] = useState<string[]>(() => initialOrderFromAgents(agents));
  const [orderDirty, setOrderDirty] = useState(false);
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    agents.forEach((a) => {
      init[a.id] = a.roundRobinWeight ?? (a.closeRate != null ? Math.min(10, Math.max(1, Math.round(a.closeRate / 10))) : 5);
    });
    return init;
  });
  const [escalationMinutes, setEscalationMinutes] = useState("30");
  const [escalationTarget, setEscalationTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingEscalation, setSavingEscalation] = useState(false);

  const agentsById = useMemo(() => {
    const m: Record<string, Agent> = {};
    agents.forEach((a) => {
      m[a.id] = a;
    });
    return m;
  }, [agents]);

  const orderedAgents = useMemo(
    () => orderedIds.map((id) => agentsById[id]).filter(Boolean),
    [orderedIds, agentsById]
  );

  useEffect(() => {
    setOrderedIds((prev) => {
      const current = new Set(prev);
      const added = agents.filter((a) => !current.has(a.id)).map((a) => a.id);
      if (added.length === 0) return prev;
      return [...prev, ...added];
    });
  }, [agents]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const i = orderedIds.indexOf(active.id as string);
    const j = orderedIds.indexOf(over.id as string);
    if (i === -1 || j === -1) return;
    setOrderedIds((prev) => arrayMove(prev, i, j));
    setOrderDirty(true);
  }

  useEffect(() => {
    if (!isPro || demoEnabled) return;
    fetch("/api/settings/escalation")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setEscalationTarget(data.data.escalationTarget ?? "");
          if (typeof data.data.escalationMinutes === "number")
            setEscalationMinutes(String(data.data.escalationMinutes));
        }
      })
      .catch(() => {});
  }, [isPro, demoEnabled]);

  async function handleSave() {
    setSaving(true);
    try {
      if (demoEnabled) {
        toast.success("Demo mode: routing order saved.");
        setOrderDirty(false);
        setSaving(false);
        return;
      }
      const weightsFromOrder: Record<string, number> = {};
      orderedIds.forEach((id, idx) => {
        weightsFromOrder[id] = Math.max(1, 10 - idx);
      });
      const res = await fetch("/api/routing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights: weightsFromOrder }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Routing settings saved.");
        setOrderDirty(false);
        setWeights((prev) => ({ ...prev, ...weightsFromOrder }));
      } else {
        toast.error(data.error?.message ?? "Could not save");
      }
    } catch {
      toast.error("Could not save routing settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEscalation() {
    setSavingEscalation(true);
    try {
      if (demoEnabled) {
        toast.success("Demo mode: escalation settings not persisted.");
        setSavingEscalation(false);
        return;
      }
      const res = await fetch("/api/settings/escalation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escalationTarget: escalationTarget.trim(),
          escalationMinutes: parseInt(escalationMinutes, 10) || 30,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Escalation settings saved.");
      } else {
        toast.error(data.error?.message ?? "Could not save escalation settings");
      }
    } catch {
      toast.error("Could not save escalation settings");
    } finally {
      setSavingEscalation(false);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Lead Routing"
        subtitle="Control how new leads are distributed to your agents."
      />
      {airtableError && <AirtableErrorFallback className="mb-4" />}

      {/* Section 1 — Routing Mode */}
      <Card className="rounded-2xl border-[#e2e2e2]">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display font-semibold text-[#111111]">Routing Mode</h2>
            <span className="rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-sm font-medium text-[#111111] font-sans">
              Active: Round Robin
            </span>
          </div>
          <p className="text-sm text-[#a0a0a0] font-sans mt-1 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-[#a0a0a0] shrink-0" aria-hidden />
            Routing logic is managed by your automation rules.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setMode("round-robin")}
              className={cn(
                "rounded-2xl border-2 p-4 text-left transition font-sans",
                mode === "round-robin"
                  ? "border-[#111111] bg-[#f5f5f5]"
                  : "border-[#e2e2e2] hover:border-[#d4d4d4]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#111111]">Round Robin</span>
                {mode === "round-robin" && <Check className="h-5 w-5 text-[#111111]" />}
              </div>
              <p className="text-sm text-[#a0a0a0] mt-1">
                Distribute leads equally across all active agents.
              </p>
            </button>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-2xl border-2 border-[#e2e2e2] p-4 opacity-80 cursor-not-allowed relative">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#222222] font-sans">Weighted</span>
                      <span className="rounded bg-[#f5f5f5] px-2 py-0.5 text-xs font-medium text-[#6a6a6a] font-sans">
                        Coming soon
                      </span>
                    </div>
                    <p className="text-sm text-[#a0a0a0] mt-1 font-sans">
                      Assign leads based on custom agent weights.
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">Coming soon</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-2xl border-2 border-[#e2e2e2] p-4 opacity-80 cursor-not-allowed relative">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#222222] font-sans">Performance-based</span>
                      <span className="rounded bg-[#f5f5f5] px-2 py-0.5 text-xs font-medium text-[#6a6a6a] font-sans">
                        Coming soon
                      </span>
                    </div>
                    <p className="text-sm text-[#a0a0a0] mt-1 font-sans">
                      Route to highest-performing agents automatically.
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">Coming soon</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Agent Queue */}
      <Card className="rounded-2xl border-[#e2e2e2]">
        <CardHeader>
          <h2 className="font-display font-semibold text-[#111111]">Agent Queue</h2>
          <p className="text-sm text-[#a0a0a0] font-sans mt-1">
            Drag agents to set distribution order. The agent at the top receives leads first.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-[#e2e2e2]">
                    <TableHead className="w-10 font-sans text-[#6a6a6a]"></TableHead>
                    <TableHead className="font-sans text-[#6a6a6a]">Agent</TableHead>
                    <TableHead className="font-sans text-[#6a6a6a]">Active</TableHead>
                    <TableHead className="font-sans text-[#6a6a6a]">Priority</TableHead>
                    <TableHead className="font-sans text-[#6a6a6a]">Leads today</TableHead>
                    {isPro && (
                      <TableHead className="font-sans text-[#6a6a6a]">Weight %</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={orderedIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {orderedAgents.map((agent, idx) => (
                      <SortableAgentRow
                        key={agent.id}
                        agent={agent}
                        index={idx}
                        weights={weights}
                        setWeights={setWeights}
                        isPro={isPro}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !orderDirty}
            className={cn(
              "mt-4 font-sans",
              orderDirty ? "bg-[#111111] hover:opacity-90" : "bg-[#e2e2e2] text-[#6a6a6a] cursor-not-allowed"
            )}
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Section 3 — Escalation (Pro only) */}
      {isPro ? (
        <Card className="rounded-2xl border-[#e2e2e2]">
          <CardHeader>
            <h2 className="font-display font-semibold text-[#111111]">Escalation Rules</h2>
            <p className="text-sm text-[#a0a0a0] font-sans mt-1">
              When a lead isn&apos;t responded to in time, escalate to another agent or owner.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="escalation-min" className="font-sans">
                If no reply within (minutes)
              </Label>
              <Input
                id="escalation-min"
                type="number"
                min={5}
                value={escalationMinutes}
                onChange={(e) => setEscalationMinutes(e.target.value)}
                className="mt-1 max-w-[140px] font-sans"
              />
            </div>
            <div>
              <Label htmlFor="escalation-target" className="font-sans">
                Escalate to (phone number or agent name)
              </Label>
              <Input
                id="escalation-target"
                type="text"
                placeholder="e.g. +1234567890 or Agent name"
                value={escalationTarget}
                onChange={(e) => setEscalationTarget(e.target.value)}
                className="mt-1 max-w-sm font-sans"
              />
            </div>
            <Button
              variant="outline"
              className="font-sans"
              onClick={handleSaveEscalation}
              disabled={savingEscalation}
            >
              {savingEscalation ? "Saving…" : "Save escalation settings"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-[#e2e2e2] p-8">
          <UpgradeCard feature="Escalation Rules" />
        </div>
      )}
    </div>
  );
}
