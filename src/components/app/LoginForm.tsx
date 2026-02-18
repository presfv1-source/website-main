"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

const DEFAULT_CALLBACK = "/app/dashboard";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl")?.trim() || DEFAULT_CALLBACK;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/firebase/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data?.data) {
          router.replace(callbackUrl || "/app/dashboard");
        }
      })
      .catch(() => {});
  }, [callbackUrl, router]);

  async function createSession(idToken: string): Promise<boolean> {
    const res = await fetch("/api/auth/firebase/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      toast.error(data?.error ?? "Session failed. Try again.");
      return false;
    }
    return true;
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const ok = await createSession(idToken);
      if (ok) {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Google sign-in failed.";
      toast.error(msg.includes("popup") ? "Sign-in was cancelled or blocked." : "Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApple() {
    setLoading(true);
    try {
      const provider = new OAuthProvider("apple.com");
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const ok = await createSession(idToken);
      if (ok) {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Apple sign-in failed.";
      toast.error(msg.includes("popup") ? "Sign-in was cancelled or blocked." : "Apple sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xl font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <Building2 className="size-6" aria-hidden />
          LeadHandler.ai
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          SMS Lead Response &amp; Routing
        </p>
      </div>

      <Card className="border-border shadow-lg rounded-xl bg-card">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Broker Login
          </CardTitle>
          <CardDescription>
            Sign in to LeadHandler.ai
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            Use Google or Apple to continue. Email/password coming soon.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={handleGoogle}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Google"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={handleApple}
              disabled={loading}
            >
              Apple
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        <Link
          href="/"
          className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Back to home
        </Link>
      </p>
    </motion.div>
  );
}
