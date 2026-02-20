/**
 * Single source of truth for marketing positioning, features, how-it-works.
 * Use across homepage, pricing page, demo page, and hero. Client-facing only—no internal implementation details.
 */

export const MARKETING_POSITIONING = {
  headline: "Every text lead answered in seconds — routed to the right agent.",
  subheadline:
    "Leads text your listing number. We reply instantly, collect the basics, and route the conversation to the right agent — all logged so nothing falls through.",
  valueProps: [
    "Instant SMS follow-up to every new lead",
    "Automated lead filtering and routing",
    "Full visibility in one shared inbox",
  ],
  /** Optional trust line; do NOT hardcode Texas everywhere. */
  trustLine: null as string | null,
} as const;

export const HOW_IT_WORKS_STEPS = [
  {
    title: "Lead texts your listing number",
    body: "Leads text your listing or team number. Captured instantly.",
  },
  {
    title: "Instant auto-reply collects name, interest, and timing",
    body: "We reply in seconds and collect the basics so agents have context.",
  },
  {
    title: "Routed to the right agent based on your rules",
    body: "Round-robin or rules-based. The right agent gets the conversation.",
  },
  {
    title: "Everything logged — broker sees every conversation",
    body: "Full visibility in one place. No lead falls through.",
  },
] as const;

export interface FeatureCard {
  id: string;
  title: string;
  bullets: [string, string];
}

/** Client-facing feature cards only. No Integrations, Demo mode, or Airtable/Twilio/Stripe/Make as main features. */
export const FEATURES: FeatureCard[] = [
  {
    id: "sms-followup",
    title: "Instant SMS follow-up",
    bullets: ["Responds in seconds", "Works 24/7"],
  },
  {
    id: "qualification",
    title: "Automated lead qualification",
    bullets: ["Asks key questions", "Filters low-intent"],
  },
  {
    id: "routing",
    title: "Smart routing rules",
    bullets: [
      "Round-robin, weighted, or performance-based",
      "Escalation if not handled",
    ],
  },
  {
    id: "inbox",
    title: "One shared team inbox",
    bullets: [
      "All conversations in one place",
      "Owners can monitor and step in",
    ],
  },
  {
    id: "pipeline",
    title: "Lead pipeline + filtering",
    bullets: [
      "Track status",
      "Filter by source, agent, and stage",
    ],
  },
  {
    id: "roles",
    title: "Owner + agent roles",
    bullets: [
      "Owners control routing and visibility",
      "Agents see assigned leads",
    ],
  },
];

/** Show only under a small "Coming soon" label; do not present as a core feature. */
export const COMING_SOON_FEATURES = [
  { title: "AI-assisted qualification", note: "Coming soon" },
] as const;

export type PricingVariant = "beta" | "standard";

export interface PricingPlan {
  id: string;
  name: string;
  price: number | null;
  priceAnnual?: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  primary?: boolean;
  badge?: string;
  footnote?: string;
  priceIdEnvKey?: string;
}

/** Beta pricing: used by marketing Beta tab and in-app billing. */
export const PRICING_PLANS_BETA: PricingPlan[] = [
  {
    id: "essentials",
    name: "Essentials",
    price: 99,
    priceAnnual: 990,
    period: "/mo",
    description: "Automated follow-up, round-robin, inbox, basic dashboard.",
    features: [
      "Up to 15 agents",
      "Automated SMS follow-up",
      "Round-robin routing",
      "SMS inbox",
      "Basic dashboard",
    ],
    cta: "Request beta access",
    href: "/signup",
    primary: false,
    priceIdEnvKey: "NEXT_PUBLIC_STRIPE_PRICE_ID_ESSENTIALS",
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Popular",
    price: 249,
    priceAnnual: 2490,
    period: "/mo",
    description:
      "Everything in Essentials, plus weighted routing, escalation, analytics dashboard, priority support. Up to 40+ agents.",
    footnote: "Spots limited before standard $349/$749.",
    features: [
      "Up to 40+ agents",
      "Everything in Essentials",
      "Weighted & performance-based routing",
      "Escalation targets",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Request beta access",
    href: "/signup",
    primary: true,
    priceIdEnvKey: "NEXT_PUBLIC_STRIPE_PRICE_ID_PRO",
  },
];

/** Standard pricing: used by marketing Standard tab only. */
export const PRICING_PLANS_STANDARD: PricingPlan[] = [
  {
    id: "essentials",
    name: "Essentials",
    price: 349,
    period: "/mo",
    description: "For established teams.",
    features: [
      "Up to 15 agents",
      "Automated SMS follow-up",
      "Lead routing",
      "SMS inbox",
      "Lead sync when configured",
    ],
    cta: "Request beta access",
    href: "/signup",
    primary: false,
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Popular",
    price: 749,
    period: "/mo",
    description: "For scaling brokerages.",
    features: [
      "Up to 40+ agents",
      "Everything in Essentials",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Request beta access",
    href: "/signup",
    primary: true,
  },
  {
    id: "enterprise",
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

export const PRICING_COMPARISON_BETA = [
  { feature: "Agents", essentials: "Up to 15", pro: "Up to 40+" },
  { feature: "Automated SMS follow-up", essentials: "✓", pro: "✓" },
  { feature: "Round-robin routing", essentials: "✓", pro: "✓" },
  { feature: "SMS inbox", essentials: "✓", pro: "✓" },
  { feature: "Basic dashboard", essentials: "✓", pro: "✓" },
  { feature: "Analytics dashboard", essentials: "—", pro: "✓" },
  { feature: "Escalation", essentials: "—", pro: "✓" },
  { feature: "Priority support", essentials: "—", pro: "✓" },
] as const;

export const BILLING_PLANS: PricingPlan[] = [
  ...PRICING_PLANS_BETA,
  PRICING_PLANS_STANDARD.find((p) => p.id === "enterprise")!,
];
