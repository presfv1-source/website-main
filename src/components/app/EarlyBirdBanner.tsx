"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "leadhandler-earlybird-dismissed";
const SPOTS_LEFT = 12;

interface EarlyBirdBannerProps {
  className?: string;
}

export function EarlyBirdBanner({ className }: EarlyBirdBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") setDismissed(true);
    } catch {
      // keep default
    }
  }, []);

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      setDismissed(true);
    } catch {
      setDismissed(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          source: "early_bird_banner",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (dismissed) return null;

  return (
    <>
      <div
        role="banner"
        className={cn(
          "relative flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-600/30 bg-blue-600 px-4 py-3 pr-12 text-sm text-white shadow-sm",
          className
        )}
      >
        <p className="font-bold">
          <strong>Limited Beta Launch:</strong> <strong>{SPOTS_LEFT} spots left</strong> — Lock in{" "}
          <strong>$99/mo Essentials</strong> (up to 15 agents) or <strong>$249/mo Pro</strong> (up to 40+, advanced
          routing & analytics) before $349/$749. <strong>14-day trial, no card needed.</strong>{" "}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex font-semibold underline underline-offset-2 hover:no-underline"
          >
            Claim Beta Spot →
          </button>
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white hover:bg-white/20 hover:text-white"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Claim your beta spot</DialogTitle>
            <DialogDescription>
              Join the waitlist. We&apos;ll reach out when you can get started.
            </DialogDescription>
          </DialogHeader>
          {submitted ? (
            <p className="text-sm text-muted-foreground py-4">
              Thanks! We&apos;ve added you to the waitlist. We&apos;ll be in touch soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="waitlist-email">Email *</Label>
                <Input
                  id="waitlist-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@brokerage.com"
                  disabled={submitting}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waitlist-name">Name (optional)</Label>
                <Input
                  id="waitlist-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={submitting}
                  autoComplete="name"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Joining…" : "Join waitlist"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
