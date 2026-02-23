"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap, Building2, Check } from "lucide-react";
import { toast } from "sonner";
import { BILLING_PLANS } from "@/lib/marketingContent";
import { useViewPlan } from "@/components/app/PlanViewSelector";

type PlanId = "free" | "essentials" | "pro" | "enterprise";

const PLAN_ICONS = { essentials: Zap, pro: Building2, enterprise: CreditCard } as const;
const PLAN_POPULAR: Record<string, boolean> = { pro: true };

function getPriceId(planId: string): string {
  if (planId === "essentials") return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ESSENTIALS ?? "";
  if (planId === "pro") return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO ?? "";
  return "";
}

interface BillingPageClientProps {
  isSuperAdmin?: boolean;
}

export function BillingPageClient({ isSuperAdmin = false }: BillingPageClientProps) {
  const [loading, setLoading] = useState(false);
  const [planId, setPlanId] = useState<PlanId | null>(null);
  const [hasStripe, setHasStripe] = useState(false);
  const viewPlan = useViewPlan();
  // When super_admin, show view-as plan for display only; real planId still used for checkout/API.
  // Map viewPlan "essential" to API/Stripe plan id "essentials" for lookup.
  const displayPlanId: PlanId =
    isSuperAdmin ? (viewPlan === "essential" ? "essentials" : viewPlan) : (planId ?? "free");

  useEffect(() => {
    fetch("/api/billing/plan")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setPlanId(data.data.planId ?? "free");
          setHasStripe(Boolean(data.data.hasStripe));
        } else {
          setPlanId("free");
          setHasStripe(false);
        }
      })
      .catch(() => {
        setPlanId("free");
        setHasStripe(false);
      });
  }, []);

  async function handleUpgrade(planId: string, priceId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: priceId || undefined }),
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        toast.info("Checkout: " + (data.data?.url ?? "configure STRIPE_PRICE_ID in env"));
      }
    } catch {
      toast.error("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        toast.info("Portal: " + (data.data?.url ?? "configure Stripe"));
      }
    } catch {
      toast.error("Failed to open portal");
    } finally {
      setLoading(false);
    }
  }

  const plansToShow = BILLING_PLANS.filter((p) => p.id === "essentials" || p.id === "pro");
  const currentPlanFromPlans = BILLING_PLANS.find((p) => p.id === displayPlanId);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Billing & Plan"
        subtitle="Manage your subscription and payment method."
      />

      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 font-sans">
        🔒 You&apos;re on beta pricing. Your rate is locked as long as you stay subscribed.
      </div>

      {isSuperAdmin && (
        <div className="rounded-2xl border border-dashed border-amber-400 bg-amber-50/50 px-4 py-2 text-sm text-amber-800 font-sans">
          Viewing as <strong>{displayPlanId === "pro" ? "Pro" : "Essential"}</strong> plan (super_admin preview)
        </div>
      )}
      <Card className="rounded-2xl border-[#e2e2e2] overflow-hidden">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Badge className="bg-[#111111] text-white font-sans">
                {planId === null && !isSuperAdmin
                  ? "…"
                  : displayPlanId === "free"
                    ? "Free"
                    : displayPlanId.charAt(0).toUpperCase() + displayPlanId.slice(1)}
              </Badge>
              <p className="text-2xl font-display font-bold text-[#111111] mt-2">
                {planId === null && !isSuperAdmin
                  ? ""
                  : currentPlanFromPlans?.price != null
                    ? `$${currentPlanFromPlans.price}/mo`
                    : displayPlanId === "free"
                      ? ""
                      : currentPlanFromPlans?.id === "enterprise"
                        ? "Custom"
                        : "/mo"}
              </p>
              <p className="text-sm text-[#a0a0a0] font-sans mt-1">
                Renews next billing cycle. Agents: 3/15 used (usage bar in Settings).
              </p>
            </div>
            <div className="flex gap-2">
              {planId === "essentials" && (
                <Button
                  onClick={() => handleUpgrade("pro", getPriceId("pro"))}
                  disabled={loading}
                  className="bg-[#111111] hover:opacity-90 font-sans"
                >
                  Upgrade to Pro →
                </Button>
              )}
              {hasStripe && (planId === "pro" || planId === "essentials") && (
                <Button variant="outline" onClick={handlePortal} disabled={loading} className="font-sans">
                  Manage Subscription
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {plansToShow.map((plan) => {
          const Icon = PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS] ?? CreditCard;
          const isCurrent = plan.id === displayPlanId;
          const priceId = getPriceId(plan.id);
          return (
            <Card
              key={plan.id}
              className={`rounded-2xl border ${
                PLAN_POPULAR[plan.id] ? "border-[#111111]" : "border-[#e2e2e2]"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-[#111111]" />
                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <Badge variant="secondary" className="font-sans">Current Plan</Badge>
                    )}
                    {PLAN_POPULAR[plan.id] && !isCurrent && <Badge className="font-sans">Popular</Badge>}
                  </div>
                </div>
                <CardTitle className="font-display">{plan.name}</CardTitle>
                <p className="text-2xl font-display font-bold text-[#111111]">
                  {plan.price != null ? `$${plan.price}` : "Custom"}
                  <span className="text-base font-normal text-[#a0a0a0] font-sans">/mo</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[#a0a0a0] font-sans">{plan.description}</p>
                <ul className="space-y-2 text-sm font-sans">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-[#111111]" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.id === "pro" && !isCurrent && (
                  <Button
                    className="w-full bg-[#111111] hover:opacity-90 font-sans"
                    onClick={() => handleUpgrade(plan.id, priceId)}
                    disabled={loading}
                  >
                    Upgrade to Pro →
                  </Button>
                )}
                {plan.id === "essentials" && planId === "free" && (
                  <Button
                    className="w-full bg-[#111111] hover:opacity-90 font-sans"
                    onClick={() => handleUpgrade(plan.id, priceId)}
                    disabled={loading}
                  >
                    Get Essentials →
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl border-[#e2e2e2]">
        <CardHeader>
          <CardTitle className="font-display">Payment Method</CardTitle>
          <p className="text-sm text-[#a0a0a0] font-sans">Card on file for subscription</p>
        </CardHeader>
        <CardContent>
          {hasStripe && (planId === "essentials" || planId === "pro") ? (
            <>
              <p className="text-sm font-sans text-[#6a6a6a]">
                Payment method on file. Manage in Stripe portal.
              </p>
              <Button variant="outline" onClick={handlePortal} disabled={loading} className="mt-4 font-sans">
                Manage billing
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-sans text-[#6a6a6a]">No payment method on file</p>
              {!hasStripe && (
                <p className="text-xs text-[#a0a0a0] mt-2 font-sans">
                  Connect Stripe in Settings to manage billing.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-[#e2e2e2] overflow-hidden">
        <CardHeader>
          <CardTitle className="font-display">Billing History</CardTitle>
          <p className="text-sm text-[#a0a0a0] font-sans">Invoices and payments</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-[#f0f0f0]">
                  <th className="text-left py-3 px-4 font-medium text-[#a0a0a0] text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-[#a0a0a0] text-xs uppercase tracking-wider">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-[#a0a0a0] text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-[#a0a0a0] text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-[#a0a0a0] text-xs uppercase tracking-wider">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "Feb 19, 2026", desc: "LeadHandler Pro — Monthly", amount: "$249.00", status: "Paid" },
                  { date: "Jan 19, 2026", desc: "LeadHandler Pro — Monthly", amount: "$249.00", status: "Paid" },
                  { date: "Dec 19, 2025", desc: "LeadHandler Pro — Monthly", amount: "$249.00", status: "Paid" },
                  { date: "Nov 19, 2025", desc: "LeadHandler Pro — Monthly", amount: "$249.00", status: "Paid" },
                  { date: "Oct 19, 2025", desc: "LeadHandler Pro — Monthly", amount: "$249.00", status: "Paid" },
                  { date: "Sep 19, 2025", desc: "LeadHandler Pro — Monthly", amount: "$249.00", status: "Paid" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#f0f0f0]">
                    <td className="py-3 px-4 text-[#6a6a6a]">{row.date}</td>
                    <td className="py-3 px-4 text-[#111111]">{row.desc}</td>
                    <td className="py-3 px-4 text-[#6a6a6a]">{row.amount}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 font-sans">
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <button type="button" className="text-[#111111] hover:underline font-sans">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
