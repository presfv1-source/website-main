"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react";
import { toast } from "sonner";

const PLAN_STORAGE_KEY = "lh_view_as_plan";

export type ViewPlan = "essential" | "pro";

/**
 * FIX 5 — Plan POV selector
 * Only visible to super_admin (Preston).
 * Sets a sessionStorage key that other components read to toggle UI gating.
 * Does NOT affect billing or real plan data — purely for testing customer POV.
 */
export function PlanViewSelector({ className }: { className?: string }) {
  const [plan, setPlan] = useState<ViewPlan>("pro");

  useEffect(() => {
    const stored = sessionStorage.getItem(PLAN_STORAGE_KEY) as ViewPlan | null;
    if (stored === "essential" || stored === "pro") setPlan(stored);
  }, []);

  function handleChange(value: ViewPlan) {
    setPlan(value);
    sessionStorage.setItem(PLAN_STORAGE_KEY, value);
    // Dispatch a custom event so other components can react without prop drilling
    window.dispatchEvent(new CustomEvent("lh:plan-change", { detail: value }));
    toast.success(`Viewing as ${value === "pro" ? "Pro" : "Essential"} plan`);
  }

  return (
    <div className={className}>
      <Select value={plan} onValueChange={(v) => handleChange(v as ViewPlan)}>
        <SelectTrigger className="h-8 w-[150px] text-xs font-sans border-dashed border-amber-400 bg-amber-50/50">
          <Eye className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="essential">Essential plan</SelectItem>
          <SelectItem value="pro">Pro plan</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Hook to read the current view-as plan from sessionStorage.
 * Listens for the custom "lh:plan-change" event to stay in sync.
 * Returns "pro" by default if not set.
 */
export function useViewPlan(): ViewPlan {
  const [plan, setPlan] = useState<ViewPlan>("pro");

  useEffect(() => {
    function read() {
      const stored = sessionStorage.getItem(PLAN_STORAGE_KEY) as ViewPlan | null;
      setPlan(stored === "essential" ? "essential" : "pro");
    }
    read();
    window.addEventListener("lh:plan-change", read);
    return () => window.removeEventListener("lh:plan-change", read);
  }, []);

  return plan;
}
