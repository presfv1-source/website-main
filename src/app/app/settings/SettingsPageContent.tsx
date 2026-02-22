"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import type { Agent } from "@/lib/types";
import type { Brokerage } from "@/lib/types";
import { DevTestToolsSection } from "@/components/app/DevTestToolsSection";
import { DemoToggle } from "@/components/app/DemoToggle";

interface SettingsPageContentProps {
  session: { name?: string; email?: string; role?: string; platformRole?: string | null } | null;
  brokerage: Brokerage;
  agents: Agent[];
  demoEnabled?: boolean;
  devToolsPhone: string;
  integrationStatus?: { twilio: boolean; airtable: boolean; make: boolean; stripe?: boolean };
}

const INTEGRATION_OWNER_HELPER =
  "Add the required environment variables in your Vercel project settings.";
const INTEGRATION_NON_OWNER_HELPER =
  "Contact your administrator to connect this integration.";

interface AdvancedOwnerSectionProps {
  isOwner: boolean;
  demoEnabled: boolean;
  integrationStatus: { twilio: boolean; airtable: boolean; make: boolean; stripe?: boolean };
  devToolsPhone: string;
  qualPrompt: string;
  setQualPrompt: (v: string) => void;
  firstMsg: string;
  setFirstMsg: (v: string) => void;
  followUpMsg: string;
  setFollowUpMsg: (v: string) => void;
  INTEGRATION_OWNER_HELPER: string;
  INTEGRATION_NON_OWNER_HELPER: string;
}

