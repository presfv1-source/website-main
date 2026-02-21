"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { FadeUp } from "@/components/marketing/FadeUp";
import { SectionLabel } from "@/components/marketing/SectionLabel";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

const AGENTS_OPTIONS = ["1-5", "6-15", "16-40", "40+"];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brokerage: "",
    email: "",
    phone: "",
    agents: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: [form.brokerage, form.phone, form.agents, form.message].filter(Boolean).join(" | "),
        }),
      });
      const data = await res.json();
      if (data.success !== false) {
        setSubmitted(true);
        toast.success("Message sent! We'll be in touch within a few hours.");
      }
      else setError((data.error as { message?: string })?.message ?? "Something went wrong. Email us at hello@leadhandler.ai.");
    } catch {
      setError("Could not send. Email us at hello@leadhandler.ai.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main>
        <section className="py-12 md:py-16 bg-[#0A0F1E]">
          <div className={cn(CONTAINER, PAGE_PADDING)}>
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              Let&apos;s talk about your brokerage.
            </h1>
          </div>
        </section>
        <FadeUp>
          <section className="py-16 md:py-24 bg-white">
            <div className={cn(CONTAINER, PAGE_PADDING)}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-5xl mx-auto">
                {/* Left column */}
                <div>
                  <SectionLabel className="mb-3">Contact</SectionLabel>
                  <p className="font-sans text-gray-500 text-lg leading-relaxed mb-8">
                    Whether you want a demo, have questions about pricing, or want to talk
                    about your specific setup — we&apos;re here. Real humans, fast replies.
                  </p>
                  <div className="space-y-4 font-sans text-gray-600">
                    <p className="flex items-center gap-3">
                      <span aria-hidden>📧</span>
                      Email:{" "}
                      <a
                        href="mailto:hello@leadhandler.ai"
                        className="text-blue-600 hover:underline"
                      >
                        hello@leadhandler.ai
                      </a>
                    </p>
                    <p className="flex items-center gap-3">
                      <span aria-hidden>📍</span>
                      Location: Houston, TX
                    </p>
                    <p className="flex items-center gap-3">
                      <span aria-hidden>⏱</span>
                      Response time: Usually within a few hours
                    </p>
                  </div>
                  <Link
                    href="/demo"
                    className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-sans font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Or book a demo call →
                  </Link>
                </div>

                {/* Right column — form */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-2xl max-w-md lg:max-w-none mx-auto lg:mx-0">
                  {submitted ? (
                    <div className="text-center py-8">
                      <p className="font-display font-semibold text-[#0A0A0A] text-xl mb-2">
                        Thanks!
                      </p>
                      <p className="font-sans text-gray-500">
                        We&apos;ll be in touch within a few hours.
                      </p>
                    </div>
                  ) : (
                    <>
                      {error && (
                        <p className="text-sm text-red-600 font-sans mb-4">{error}</p>
                      )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-sans font-medium text-gray-700 mb-1"
                        >
                          Full name
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                          className="w-full h-11 rounded-xl border border-gray-200 px-4 py-3 font-sans text-[#0A0A0A] focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="brokerage"
                          className="block text-sm font-sans font-medium text-gray-700 mb-1"
                        >
                          Brokerage name
                        </label>
                        <input
                          id="brokerage"
                          type="text"
                          required
                          value={form.brokerage}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, brokerage: e.target.value }))
                          }
                          className="w-full h-11 rounded-xl border border-gray-200 px-4 py-3 font-sans text-[#0A0A0A] focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Your brokerage"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-sans font-medium text-gray-700 mb-1"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                          className="w-full h-11 rounded-xl border border-gray-200 px-4 py-3 font-sans text-[#0A0A0A] focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="you@brokerage.com"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-sans font-medium text-gray-700 mb-1"
                        >
                          Phone <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                          className="w-full h-11 rounded-xl border border-gray-200 px-4 py-3 font-sans text-[#0A0A0A] focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="(555) 000-0000"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="agents"
                          className="block text-sm font-sans font-medium text-gray-700 mb-1"
                        >
                          Number of agents
                        </label>
                        <select
                          id="agents"
                          value={form.agents}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, agents: e.target.value }))
                          }
                          className="w-full h-11 rounded-xl border border-gray-200 px-4 py-3 font-sans text-[#0A0A0A] focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                          <option value="">Select</option>
                          {AGENTS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-sans font-medium text-gray-700 mb-1"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, message: e.target.value }))
                          }
                          className="w-full h-11 min-h-[100px] rounded-xl border border-gray-200 px-4 py-3 font-sans text-[#0A0A0A] focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          placeholder="How can we help?"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl px-6 py-3 font-sans font-semibold bg-blue-600 text-white hover:bg-blue-500 min-h-[48px] disabled:opacity-70 transition-all"
                      >
                        {loading ? "Sending…" : "Send message →"}
                      </button>
                    </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </FadeUp>

        <FadeUp>
          <section className="py-12 md:py-16 bg-[#F8FAFC] border-t border-gray-200">
            <div className={cn(CONTAINER, PAGE_PADDING)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div>
                  <h3 className="font-display font-semibold text-[#0A0A0A] mb-2">
                    How fast can I get started?
                  </h3>
                  <p className="font-sans text-gray-500 text-sm leading-relaxed">
                    You can be live in under 30 minutes. We&apos;ll help you connect your
                    lead sources and set up routing.
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[#0A0A0A] mb-2">
                    Do you offer demos?
                  </h3>
                  <p className="font-sans text-gray-500 text-sm leading-relaxed">
                    Yes. Book a call and we&apos;ll walk you through the full platform with
                    your own brokerage in mind.
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[#0A0A0A] mb-2">
                    How do I get beta access?
                  </h3>
                  <p className="font-sans text-gray-500 text-sm leading-relaxed">
                    Request access via the signup page. We&apos;re onboarding a limited number of brokerages during beta.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </FadeUp>
        <Footer />
      </main>
    </div>
  );
}
