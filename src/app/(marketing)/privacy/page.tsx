import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { SectionLabel } from "@/components/marketing/SectionLabel";
import { CONTAINER_NARROW, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--white)]">
      <Navbar />

      <section className="py-16 md:py-20 bg-[var(--off)]">
        <div className={cn(CONTAINER_NARROW, PAGE_PADDING, "text-center max-w-2xl mx-auto")}>
          <SectionLabel className="mb-3">Privacy</SectionLabel>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.5px] text-[var(--ink)]">
            Privacy
          </h1>
          <p className="mt-4 text-[var(--muted)] text-base sm:text-lg leading-relaxed">
            How we collect, use, and protect your information.
          </p>
        </div>
      </section>

      <main className={cn(CONTAINER_NARROW, PAGE_PADDING, "flex-1 py-16 md:py-24")}>
        <section className="mt-8 space-y-6 text-sm text-[var(--muted)] leading-relaxed">
          <p>
            LeadHandler.ai (&quot;we&quot;) processes data you provide when using our service, including brokerage and agent information, lead and contact data, and messages. We use this to deliver SMS lead response and routing, dashboard visibility, and billing.
          </p>
          <p>
            We do not sell your data to third parties for marketing. We use our SMS provider for delivery and receipt; <strong className="text-[var(--ink)]">Airtable</strong> for storing brokerages, agents, leads, and messages; <strong className="text-[var(--ink)]">Clerk</strong> for authentication; <strong className="text-[var(--ink)]">Stripe</strong> for billing. Data is used solely to provide lead intake and routing, dashboard visibility, and subscription management. These vendors&apos; privacy policies apply to their processing.
          </p>
          <p>
            You can request access to or deletion of your data by contacting us. For security and data handling details, see our <Link href="/security" className="font-medium text-[var(--ink)] hover:underline">Security & data</Link> page.
          </p>
          <p>
            We may update this page from time to time. Last updated: 2026.
          </p>
        </section>

        <p className="text-[var(--muted)] mt-10 text-center text-sm">
          <Link href="/contact" className="font-medium text-[var(--ink)] hover:underline">
            Contact us
          </Link>
          {" "}with privacy questions.
        </p>
      </main>

      <Footer />
    </div>
  );
}
