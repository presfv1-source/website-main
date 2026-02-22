import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const fakeLead = {
  id: "recLead1",
  status: "new" as const,
  brokerageId: "recBroker1",
  name: "Test",
  phone: "+15551234567",
  email: "",
  leadPhone: "+15551234567",
  leadEmail: "",
  leadId: 1,
  firstName: "",
  lastName: "",
  fullName: "Test",
  source: "website" as const,
  assignedAgentId: null,
  assignedTo: undefined,
  assignedToName: undefined,
  lastMessageAt: undefined,
};

function formRequest(body: string, from = "+15551234567", messageSid = "SM123") {
  const form = new FormData();
  form.set("From", from);
  form.set("To", "+15559876543");
  form.set("Body", body);
  form.set("MessageSid", messageSid);
  return new NextRequest("http://localhost/api/webhooks/twilio", {
    method: "POST",
    body: form,
  });
}

vi.mock("@/lib/config", () => ({
  hasAirtable: true,
  hasMake: false,
  hasLlm: false,
}));

const mockGetLeadByPhone = vi.fn();
const mockCreateMessage = vi.fn();
const mockUpdateLead = vi.fn();
vi.mock("@/lib/airtable", () => ({
  getLeadByPhone: (phone: string) => mockGetLeadByPhone(phone),
  createMessage: (data: unknown) => mockCreateMessage(data),
  updateLead: (id: string, data: unknown) => mockUpdateLead(id, data),
}));

const mockMessageExistsBySid = vi.fn();
vi.mock("@/lib/airtable-ext", () => ({
  messageExistsBySid: (sid: string) => mockMessageExistsBySid(sid),
}));

vi.mock("@/lib/make", () => ({
  triggerWebhook: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/qualification", () => ({
  handleInboundLeadSms: vi.fn().mockResolvedValue(undefined),
}));

describe("Twilio webhook STOP/HELP/UNSTOP compliance", () => {
  beforeEach(async () => {
    mockGetLeadByPhone.mockResolvedValue(fakeLead);
    mockMessageExistsBySid.mockResolvedValue(false);
    mockCreateMessage.mockResolvedValue({});
    mockUpdateLead.mockResolvedValue(fakeLead);
    vi.resetModules();
  });

  it("STOP returns 200 and TwiML with confirmation message", async () => {
    const { POST } = await import("./route");
    const res = await POST(formRequest("STOP"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Response");
    expect(text).toContain("Message");
    expect(text).toContain("unsubscribed");
    expect(text).toContain("START to re-subscribe");
  });

  it("stop (lowercase) normalizes and triggers STOP", async () => {
    const { POST } = await import("./route");
    const res = await POST(formRequest("stop"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("unsubscribed");
  });

  it("STOP ALL (with space) normalizes to STOPALL and triggers STOP", async () => {
    const { POST } = await import("./route");
    const res = await POST(formRequest("STOP ALL"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("unsubscribed");
  });

  it("UNSTOP (START) returns 200 and empty TwiML", async () => {
    const { POST } = await import("./route");
    const res = await POST(formRequest("START"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<Response></Response>");
  });

  it("HELP returns 200 and TwiML with help message", async () => {
    const { POST } = await import("./route");
    const res = await POST(formRequest("HELP"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Response");
    expect(text).toContain("Message");
    expect(text).toContain("STOP to opt out");
    expect(text).toContain("brokerage");
  });

  it("INFO triggers HELP", async () => {
    const { POST } = await import("./route");
    const res = await POST(formRequest("INFO"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("STOP to opt out");
  });

  it("missing From or Body returns 200 empty TwiML", async () => {
    const { POST } = await import("./route");
    const form = new FormData();
    form.set("Body", "hello");
    const req = new NextRequest("http://localhost/api/webhooks/twilio", {
      method: "POST",
      body: form,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
    );
  });
});

describe("Twilio webhook idempotency", () => {
  beforeEach(async () => {
    mockGetLeadByPhone.mockResolvedValue(fakeLead);
    mockCreateMessage.mockResolvedValue({});
    mockUpdateLead.mockResolvedValue(fakeLead);
    mockMessageExistsBySid.mockResolvedValue(true);
    mockCreateMessage.mockClear();
    vi.resetModules();
  });

  it("duplicate MessageSid returns 200 empty TwiML when messageExistsBySid is true", async () => {
    const { POST } = await import("./route");
    const res = await POST(formRequest("hello", "+15551234567", "SMdup"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
    );
    expect(mockCreateMessage).not.toHaveBeenCalled();
  });
});
