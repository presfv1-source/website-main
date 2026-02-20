import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LeadHandler.ai — Pricing",
  description:
    "Simple pricing for real estate brokerages. Beta access, limited spots.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
