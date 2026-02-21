import { Navbar } from "@/components/marketing/Navbar";
import { HeroSection } from "@/components/marketing/hero-section";
import { SocialProofStrip } from "@/components/marketing/social-proof-strip";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { StatsBand } from "@/components/marketing/stats-band";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { BetaAccessForm } from "@/components/marketing/BetaAccessForm";
import { Footer } from "@/components/marketing/Footer";
import { FadeUp } from "@/components/marketing/FadeUp";

export const metadata = {
  title: "LeadHandler.ai — Every text lead answered in seconds",
  description:
    "SMS lead response and routing for Texas real estate brokerages. Request beta access.",
};

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--white)]">
      <Navbar />
      <main>
        <FadeUp>
          <HeroSection />
        </FadeUp>
        <FadeUp>
          <SocialProofStrip />
        </FadeUp>
        <FadeUp>
          <HowItWorks />
        </FadeUp>
        <FadeUp>
          <FeaturesGrid />
        </FadeUp>
        <FadeUp>
          <StatsBand />
        </FadeUp>
        <FadeUp>
          <TestimonialsSection />
        </FadeUp>
        <FadeUp>
          <FaqSection />
        </FadeUp>
        <FadeUp>
          <FinalCta />
        </FadeUp>
        <FadeUp>
          <BetaAccessForm />
        </FadeUp>
        <Footer />
      </main>
    </div>
  );
}
