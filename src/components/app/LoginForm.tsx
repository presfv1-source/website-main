"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const DEV_EMAIL =
  typeof process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL === "string" &&
  process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL.trim() !== ""
    ? process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL.trim()
    : "presfv1@gmail.com";

const DEFAULT_CALLBACK = "/app/dashboard";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl")?.trim() || DEFAULT_CALLBACK;
  const [email, setEmail] = useState(DEV_EMAIL);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    const code = searchParams.get("code");
    if (code === "AccountNotFound") {
      toast.error("Account not found — contact support.");
      return;
    }
    if (error === "OAuthAccountNotLinked" || error === "OAuthCallback" || error === "Callback" || error === "OAuthCreateAccount") {
      toast.error("OAuth failed. Try again or use email/password.");
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        callbackUrl,
        redirect: false,
      });
      if (res?.error || res?.status === 401 || !res?.ok) {
        let message = "Invalid email or password.";
        if (res?.url) {
          try {
            const u = new URL(res.url, window.location.origin);
            if (u.searchParams.get("code") === "AccountNotFound") message = "Account not found — contact support.";
          } catch {
            // ignore
          }
        }
        toast.error(message);
        return;
      }
      toast.success("Welcome back!");
      const url = res?.url ?? callbackUrl;
      window.location.href = url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      toast.error("OAuth failed");
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
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@brokerage.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => handleOAuth("google")}
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => handleOAuth("apple")}
              >
                Apple
              </Button>
            </div>
          </motion.form>
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
