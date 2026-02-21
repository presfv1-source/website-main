import Link from "next/link";
import { MarketingHeader } from "@/components/app/MarketingHeader";
import { MarketingFooter } from "@/components/app/MarketingFooter";
import { CONTAINER_NARROW, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingHeader />

      <section className="py-12 md:py-16 bg-[#0A0F1E]">
        <div className={cn(CONTAINER_NARROW, PAGE_PADDING)}>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
            Privacy
          </h1>
        </div>
      </section>

      <main className={cn(CONTAINER_NARROW, PAGE_PADDING, "flex-1 py-12 md:py-16 bg-white")}>
        <p className="text-gray-600 leading-relaxed mt-2">
          How we collect, use, and protect your information.
        </p>

        <section className="mt-8 space-y-6 text-sm text-gray-600 leading-relaxed">
          <p>
            LeadHandler.ai (&quot;we&quot;) processes data you provide when using our service, including brokerage and agent information, lead and contact data, and messages. We use this to deliver SMS lead response and routing, dashboard visibility, and billing.
          </p>
          <p>
            We do not sell your data to third parties for marketing. We use: <strong>Twilio</strong> for SMS delivery and receipt; <strong>Airtable</strong> for storing brokerages, agents, leads, and messages; <strong>Clerk</strong> for authentication; <strong>Stripe</strong> for billing. Data is used solely to provide lead intake and routing, dashboard visibility, and subscription management. These vendors&apos; privacy policies apply to their processing.
          </p>
          <p>
            You can request access to or deletion of your data by contacting us. For security and data handling details, see our <Link href="/security" className="font-medium text-primary hover:underline">Security & data</Link> page.
          </p>
          <p>
            We may update this page from time to time. Last updated: 2026.
          </p>
        </section>

        <p className="text-gray-600 mt-10 text-center text-sm">
          <Link href="/contact" className="font-medium text-primary hover:underline">
            Contact us
          </Link>
          {" "}with privacy questions.
        </p>
      </main>

      <MarketingFooter />
    </div>
  );
}
