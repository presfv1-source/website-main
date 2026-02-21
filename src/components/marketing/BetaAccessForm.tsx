"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

const AGENT_OPTIONS = [
  { value: "", label: "Select" },
  { value: "1-5", label: "1–5" },
  { value: "6-15", label: "6–15" },
  { value: "16-30", label: "16–30" },
  { value: "30+", label: "30+" },
];

const BEST_TIME_OPTIONS = [
  { value: "", label: "Select time" },
  { value: "Morning", label: "Morning (8am–12pm)" },
  { value: "Afternoon", label: "Afternoon (12–5pm)" },
  { value: "Evening", label: "Evening (5–8pm)" },
];

const inputClass =
  "w-full rounded-lg border-[1.5px] border-[var(--border)] bg-[var(--off)] px-3 py-2.5 text-[13.5px] text-[var(--ink)] outline-none transition-all duration-[0.14s] placeholder:text-[var(--subtle)] focus:border-[var(--ink)] focus:bg-[var(--white)] focus:shadow-[0_0_0_3px_rgba(17,17,17,.08)]";

export function BetaAccessForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brokerage, setBrokerage] = useState("");
  const [city, setCity] = useState("");
  const [agents, setAgents] = useState("");
  const [phone, setPhone] = useState("");
  const [bestTime, setBestTime] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !name.trim() ||
      !email.trim() ||
      !brokerage.trim() ||
      !city.trim() ||
      !agents ||
      !phone.trim() ||
      !bestTime
    ) {
      return;
    }
    setStatus("loading");
    try {
      const source = [
        `Brokerage: ${brokerage.trim()}`,
        `City: ${city.trim()}`,
        `Agents: ${agents}`,
        `Phone: ${phone.trim()}`,
        `Best time: ${bestTime}`,
      ].join("; ");
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          source,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        console.error("[BetaAccessForm] waitlist error:", data);
        setStatus("error");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setBrokerage("");
      setCity("");
      setAgents("");
      setPhone("");
      setBestTime("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="form" className="py-24 px-4 sm:px-8 bg-[var(--off)]">
      <div className="mx-auto max-w-[1100px]">
        <div className="mx-auto max-w-[520px] rounded-[20px] border border-[var(--border)] bg-[var(--white)] p-11">
          <h2 className="text-[22px] font-black tracking-[-0.5px] text-[var(--ink)] mb-1.5">
            Request beta access
          </h2>
          <p className="text-[13.5px] text-[var(--muted)] mb-7">
            Limited spots. We&apos;ll reach out within 24 hours.
          </p>

          {status === "success" ? (
            <div className="py-8 text-center">
              <CheckCircle2
                className="mx-auto mb-4 h-12 w-12 text-[var(--muted)]"
                aria-hidden
              />
              <h3 className="text-lg font-bold text-[var(--ink)] mb-2">You&apos;re on the list.</h3>
              <p className="text-sm text-[var(--muted)]">
                We&apos;ll reach out within 24 hours.
              </p>
            </div>
          ) : status === "error" ? (
            <div className="rounded-xl border border-[var(--border2)] bg-[var(--off)] p-6 text-center">
              <p className="text-[13.5px] text-[var(--ink)]">
                Something went wrong — email us at{" "}
                <a
                  href="mailto:hello@leadhandler.ai"
                  className="text-[var(--ink)] underline"
                >
                  hello@leadhandler.ai
                </a>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="beta-name" className="text-[12px] font-bold text-[var(--ink2)] tracking-[-0.1px]">
                  Full name
                </label>
                <input
                  id="beta-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  disabled={status === "loading"}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="beta-email" className="text-[12px] font-bold text-[var(--ink2)] tracking-[-0.1px]">
                  Email
                </label>
                <input
                  id="beta-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@brokerage.com"
                  required
                  disabled={status === "loading"}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="beta-brokerage" className="text-[12px] font-bold text-[var(--ink2)] tracking-[-0.1px]">
                  Brokerage
                </label>
                <input
                  id="beta-brokerage"
                  type="text"
                  value={brokerage}
                  onChange={(e) => setBrokerage(e.target.value)}
                  placeholder="Your brokerage name"
                  required
                  disabled={status === "loading"}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="beta-city" className="text-[12px] font-bold text-[var(--ink2)] tracking-[-0.1px]">
                  City
                </label>
                <input
                  id="beta-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Houston"
                  required
                  disabled={status === "loading"}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="beta-agents" className="text-[12px] font-bold text-[var(--ink2)] tracking-[-0.1px]">
                  Number of agents
                </label>
                <select
                  id="beta-agents"
                  value={agents}
                  onChange={(e) => setAgents(e.target.value)}
                  required
                  disabled={status === "loading"}
                  className={inputClass}
                >
                  {AGENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="beta-phone" className="text-[12px] font-bold text-[var(--ink2)] tracking-[-0.1px]">
                  Phone number
                </label>
                <input
                  id="beta-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (713) 000-0000"
                  required
                  disabled={status === "loading"}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="beta-time" className="text-[12px] font-bold text-[var(--ink2)] tracking-[-0.1px]">
                  Best time to reach you
                </label>
                <select
                  id="beta-time"
                  value={bestTime}
                  onChange={(e) => setBestTime(e.target.value)}
                  required
                  disabled={status === "loading"}
                  className={inputClass}
                >
                  {BEST_TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={
                  status === "loading" ||
                  !name.trim() ||
                  !email.trim() ||
                  !brokerage.trim() ||
                  !city.trim() ||
                  !agents ||
                  !phone.trim() ||
                  !bestTime
                }
                className="mt-1.5 w-full rounded-[10px] bg-[var(--ink)] py-3 text-sm font-bold text-white transition-opacity duration-[0.14s] disabled:opacity-50 sm:col-span-2"
              >
                {status === "loading" ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Request beta access
                  </span>
                ) : (
                  "Request beta access"
                )}
              </button>
            </form>
          )}
          <p className="mt-4 text-center text-[11.5px] text-[var(--subtle)]">
            No spam, ever. Texas brokerages only for now.
          </p>
        </div>
      </div>
    </section>
  );
}
