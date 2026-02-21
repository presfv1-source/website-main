"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { CONTAINER, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AGENT_OPTIONS = [
  { value: "1-5", label: "1-5" },
  { value: "6-15", label: "6-15" },
  { value: "16-30", label: "16-30" },
  { value: "30+", label: "30+" },
] as const;

const BEST_TIME_OPTIONS = [
  { value: "Morning", label: "Morning" },
  { value: "Afternoon", label: "Afternoon" },
  { value: "Evening", label: "Evening" },
] as const;

const inputClassName =
  "h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500";

export function BetaAccessForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brokerage, setBrokerage] = useState("");
  const [city, setCity] = useState("");
  const [agents, setAgents] = useState("");
  const [phone, setPhone] = useState("");
  const [bestTime, setBestTime] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

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
        const data = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
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
    <section id="beta-form" className="py-16 md:py-24 bg-[#0A0F1E]">
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <h2 className="text-white text-3xl md:text-4xl font-bold text-center">
          Request beta access.
        </h2>
        <p className="text-[#94A3B8] text-center mt-2">
          Limited spots. Texas brokerages only (for now).
        </p>

        {status === "success" ? (
          <div className="max-w-lg mx-auto mt-10 rounded-3xl bg-white p-8 md:p-10 shadow-2xl text-center">
            <CheckCircle2
              className="w-12 h-12 text-green-500 mx-auto mb-4"
              aria-hidden
            />
            <h3 className="font-semibold text-gray-900 text-xl mb-2">
              You&apos;re on the list.
            </h3>
            <p className="font-sans text-gray-500 text-sm">
              We&apos;ll reach out within 24 hours.
            </p>
          </div>
        ) : status === "error" ? (
          <div className="max-w-lg mx-auto mt-10 rounded-3xl bg-white p-8 md:p-10 shadow-2xl text-center">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-sans text-gray-700">
                Something went wrong — email us at{" "}
                <a
                  href="mailto:hello@leadhandler.ai"
                  className="text-blue-600 underline"
                >
                  hello@leadhandler.ai
                </a>
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-8 md:p-10 max-w-lg mx-auto mt-10 shadow-2xl space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="beta-name">Full name *</Label>
              <Input
                id="beta-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                disabled={status === "loading"}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beta-email">Email *</Label>
              <Input
                id="beta-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@brokerage.com"
                required
                disabled={status === "loading"}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beta-brokerage">Brokerage name *</Label>
              <Input
                id="beta-brokerage"
                value={brokerage}
                onChange={(e) => setBrokerage(e.target.value)}
                placeholder="Your brokerage"
                required
                disabled={status === "loading"}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beta-city">City *</Label>
              <Input
                id="beta-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                required
                disabled={status === "loading"}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beta-agents">Number of agents *</Label>
              <Select
                value={agents}
                onValueChange={setAgents}
                required
                disabled={status === "loading"}
              >
                <SelectTrigger id="beta-agents" className={cn("w-full", inputClassName)}>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="beta-phone">Phone number *</Label>
              <Input
                id="beta-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                required
                disabled={status === "loading"}
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beta-time">Best time to reach you *</Label>
              <Select
                value={bestTime}
                onValueChange={setBestTime}
                required
                disabled={status === "loading"}
              >
                <SelectTrigger id="beta-time" className={cn("w-full", inputClassName)}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {BEST_TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
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
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-base transition-all min-h-[48px]"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Request beta access
                </>
              ) : (
                "Request beta access"
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
