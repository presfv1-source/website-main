import Link from "next/link";
import { MessageSquare, Route, Users, LayoutDashboard } from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { SectionLabel } from "@/components/marketing/SectionLabel";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { HOW_IT_WORKS_STEPS } from "@/lib/marketingContent";

const stepIcons = [Users, MessageSquare, Route, LayoutDashboard];

export const metadata = {
  title: "LeadHandler.ai — How it works",
  description:
    "SMS lead response and routing for real estate brokerages. From first text to routed conversation — all logged.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <section className="py-12 md:py-16 bg-gray-950">
        <div className={cn(CONTAINER, PAGE_PADDING)}>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
            From first text to agent in seconds.
          </h1>
        </div>
      </section>
      <main className={cn(CONTAINER, PAGE_PADDING, "flex-1 py-16 md:py-24")}>
        <div className="max-w-2xl mx-auto text-center mb-14">
          <SectionLabel className="mb-3">How it works</SectionLabel>
          <p className="font-sans text-gray-600 text-lg leading-relaxed">
            From first text to routed conversation — all logged.
          </p>
        </div>

        <ol className="space-y-10 md:space-y-14 max-w-3xl mx-auto">
          {HOW_IT_WORKS_STEPS.map((step, i) => {
            const Icon = stepIcons[i] ?? Users;
            return (
              <li key={step.title} className="flex gap-6 md:gap-8">
                <div className="flex shrink-0 w-14 h-14 rounded-full bg-blue-50 ring-4 ring-blue-50 flex items-center justify-center text-blue-600">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <div className="min-w-0 pt-1">
                  <span className="text-xs font-sans font-bold uppercase tracking-widest text-blue-600">
                    Step {i + 1}
                  </span>
                  <h2 className="font-display font-semibold text-[#0A0A0A] text-xl mt-2">
                    {step.title}
                  </h2>
                  <p className="font-sans text-gray-500 mt-2 leading-relaxed">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-14 text-center">
          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-full px-8 py-3.5 font-sans font-semibold bg-blue-600 text-white hover:bg-blue-500 min-h-[48px] transition-all"
          >
            Try demo →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
