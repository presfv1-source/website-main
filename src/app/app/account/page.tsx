"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  User,
  LogOut,
  Building2,
  Database,
  Bell,
  Shield,
  Upload,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { DemoAirtableModal } from "@/components/app/DemoAirtableModal";

const NOTIFY_ESCALATIONS_KEY = "leadhandler-pref-escalations";
const NOTIFY_NEW_LEADS_KEY = "leadhandler-pref-new-leads";

function roleLabel(role: string | undefined): string {
  if (role === "owner") return "Owner";
  if (role === "broker") return "Broker";
  if (role === "agent") return "Agent";
  return "User";
}

function getStoredBool(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const v = sessionStorage.getItem(key);
    if (v === "true") return true;
    if (v === "false") return false;
  } catch {
    // ignore
  }
  return fallback;
}

function setStoredBool(key: string, value: boolean) {
  try {
    sessionStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
}

export default function AccountPage() {
  const router = useRouter();
  const [session, setSession] = useState<{
    name?: string;
    role: string;
    effectiveRole?: string;
    demoEnabled?: boolean;
  } | null>(null);
  const [demoEnabled, setDemoEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [notifyEscalations, setNotifyEscalations] = useState(true);
  const [notifyNewLeads, setNotifyNewLeads] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/firebase/session", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/demo/state", { credentials: "include" }).then((r) => r.json()),
    ]).then(([sessionRes, demoRes]) => {
      if (sessionRes.success && sessionRes.data) {
        const data = sessionRes.data as { role?: string; effectiveRole?: string; name?: string; demoEnabled?: boolean; userId?: string };
        const role = data.role ?? "broker";
        setSession({ ...data, role, effectiveRole: data.effectiveRole ?? role });
        setEditName(data.name ?? "");
        // Persist view-as across navigations: if owner and we have viewAsRole in sessionStorage, re-apply cookie and sync state
        if (role === "owner" && typeof window !== "undefined") {
          try {
            const stored = sessionStorage.getItem("viewAsRole");
            const viewAs = stored === "owner" || stored === "broker" || stored === "agent" ? stored : null;
            if (viewAs && viewAs !== (data.effectiveRole ?? role)) {
              document.cookie = `lh_view_as=${viewAs}; path=/; max-age=86400`;
              setSession((prev) => (prev ? { ...prev, effectiveRole: viewAs } : null));
            }
          } catch {
            // ignore
          }
        }
      }
      if (demoRes.success && demoRes.data?.enabled != null) setDemoEnabled(demoRes.data.enabled);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setNotifyEscalations(getStoredBool(NOTIFY_ESCALATIONS_KEY, true));
    setNotifyNewLeads(getStoredBool(NOTIFY_NEW_LEADS_KEY, true));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    toast.success("You have been logged out");
    window.location.href = "/login";
  }

  async function handleDemoToggle(checked: boolean) {
    try {
      const res = await fetch("/api/demo/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: checked }),
      });
      const data = await res.json();
      if (data.success) {
        setDemoEnabled(checked);
        toast.success(checked ? "Demo mode on" : "Demo mode off");
        router.refresh();
      } else {
        toast.error("Could not update demo mode");
      }
    } catch {
      toast.error("Could not update demo mode");
    }
  }

  function setViewAsCookie(role: string) {
    document.cookie = `lh_view_as=${role}; path=/; max-age=86400`;
  }

  function handleViewAsSwitch(role: "owner" | "broker" | "agent") {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("viewAsRole", role);
      setViewAsCookie(role);
    }
    setSession((prev) => (prev ? { ...prev, effectiveRole: role } : null));
    toast.success(`Switched to ${roleLabel(role)} view`);
    // Allow cookie to be sent on next request
    requestAnimationFrame(() => router.refresh());
  }

  function handleNameSave() {
    if (editName.trim() === (session?.name ?? "").trim()) return;
    fetch("/api/auth/firebase/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: editName.trim() }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSession((prev) => (prev ? { ...prev, name: editName.trim() } : null));
          toast.success("Profile updated");
          router.refresh();
        } else {
          toast.error(data.error?.message ?? "Could not update name");
        }
      })
      .catch(() => toast.error("Could not update name"));
  }

  function handleNotifyEscalations(checked: boolean) {
    setNotifyEscalations(checked);
    setStoredBool(NOTIFY_ESCALATIONS_KEY, checked);
    toast.success(checked ? "Escalation notifications on" : "Escalation notifications off");
  }

  function handleNotifyNewLeads(checked: boolean) {
    setNotifyNewLeads(checked);
    setStoredBool(NOTIFY_NEW_LEADS_KEY, checked);
    toast.success(checked ? "New lead notifications on" : "New lead notifications off");
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const effectiveRole = session?.effectiveRole ?? session?.role;
  const displayName =
    session?.demoEnabled === false
      ? roleLabel(effectiveRole)
      : (session?.name ?? (editName || "User"));
  const initials = (session?.name ?? (editName || "User"))
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground mt-1">Profile and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <p className="text-sm text-muted-foreground">Your name and avatar</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="gap-2 min-h-[44px]" disabled aria-label="Avatar upload coming soon">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
            <div className="flex-1 w-full min-w-0 space-y-2">
              <Label htmlFor="profile-name">Display name</Label>
              <div className="flex gap-2">
                <Input
                  id="profile-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  className="max-w-xs h-10"
                />
                <Button size="sm" onClick={handleNameSave} className="min-h-[40px]">
                  Save
                </Button>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{roleLabel(session?.role)}</p>
        </CardContent>
      </Card>

      {/* View as (preview) — owner only; always visible so owner can switch back. Persists via cookie + sessionStorage. */}
      {session?.role === "owner" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">View as (preview)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Preview the app as Broker or Agent. Navigation and some UI will match the selected view. You can switch back to Owner anytime.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={effectiveRole === "owner" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewAsSwitch("owner")}
                className="min-h-[44px]"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Owner
              </Button>
              <Button
                variant={effectiveRole === "broker" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewAsSwitch("broker")}
                className="min-h-[44px]"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Broker
              </Button>
              <Button
                variant={effectiveRole === "agent" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewAsSwitch("agent")}
                className="min-h-[44px]"
              >
                <User className="h-4 w-4 mr-2" />
                Agent
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Choose what you want to be notified about</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="notify-escalations" className="font-medium">Escalations</Label>
              <p className="text-xs text-muted-foreground">When a lead is escalated</p>
            </div>
            <Switch
              id="notify-escalations"
              checked={notifyEscalations}
              onCheckedChange={handleNotifyEscalations}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="notify-new-leads" className="font-medium">New leads</Label>
              <p className="text-xs text-muted-foreground">When a new lead is assigned to you</p>
            </div>
            <Switch
              id="notify-new-leads"
              checked={notifyNewLeads}
              onCheckedChange={handleNotifyNewLeads}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Security</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Password and two-factor authentication</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Change password</p>
                <p className="text-xs text-muted-foreground">Use the link below to reset your password</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="min-h-[44px] shrink-0">
              <Link href="/forgot-password">Change password</Link>
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4 opacity-70">
            <div>
              <p className="font-medium">Two-factor authentication (2FA)</p>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Switch disabled aria-label="2FA coming soon" />
          </div>
        </CardContent>
      </Card>

      {/* Integrations (broker only: Demo) + Log out */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrations</CardTitle>
          <p className="text-sm text-muted-foreground">
            {session?.role === "owner" ? "Demo lead sync and Airtable info" : "Account actions"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {session?.role === "owner" && (
            <>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="demo-toggle">Demo Mode</Label>
                  <p className="text-xs text-muted-foreground">Use demo data when lead sync is not connected.</p>
                </div>
                <Switch
                  id="demo-toggle"
                  checked={demoEnabled ?? false}
                  onCheckedChange={handleDemoToggle}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setDemoModalOpen(true)}
                className="w-full justify-center gap-2 min-h-[44px]"
              >
                <Database className="h-4 w-4" />
                View Demo Airtable Info
              </Button>
            </>
          )}
          <Button variant="destructive" onClick={handleLogout} className="w-full min-h-[44px]">
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </CardContent>
      </Card>

      <DemoAirtableModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
    </div>
  );
}