function AdvancedOwnerSection({
  demoEnabled,
  integrationStatus,
  devToolsPhone,
  qualPrompt,
  setQualPrompt,
  firstMsg,
  setFirstMsg,
  followUpMsg,
  setFollowUpMsg,
  INTEGRATION_OWNER_HELPER,
  INTEGRATION_NON_OWNER_HELPER,
}: AdvancedOwnerSectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="rounded-2xl border-[#e2e2e2]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left font-sans"
        aria-expanded={open}
      >
        <span className="font-display font-semibold text-[#222222]">Advanced (Owner Only)</span>
        {open ? <ChevronUp className="h-5 w-5 text-[#a0a0a0]" /> : <ChevronDown className="h-5 w-5 text-[#a0a0a0]" />}
      </button>
      {open && (
        <CardContent className="pt-0 space-y-6 border-t border-[#e2e2e2]">
          <div className="space-y-4">
            <p className="text-sm font-display font-semibold text-[#111111]">Demo mode</p>
            <DemoToggle demoEnabled={demoEnabled} disabled={false} className="max-w-xs" />
          </div>
          <div className="space-y-4">
            <p className="text-sm font-display font-semibold text-[#111111]">Integration details</p>
            {[
              { key: "twilio", name: "Twilio (SMS)", configured: integrationStatus.twilio, detail: devToolsPhone },
              { key: "airtable", name: "Airtable", configured: integrationStatus.airtable, detail: "Base linked" },
              { key: "make", name: "Make.com", configured: integrationStatus.make, detail: "Webhook URL" },
            ].map((int) => {
              const status = int.configured ? "Connected" : "Not configured";
              const helperText = int.configured ? int.detail : INTEGRATION_OWNER_HELPER;
              return (
                <div key={int.key} className="rounded-xl border border-[#e2e2e2] p-4">
                  <p className="font-sans font-semibold text-[#111111]">{int.name}</p>
                  {int.configured && int.detail && <p className="text-sm text-[#a0a0a0] font-sans">{int.detail}</p>}
                  {!int.configured && <p className="text-sm text-[#a0a0a0] font-sans">{helperText}</p>}
                  <span className={`text-sm font-sans ${int.configured ? "text-green-600" : "text-amber-600"}`}>{status}</span>
                </div>
              );
            })}
            <div className="rounded-xl border border-[#e2e2e2] p-4">
              <Label htmlFor="make-webhook-adv" className="font-sans">Make.com webhook URL</Label>
              <Input id="make-webhook-adv" placeholder="https://hook.eu1.make.com/..." className="mt-2 font-sans" readOnly />
              <p className="text-xs text-[#a0a0a0] font-sans mt-1">{INTEGRATION_OWNER_HELPER}</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-display font-semibold text-[#111111]">First message & follow-up</p>
            <div>
              <Label htmlFor="qual-prompt-adv" className="font-sans">Qualification prompt</Label>
              <Textarea id="qual-prompt-adv" value={qualPrompt} onChange={(e) => setQualPrompt(e.target.value)} className="mt-2 font-sans" rows={3} />
            </div>
            <div>
              <Label htmlFor="first-msg-adv" className="font-sans">First message template</Label>
              <Textarea id="first-msg-adv" value={firstMsg} onChange={(e) => setFirstMsg(e.target.value)} className="mt-2 font-sans" rows={2} />
            </div>
            <div>
              <Label htmlFor="followup-msg-adv" className="font-sans">Follow-up message template</Label>
              <Textarea id="followup-msg-adv" value={followUpMsg} onChange={(e) => setFollowUpMsg(e.target.value)} className="mt-2 font-sans" rows={2} />
            </div>
            <div className="flex gap-2">
              <Button className="bg-[#111111] hover:opacity-90 font-sans">Save</Button>
              <Button variant="ghost" className="font-sans text-[#6a6a6a]">Reset to defaults</Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function SettingsPageContent({
  session,
  brokerage,
  agents,
  demoEnabled = false,
  devToolsPhone,
  integrationStatus = { twilio: false, airtable: false, make: false, stripe: false },
}: SettingsPageContentProps) {
  const router = useRouter();
  const isOwner = session?.role === "owner" || session?.role === "broker";
  const isSuperAdmin = session?.platformRole === "super_admin";

  const [brokerageName, setBrokerageName] = useState(brokerage.name);
  const [brokeragePhone, setBrokeragePhone] = useState(brokerage.phone ?? "");
  const [brokerageTimezone, setBrokerageTimezone] = useState(brokerage.timezone);
  const [brokerageAddress, setBrokerageAddress] = useState(brokerage.address ?? "");
  const [generalSaving, setGeneralSaving] = useState(false);

  useEffect(() => {
    setBrokerageName(brokerage.name);
    setBrokeragePhone(brokerage.phone ?? "");
    setBrokerageTimezone(brokerage.timezone);
    setBrokerageAddress(brokerage.address ?? "");
  }, [brokerage.name, brokerage.phone, brokerage.timezone, brokerage.address]);

  const [emailNewLead, setEmailNewLead] = useState(true);
  const [smsHotLead, setSmsHotLead] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [qualPrompt, setQualPrompt] = useState("What is your budget and preferred area?");
  const [firstMsg, setFirstMsg] = useState("Hi {{name}}, thanks for reaching out! I'd love to help you find a home.");
  const [followUpMsg, setFollowUpMsg] = useState("Just following up — any questions about the listings I sent?");
  const [resetDemoLoading, setResetDemoLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  async function handleGeneralSave() {
    if (!brokerageName.trim()) {
      toast.error("Enter your brokerage name");
      return;
    }
    setGeneralSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          step: 1,
          brokerage: {
            name: brokerageName.trim(),
            phone: brokeragePhone.trim() || undefined,
            timezone: brokerageTimezone.trim() || "America/Chicago",
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved");
        router.refresh();
      } else {
        toast.error(data.error?.message ?? "Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setGeneralSaving(false);
    }
  }

  const connections = [
    { label: "SMS Line", configured: integrationStatus.twilio },
    { label: "Lead intake", configured: integrationStatus.make },
    { label: "Billing", configured: !!integrationStatus.stripe },
  ];

  const showAdvanced = isOwner && !demoEnabled;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Brokerage profile, connections, and preferences."
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-[#f5f5f5] p-1 rounded-xl font-sans">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white">
            Brokerage Profile
          </TabsTrigger>
          <TabsTrigger value="connections" className="rounded-lg data-[state=active]:bg-white">
            Phone & Connections
          </TabsTrigger>
          <TabsTrigger value="routing" className="rounded-lg data-[state=active]:bg-white">
            Routing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-white">
            Billing
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="integrations" className="rounded-lg data-[state=active]:bg-white">
              Integrations
            </TabsTrigger>
          )}
          {isSuperAdmin && (
            <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-white">
              AI Settings
            </TabsTrigger>
          )}
          {isSuperAdmin && (
            <TabsTrigger value="danger" className="rounded-lg data-[state=active]:bg-white text-red-600">
              Danger Zone
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="rounded-2xl border-[#e2e2e2]">
            <CardHeader>
              <CardTitle className="font-display">Brokerage Profile</CardTitle>
              <p className="text-sm text-[#a0a0a0] font-sans">Name, market city, timezone</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brokerage-name" className="font-sans">Brokerage name</Label>
                  <Input
                    id="brokerage-name"
                    value={brokerageName}
                    onChange={(e) => setBrokerageName(e.target.value)}
                    className="font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brokerage-phone" className="font-sans">Phone</Label>
                  <Input
                    id="brokerage-phone"
                    value={brokeragePhone}
                    onChange={(e) => setBrokeragePhone(e.target.value)}
                    className="font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brokerage-tz" className="font-sans">Timezone</Label>
                  <Input
                    id="brokerage-tz"
                    value={brokerageTimezone}
                    onChange={(e) => setBrokerageTimezone(e.target.value)}
                    className="font-sans"
                    placeholder="America/Chicago"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="brokerage-address" className="font-sans">Market city / Address</Label>
                  <Input
                    id="brokerage-address"
                    value={brokerageAddress}
                    onChange={(e) => setBrokerageAddress(e.target.value)}
                    className="font-sans"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <Button
                onClick={handleGeneralSave}
                disabled={generalSaving}
                className="bg-[#111111] hover:opacity-90 font-sans"
              >
                {generalSaving ? "Saving…" : "Save changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="mt-6 space-y-4">
          <Card className="rounded-2xl border-[#e2e2e2]">
            <CardHeader>
              <CardTitle className="font-display">Phone & Connections</CardTitle>
              <p className="text-sm text-[#a0a0a0] font-sans">Status of your SMS line, lead intake, and billing</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {connections.map((c) => (
                <div key={c.label} className="flex items-center justify-between rounded-xl border border-[#e2e2e2] px-4 py-3">
                  <span className="font-sans font-medium text-[#111111]">{c.label}</span>
                  <span className={c.configured ? "text-green-600 font-sans text-sm" : "text-amber-600 font-sans text-sm"}>
                    {c.configured ? "Connected ✓" : "Not configured"}
                  </span>
                </div>
              ))}
              {!integrationStatus.twilio && isOwner && (
                <p className="text-xs text-[#a0a0a0] font-sans">{INTEGRATION_OWNER_HELPER}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="mt-6">
          <Card className="rounded-2xl border-[#e2e2e2]">
            <CardHeader>
              <CardTitle className="font-display">Routing</CardTitle>
              <p className="text-sm text-[#a0a0a0] font-sans">Round Robin, Manual, or Priority — plus escalation</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#6a6a6a] font-sans mb-4">
                Configure routing mode and escalation in the Routing page.
              </p>
              <Button asChild className="bg-[#111111] hover:opacity-90 font-sans">
                <a href="/app/routing">Open Routing</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="rounded-2xl border-[#e2e2e2]">
            <CardHeader>
              <CardTitle className="font-display">Notifications</CardTitle>
              <p className="text-sm text-[#a0a0a0] font-sans">Agent alert preferences — email and SMS</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: "email-new", label: "Email on new lead", desc: "Get an email when a new lead is added", state: emailNewLead, set: setEmailNewLead },
                { id: "sms-hot", label: "SMS on hot lead", desc: "Text when a lead is marked hot", state: smsHotLead, set: setSmsHotLead },
                { id: "daily", label: "Daily digest email", desc: "Summary of activity each day", state: dailyDigest, set: setDailyDigest },
                { id: "weekly", label: "Weekly report", desc: "Weekly performance summary", state: weeklyReport, set: setWeeklyReport },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-[#e2e2e2] p-4">
                  <div>
                    <Label htmlFor={item.id} className="font-medium font-sans">{item.label}</Label>
                    <p className="text-xs text-[#a0a0a0] font-sans">{item.desc}</p>
                  </div>
                  <Switch id={item.id} checked={item.state} onCheckedChange={item.set} />
                </div>
              ))}
              <Button className="bg-[#111111] hover:opacity-90 font-sans">Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="rounded-2xl border-[#e2e2e2]">
            <CardHeader>
              <CardTitle className="font-display">Billing</CardTitle>
              <p className="text-sm text-[#a0a0a0] font-sans">Plan, renewal date, and subscription</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#6a6a6a] font-sans mb-4">
                View your plan and manage your subscription in Billing.
              </p>
              <Button asChild className="bg-[#111111] hover:opacity-90 font-sans">
                <a href="/app/billing">Manage subscription</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="integrations" className="mt-6 space-y-4">
            <Card className="rounded-2xl border-[#e2e2e2]">
              <CardHeader>
                <CardTitle className="font-display">Integrations</CardTitle>
                <p className="text-sm text-[#a0a0a0] font-sans">Twilio, Airtable, Make.com — platform admin only</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6a6a6a] font-sans">Configure in Advanced (Owner Only) below or via environment variables.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {isSuperAdmin && (
          <TabsContent value="ai" className="mt-6 space-y-4">
            <Card className="rounded-2xl border-[#e2e2e2]">
              <CardHeader>
                <CardTitle className="font-display">AI Settings</CardTitle>
                <p className="text-sm text-[#a0a0a0] font-sans">Qualification prompts and AI behavior — platform admin only</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6a6a6a] font-sans">Configure in Advanced (Owner Only) below.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {isSuperAdmin && (
          <TabsContent value="danger" className="mt-6">
            <Card className="rounded-2xl border-2 border-red-200 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <p className="text-sm text-[#a0a0a0] font-sans">Reset demo data or contact support for account changes.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {isOwner && (
                  <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-2">
                    <Label className="font-sans font-medium text-[#111111]">Reset Demo Data</Label>
                    <p className="text-sm text-[#6a6a6a] font-sans">
                      Clear demo mode state and reset to default. Use this to start a fresh demo experience.
                    </p>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100 font-sans"
                      disabled={resetDemoLoading}
                      onClick={async () => {
                        setResetDemoLoading(true);
                        try {
                          const res = await fetch("/api/demo/reset", { method: "POST", credentials: "include" });
                          if (typeof window !== "undefined") sessionStorage.clear();
                          if (res.ok) {
                            toast.success("Demo data reset");
                            router.refresh();
                          } else {
                            toast.success("Demo state cleared locally");
                            router.refresh();
                          }
                        } catch {
                          if (typeof window !== "undefined") sessionStorage.clear();
                          toast.success("Demo state cleared locally");
                          router.refresh();
                        } finally {
                          setResetDemoLoading(false);
                        }
                      }}
                    >
                      {resetDemoLoading ? "Resetting…" : "Reset Demo Data"}
                    </Button>
                  </div>
                )}
                <p className="text-sm text-[#6a6a6a] font-sans">
                  To delete your account, contact support.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {showAdvanced && (
        <AdvancedOwnerSection
          isOwner={isOwner}
          demoEnabled={demoEnabled}
          integrationStatus={integrationStatus}
          devToolsPhone={devToolsPhone}
          qualPrompt={qualPrompt}
          setQualPrompt={setQualPrompt}
          firstMsg={firstMsg}
          setFirstMsg={setFirstMsg}
          followUpMsg={followUpMsg}
          setFollowUpMsg={setFollowUpMsg}
          INTEGRATION_OWNER_HELPER={INTEGRATION_OWNER_HELPER}
          INTEGRATION_NON_OWNER_HELPER={INTEGRATION_NON_OWNER_HELPER}
        />
      )}

      {showAdvanced && <DevTestToolsSection phoneNumber={devToolsPhone} />}
    </div>
  );
}
