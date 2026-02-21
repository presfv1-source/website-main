import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { WhyThisMatters } from "@/components/marketing/WhyThisMatters";
import { Features } from "@/components/marketing/Features";
import { BetaProofFaq } from "@/components/marketing/BetaProofFaq";
import { BetaAccessForm } from "@/components/marketing/BetaAccessForm";
import { Footer } from "@/components/marketing/Footer";
import { FadeUp } from "@/components/marketing/FadeUp";

export const metadata = {
  title: "LeadHandler.ai — Every text lead answered in seconds, routed to the right agent.",
  description:
    "SMS lead response and routing for real estate brokerages. Request beta access.",
};

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <main>
        <FadeUp>
          <Hero />
        </FadeUp>
        <FadeUp>
          <HowItWorks />
        </FadeUp>
        <FadeUp>
          <WhyThisMatters />
        </FadeUp>
        <FadeUp>
          <Features />
        </FadeUp>
        <FadeUp>
          <BetaProofFaq />
        </FadeUp>
        <FadeUp>
          <BetaAccessForm />
        </FadeUp>
        <Footer />
      </main>
    </div>
  );
}
