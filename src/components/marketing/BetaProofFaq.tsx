"use client";

import { Settings, MessageCircle, BadgeDollarSign } from "lucide-react";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BETA_BULLETS = [
  {
    icon: Settings,
    text: "Full setup support — we help you configure your number and routing rules",
  },
  {
    icon: MessageCircle,
    text: "Direct access to the founder — feedback shapes the product",
  },
  {
    icon: BadgeDollarSign,
    text: "Beta pricing locked in for the life of your subscription",
  },
];

const FAQ_ITEMS = [
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
];

export function BetaProofFaq() {
  return (
    <section id="beta" className="py-16 md:py-24 bg-white">
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <div className="text-center mb-8">
          <SectionLabel className="mb-3">Beta access</SectionLabel>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Beta — limited spots in Texas.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {BETA_BULLETS.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="bg-blue-600 text-white rounded-2xl p-6"
            >
              <Icon className="h-8 w-8 text-white mb-3" aria-hidden />
              <p className="text-sm font-sans leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`faq-${i}`}
                className="border-b border-gray-100"
              >
                <AccordionTrigger className="text-left font-medium text-gray-900 py-4 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500 text-sm pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
