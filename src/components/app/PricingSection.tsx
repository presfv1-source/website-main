"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const BETA_PLANS = [
  {
    name: "Essentials",
    price: 99,
    priceAnnual: 990,
    period: "/mo",
    description: "AI qual, round-robin, inbox, basic dashboard.",
    features: ["Up to 15 agents", "AI lead qualification", "Round-robin routing", "SMS inbox", "Basic dashboard"],
    cta: "Claim Beta Spot",
    href: "/signup",
    primary: false,
  },
  {
    name: "Pro",
    badge: "Popular",
    price: 249,
    priceAnnual: 2490,
    period: "/mo",
    description: "Everything in Essentials, plus advanced routing & escalation, detailed analytics, priority support. Up to 40+ agents.",
    footnote: "Spots limited before standard $349/$749.",
    features: ["Up to 40+ agents", "Everything in Essentials", "Advanced routing & escalation", "Detailed analytics", "Priority support"],
    cta: "Claim Beta Spot",
    href: "/signup",
    primary: true,
  },
];

const STANDARD_PLANS = [
  {
    name: "Essentials",
    price: 349,
    period: "/mo",
    description: "For established teams.",
    features: ["Up to 15 agents", "AI qualification", "Lead routing", "SMS inbox", "Seamless lead sync"],
    cta: "Get started",
    href: "/signup",
    primary: false,
  },
  {
    name: "Pro",
    badge: "Popular",
    price: 749,
    period: "/mo",
    description: "For scaling brokerages.",
    features: ["Up to 40+ agents", "Everything in Essentials", "Performance visibility", "Priority support"],
    cta: "Get started",
    href: "/signup",
    primary: true,
  },
  {
    name: "Enterprise",
    price: null,
    period: "Custom",
    description: "Dedicated support and custom options.",
    features: ["Custom limits", "Dedicated support", "API access", "SLA"],
    cta: "Contact sales",
    href: "/contact",
    primary: false,
  },
];

const COMPARISON_ROWS = [
  { feature: "Agents", essentials: "Up to 15", pro: "Up to 40+" },
  { feature: "AI lead qualification", essentials: "✓", pro: "✓" },
  { feature: "Round-robin routing", essentials: "✓", pro: "✓" },
  { feature: "SMS inbox", essentials: "✓", pro: "✓" },
  { feature: "Basic dashboard", essentials: "✓", pro: "✓" },
  { feature: "Advanced analytics", essentials: "—", pro: "✓" },
  { feature: "Escalation", essentials: "—", pro: "✓" },
  { feature: "Priority support", essentials: "—", pro: "✓" },
];

const AGENT_RANGES = [
  { value: "1-5", label: "1–5 agents" },
  { value: "6-15", label: "6–15 agents" },
  { value: "16-40", label: "16–40 agents" },
  { value: "40+", label: "40+ agents" },
] as const;

