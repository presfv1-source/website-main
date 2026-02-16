"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, User, Eye, EyeOff, Loader2 } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const DEV_EMAIL =
  typeof process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL === "string" &&
  process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL.trim() !== ""
    ? process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL.trim()
    : "presfv1@gmail.com";

type Role = "owner" | "agent";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get("demo") === "true";

  const [email, setEmail] = useState(DEV_EMAIL);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [demoRoleLoading, setDemoRoleLoading] = useState<Role | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error?.message ?? "Invalid email or password");
        setLoading(false);
        return;
      }
      toast.success("Welcome back!");
      router.push("/app/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleDemoContinue(role: Role) {
    setDemoRoleLoading(role);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error?.message ?? "Something went wrong");
        setDemoRoleLoading(null);
        return;
      }
      toast.success("Demo mode—welcome!");
      router.push("/app/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
      setDemoRoleLoading(null);
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
            {isDemoMode ? "Enter demo mode" : "Sign in to LeadHandler.ai"}
          </CardTitle>
          <CardDescription>
            {isDemoMode
              ? "Choose a role to preview the app."
              : "Broker login — use your email and password."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {isDemoMode ? (
              <motion.div
                key="demo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => handleDemoContinue("owner")}
                  disabled={demoRoleLoading !== null}
                >
                  <Building2 className="size-4 mr-2" aria-hidden />
                  {demoRoleLoading === "owner" ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : null}
                  Continue as Broker
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => handleDemoContinue("agent")}
                  disabled={demoRoleLoading !== null}
                >
                  <User className="size-4 mr-2" aria-hidden />
                  {demoRoleLoading === "agent" ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : null}
                  Continue as Agent
                </Button>
                <p className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Back to broker login
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
              </motion.form>
            )}
          </AnimatePresence>

          {!isDemoMode && (
            <p className="text-center text-sm text-muted-foreground pt-2">
              Want to preview?{" "}
              <Link
                href="/login?demo=true"
                className="font-medium text-primary hover:underline"
              >
                Enter Demo Mode
              </Link>
            </p>
          )}
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
