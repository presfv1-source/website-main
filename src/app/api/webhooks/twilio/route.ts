import { NextRequest, NextResponse } from "next/server";
import { hasAirtable, hasMake } from "@/lib/config";
import { getLeadByPhone, createMessage, updateLead } from "@/lib/airtable";
import { triggerWebhook } from "@/lib/make";

/** TwiML: empty response so we do not send a duplicate SMS. */
const TWIML_EMPTY =
  '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

// ── Idempotency: deduplicate by Twilio MessageSid ──
const processedSids = new Set<string>();
const MAX_SID_CACHE = 5000;

function isNewMessage(sid: string): boolean {
  if (!sid) return true; // no SID = process anyway
  if (processedSids.has(sid)) return false;
  if (processedSids.size >= MAX_SID_CACHE) {
    const first = processedSids.values().next().value;
    if (first) processedSids.delete(first);
  }
  processedSids.add(sid);
  return true;
}

/** Normalize message body for keyword detection. */
function normalizeBody(body: string): string {
  return body.trim().toUpperCase();
}

/** STOP keywords per CTIA guidelines. */
const STOP_KEYWORDS = new Set([
  "STOP",
  "STOPALL",
  "UNSUBSCRIBE",
  "CANCEL",
  "END",
  "QUIT",
]);

/** UNSTOP / re-subscribe keywords. */
const UNSTOP_KEYWORDS = new Set(["START", "UNSTOP", "SUBSCRIBE"]);

/** HELP keywords. */
const HELP_KEYWORDS = new Set(["HELP", "INFO"]);

function xmlResponse(status = 200) {
  return new NextResponse(TWIML_EMPTY, {
    status,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = (formData.get("From") ?? "").toString().trim();
    const to = (formData.get("To") ?? "").toString().trim();
    const body = (formData.get("Body") ?? "").toString().trim();
    const messageSid = (formData.get("MessageSid") ?? "").toString().trim();

    if (!from || !body) {
      console.warn("[Twilio Webhook] Missing From or Body");
      return xmlResponse();
    }

    // ── Idempotency: skip if we already processed this SID ──
    if (messageSid && !isNewMessage(messageSid)) {
      console.log(
        `[Twilio Webhook] Duplicate SID skipped: ${messageSid}`
      );
      return xmlResponse();
    }

    const normalized = normalizeBody(body);

    // ── STOP/HELP handling (runs even without Airtable) ──
    if (STOP_KEYWORDS.has(normalized)) {
      console.log(
        `[Twilio Webhook] STOP received from ${from.slice(-4)}`
      );
      if (hasAirtable) {
        const lead = await getLeadByPhone(from);
        if (lead) {
          await updateLead(lead.id, { optedOut: true });
          await createMessage({
            leadId: lead.id,
            body,
            direction: "in",
            senderType: "lead",
            twilioMessageSid: messageSid || undefined,
          });
        }
      }
      // Twilio auto-handles STOP at carrier level; we just track it.
      return xmlResponse();
    }

    if (UNSTOP_KEYWORDS.has(normalized)) {
      console.log(
        `[Twilio Webhook] UNSTOP received from ${from.slice(-4)}`
      );
      if (hasAirtable) {
        const lead = await getLeadByPhone(from);
        if (lead) {
          await updateLead(lead.id, { optedOut: false });
          await createMessage({
            leadId: lead.id,
            body,
            direction: "in",
            senderType: "lead",
            twilioMessageSid: messageSid || undefined,
          });
        }
      }
      return xmlResponse();
    }

    if (HELP_KEYWORDS.has(normalized)) {
      console.log(
        `[Twilio Webhook] HELP received from ${from.slice(-4)}`
      );
      if (hasAirtable) {
        const lead = await getLeadByPhone(from);
        if (lead) {
          await createMessage({
            leadId: lead.id,
            body,
            direction: "in",
            senderType: "lead",
            twilioMessageSid: messageSid || undefined,
          });
        }
      }
      // Return TwiML with a help message
      const helpTwiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>LeadHandler: Reply STOP to opt out. For support, contact your brokerage directly.</Message></Response>`;
      return new NextResponse(helpTwiml, {
        status: 200,
        headers: { "Content-Type": "text/xml; charset=utf-8" },
      });
    }

    // ── Normal message processing ──
    if (!hasAirtable) {
      console.warn(
        "[Twilio Webhook] Airtable not configured; skipping persist"
      );
      return xmlResponse();
    }

    const lead = await getLeadByPhone(from);
    if (!lead) {
      console.warn(
        "[Twilio Webhook] No lead found for phone:",
        from.slice(-4)
      );
      return xmlResponse();
    }

    // Check if lead has opted out — log but don't trigger automations
    if (lead.optedOut === true) {
      console.log(
        `[Twilio Webhook] Message from opted-out lead ${from.slice(-4)}; logging only`
      );
      await createMessage({
        leadId: lead.id,
        body,
        direction: "in",
        senderType: "lead",
        twilioMessageSid: messageSid || undefined,
      });
      return xmlResponse();
    }

    const now = new Date().toISOString();
    await createMessage({
      leadId: lead.id,
      body,
      direction: "in",
      senderType: "lead",
      twilioMessageSid: messageSid || undefined,
    });
    await updateLead(lead.id, { lastMessageAt: now });

    if (lead.status === "new" && hasMake) {
      await triggerWebhook({
        type: "sms_received",
        leadId: lead.id,
        phone: from,
        body,
        brokerageId: lead.brokerageId,
      });
    }

    return xmlResponse();
  } catch (err) {
    console.error("[Twilio Webhook]", err);
    return xmlResponse();
  }
}
