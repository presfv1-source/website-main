import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Features } from "@/components/marketing/Features";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Pricing } from "@/components/marketing/Pricing";
import { CtaBanner } from "@/components/marketing/CtaBanner";
import { Footer } from "@/components/marketing/Footer";
import { FadeUp } from "@/components/marketing/FadeUp";

export const metadata = {
  title: "LeadHandler.ai — Respond first. Close more.",
  description:
    "SMS lead response and routing for real estate brokerages. Request beta access.",
};

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main>
        <FadeUp>
          <Hero />
        </FadeUp>
        <FadeUp>
          <TrustBar />
        </FadeUp>
        <FadeUp>
          <HowItWorks />
        </FadeUp>
        <FadeUp>
          <Features />
        </FadeUp>
        <FadeUp>
          <Testimonials />
        </FadeUp>
        <FadeUp>
          <Pricing />
        </FadeUp>
        <FadeUp>
          <CtaBanner />
        </FadeUp>
        <Footer />
      </main>
    </div>
  );
}
