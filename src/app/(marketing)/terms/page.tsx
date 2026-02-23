import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { SectionLabel } from "@/components/marketing/SectionLabel";
import { CONTAINER_NARROW, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--white)]">
      <Navbar />

      <section className="py-16 md:py-20 bg-[var(--off)]">
        <div className={cn(CONTAINER_NARROW, PAGE_PADDING, "text-center max-w-2xl mx-auto")}>
          <SectionLabel className="mb-3">Terms</SectionLabel>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.5px] text-[var(--ink)]">
            Terms of service
          </h1>
          <p className="mt-4 text-[var(--muted)] text-base sm:text-lg leading-relaxed">
            Terms governing your use of LeadHandler.ai.
          </p>
        </div>
      </section>

      <main className={cn(CONTAINER_NARROW, PAGE_PADDING, "flex-1 py-16 md:py-24")}>
        <section className="mt-8 space-y-6 text-sm text-[var(--muted)] leading-relaxed">
          <p>
            By using LeadHandler.ai you agree to use the service in compliance with applicable law and not to misuse it (e.g. spam, unauthorized access, or abuse of messaging). You are responsible for your account and the data you provide.
          </p>
          <h2 className="font-semibold text-[var(--ink)] mt-6">SMS and messaging</h2>
          <p>
            LeadHandler sends and receives SMS on your behalf via our SMS provider. By adding leads and using the platform, you represent that you have obtained consent from recipients to receive SMS from your brokerage. Message frequency varies by lead activity; typical use includes initial intake and follow-up. Recipients may opt out at any time by replying <strong className="text-[var(--ink)]">STOP</strong> to any message; we and our carriers support standard opt-out keywords. Message and data rates may apply. Our SMS practices comply with applicable A2P (application-to-person) and carrier requirements.
          </p>
          <p>
            The service is provided as-is. We do our best to keep it available and secure but do not guarantee uninterrupted service. Billing is handled via Stripe; subscription terms and cancellation follow your plan and our billing page.
          </p>
          <p>
            We may update these terms; continued use after changes constitutes acceptance.
          </p>
          <p>
            <strong className="text-[var(--ink)]">LeadHandler.ai</strong> — Houston, TX. Contact:{" "}
            <a href="mailto:hello@leadhandler.ai" className="font-medium text-[var(--ink)] hover:underline">hello@leadhandler.ai</a>. Last updated: 2026.
          </p>
        </section>

        <p className="text-[var(--muted)] mt-10 text-center text-sm">
          <Link href="/contact" className="font-medium text-[var(--ink)] hover:underline">
            Contact us
          </Link>
          {" "}with questions.
        </p>
      </main>

      <Footer />
    </div>
  );
}