export function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistBrokerage, setWaitlistBrokerage] = useState("");
  const [waitlistAgents, setWaitlistAgents] = useState<string>("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!waitlistName.trim() || !waitlistEmail.trim() || !waitlistBrokerage.trim() || !waitlistAgents) {
      toast.error("Name and email are required. Please fill in all fields.");
      return;
    }
    setWaitlistLoading(true);
    try {
      const source = `Brokerage: ${waitlistBrokerage.trim()}; Agents: ${waitlistAgents}`;
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: waitlistName.trim(),
          email: waitlistEmail.trim(),
          source,
        }),
      });
      const data = res.ok ? null : (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      if (!res.ok) {
        const msg = data?.error?.message ?? "Failed to submit";
        toast.error(msg);
        return;
      }
      toast.success("You're on the list! Check email for next steps.");
      setWaitlistOpen(false);
      setWaitlistName("");
      setWaitlistEmail("");
      setWaitlistBrokerage("");
      setWaitlistAgents("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setWaitlistLoading(false);
    }
  }

  return (
    <>
      <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join the beta waitlist</DialogTitle>
            <DialogDescription>
              Enter your details and we&apos;ll get you on the list for early access.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWaitlistSubmit} className="grid gap-4">
            <div>
              <Label htmlFor="waitlist-name">Name</Label>
              <Input
                id="waitlist-name"
                type="text"
                value={waitlistName}
                onChange={(e) => setWaitlistName(e.target.value)}
                placeholder="Your name"
                required
                className="mt-1.5 min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="waitlist-email">Email</Label>
              <Input
                id="waitlist-email"
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="you@brokerage.com"
                required
                className="mt-1.5 min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="waitlist-brokerage">Brokerage</Label>
              <Input
                id="waitlist-brokerage"
                type="text"
                value={waitlistBrokerage}
                onChange={(e) => setWaitlistBrokerage(e.target.value)}
                placeholder="Brokerage name"
                required
                className="mt-1.5 min-h-[44px]"
              />
            </div>
            <div>
              <Label>Number of agents</Label>
              <Select value={waitlistAgents} onValueChange={setWaitlistAgents}>
                <SelectTrigger className="mt-1.5 w-full min-h-[44px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_RANGES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={waitlistLoading} className="min-h-[44px]">
              {waitlistLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Submitting…
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="beta" className="w-full">
      <TabsList className="mb-8 grid w-full max-w-md mx-auto grid-cols-2">
        <TabsTrigger value="beta">Beta Pricing</TabsTrigger>
        <TabsTrigger value="standard">Standard</TabsTrigger>
      </TabsList>

      <TabsContent value="beta" className="mt-0 space-y-8">
        {/* Annual toggle */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Annual
          </button>
          {annual && (
            <span className="text-xs text-muted-foreground ml-1">(2 months free)</span>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {BETA_PLANS.map((plan) => {
            const price = annual ? plan.priceAnnual : plan.price;
            const period = annual ? "/yr" : plan.period;
            return (
              <Card
                key={plan.name}
                className={cn(
                  "flex flex-col",
                  plan.primary && "border-2 border-primary shadow-md"
                )}
              >
                <CardHeader>
                  {plan.badge && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary w-fit">
                      {plan.badge}
                    </span>
                  )}
                <CardTitle className={cn(plan.badge ? "mt-2" : "mt-0")}>
                  {plan.name}
                </CardTitle>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  ${price}
                  <span className="text-base font-normal text-muted-foreground">
                    {period}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                {"footnote" in plan && plan.footnote && (
                  <p className="text-xs text-muted-foreground mt-1">{plan.footnote}</p>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 text-sm text-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-primary" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  onClick={() => setWaitlistOpen(true)}
                  className={cn(
                    "mt-6 w-full min-h-[44px]",
                    plan.primary
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-background hover:bg-muted text-foreground"
                  )}
                >
                  {plan.cta}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Beta plan comparison</CardTitle>
            <p className="text-sm text-muted-foreground">
              Essentials vs Pro—choose the right fit for your brokerage.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Feature</TableHead>
                  <TableHead className="text-center">Essentials $99/mo</TableHead>
                  <TableHead className="text-center">Pro $249/mo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ROWS.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="font-medium">{row.feature}</TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {row.essentials}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {row.pro}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            <div className="mt-6 text-center">
              <Button
                type="button"
                onClick={() => setWaitlistOpen(true)}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
              >
                Claim Beta Spot
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="standard" className="mt-0">
        <div className="grid gap-6 md:grid-cols-3">
          {STANDARD_PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "flex flex-col",
                plan.primary && "border-2 border-primary shadow-md"
              )}
            >
              <CardHeader>
                {plan.badge && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary w-fit">
                    {plan.badge}
                  </span>
                )}
                <CardTitle className={cn(plan.badge ? "mt-2" : "mt-0")}>
                  {plan.name}
                </CardTitle>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {plan.price != null ? `$${plan.price}` : "Custom"}
                  <span className="text-base font-normal text-muted-foreground">
                    {plan.period ? ` ${plan.period}` : ""}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 text-sm text-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-primary" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={cn(
                    "mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    plan.primary
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-background hover:bg-muted"
                  )}
                >
                  {plan.cta}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
    </>
  );
}
