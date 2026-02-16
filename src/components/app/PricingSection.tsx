"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
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
import { cn } from "@/lib/utils";

const BETA_PLANS = [
  {
    name: "Essentials",
    price: "$99",
    period: "/mo",
    description: "Core features for small teams. Lock beta pricing.",
    features: ["Up to 15 agents", "AI lead qualification", "Lead routing", "SMS inbox", "Seamless lead sync"],
    cta: "Claim Beta Spot",
    href: "/signup",
    primary: false,
  },
  {
    name: "Pro",
    badge: "Best value",
    price: "$249",
    period: "/mo",
    description: "Advanced features, higher limits. Lock beta pricing.",
    features: ["Unlimited agents", "Everything in Essentials", "Performance visibility", "Priority support"],
    cta: "Claim Beta Spot",
    href: "/signup",
    primary: true,
  },
];

const STANDARD_PLANS = [
  {
    name: "Starter",
    price: "$349",
    period: "/mo",
    description: "For established teams.",
    features: ["Up to 15 agents", "AI qualification", "Lead routing", "SMS inbox", "Seamless lead sync"],
    cta: "Get started",
    href: "/signup",
    primary: false,
  },
  {
    name: "Growth",
    badge: "Popular",
    price: "$749",
    period: "/mo",
    description: "For scaling brokerages.",
    features: ["Unlimited agents", "Everything in Starter", "Performance visibility", "Priority support"],
    cta: "Get started",
    href: "/signup",
    primary: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Dedicated support and custom options.",
    features: ["Unlimited agents", "Everything in Growth", "Dedicated support", "Custom options"],
    cta: "Contact sales",
    href: "/contact",
    primary: false,
  },
];

const COMPARISON_ROWS = [
  { feature: "Agents", essentials: "Up to 15", pro: "Unlimited" },
  { feature: "AI lead qualification", essentials: "✓", pro: "✓" },
  { feature: "Lead routing", essentials: "✓", pro: "✓" },
  { feature: "SMS inbox", essentials: "✓", pro: "✓" },
  { feature: "Seamless lead sync", essentials: "✓", pro: "✓" },
  { feature: "Performance visibility", essentials: "—", pro: "✓" },
  { feature: "Priority support", essentials: "—", pro: "✓" },
];

export function PricingSection() {
  return (
    <Tabs defaultValue="beta" className="w-full">
      <TabsList className="mb-8 grid w-full max-w-md mx-auto grid-cols-2">
        <TabsTrigger value="beta">Beta Pricing</TabsTrigger>
        <TabsTrigger value="standard">Standard Pricing</TabsTrigger>
      </TabsList>

      <TabsContent value="beta" className="mt-0 space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {BETA_PLANS.map((plan) => (
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
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">
                    {plan.period}
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

        <Card>
          <CardHeader>
            <CardTitle>Beta plan comparison</CardTitle>
            <p className="text-sm text-muted-foreground">
              Essentials vs Pro—choose the right fit for your brokerage.
            </p>
          </CardHeader>
          <CardContent>
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
            <div className="mt-6 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
              >
                Claim Beta Spot
                <ArrowRight className="size-4" aria-hidden />
              </Link>
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
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">
                    {plan.period}
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
  );
}
