/**
 * Homepage marketing copy and mock data.
 * Single source for hero, social proof, features, integrations, testimonials, pricing preview, FAQ.
 */

export const HERO = {
  eyebrow: "SMS lead response for brokerages",
  headline: "Every text lead answered in seconds — routed to the right agent.",
  subheadline:
    "Leads text your listing number. LeadHandler replies instantly, captures their info, and routes the conversation to the right agent — automatically.",
  primaryCta: "Request beta access",
  primaryCtaHref: "/#beta-form",
  secondaryCta: "See how it works",
  secondaryCtaHref: "/#how-it-works",
} as const;

export const SOCIAL_PROOF_STRIP = [
  "Built for Texas brokerages",
  "Beta",
  "Limited spots",
  "Setup in minutes",
] as const;

export const INTEGRATIONS = [
  { name: "Zillow", slug: "zillow" },
  { name: "Realtor.com", slug: "realtor" },
  { name: "Your CRM", slug: "crm" },
  { name: "Twilio", slug: "twilio" },
] as const;

export const TESTIMONIALS_HOME = [
  {
    quote:
      "We were losing leads because nobody knew who was supposed to reply. Now every lead gets a first reply in under 5 minutes. Our show rate went up.",
    author: "Sarah M.",
    role: "Broker-Owner",
    city: "Houston",
    initials: "SM",
  },
  {
    quote:
      "One inbox for the whole team — no more digging through personal texts. I can see every conversation and step in when needed.",
    author: "Mike T.",
    role: "Team Lead",
    city: "Dallas",
    initials: "MT",
  },
  {
    quote:
      "The dashboard shows me who's following up and who's not. I couldn't get that visibility without asking everyone individually.",
    author: "Jennifer L.",
    role: "Broker",
    city: "Austin",
    initials: "JL",
  },
] as const;

export const FAQ_HOME = [
  {
    q: "Does this replace my agents?",
    a: "No. LeadHandler routes leads TO your agents faster. They handle the relationship — we handle the first reply and the handoff.",
  },
  {
    q: "Can we use it per listing?",
    a: "Yes. Each listing can have its own number, or you can use one team number for all inbound leads.",
  },
  {
    q: "How fast is setup?",
    a: "Most brokerages are live in under an hour. One number, your routing rules, done.",
  },
  {
    q: "Is this available outside Texas?",
    a: "Beta is Texas-first. We're expanding based on demand — get on the list now.",
  },
  {
    q: "What does it cost?",
    a: "Beta pricing starts at $99/mo. See /pricing for full details.",
  },
] as const;

export const FINAL_CTA = {
  headline: "Ready to stop losing leads?",
  subline: "Limited beta spots. Texas brokerages only — for now.",
  buttonLabel: "Request beta access",
  buttonHref: "/#beta-form",
} as const;
