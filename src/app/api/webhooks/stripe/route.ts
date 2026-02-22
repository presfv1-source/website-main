import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { updateAirtableUserPlan } from "@/lib/airtable";
import { hasStripe } from "@/lib/config";
import { env } from "@/lib/env.mjs";

const WEBHOOK_SECRET = env.server.STRIPE_WEBHOOK_SECRET?.trim() ?? "";

// ── Idempotency: prevent processing the same Stripe event twice ──
// In-memory set works for single-instance. For multi-instance, use Airtable/Redis.
const processedEventIds = new Set<string>();
const MAX_PROCESSED_CACHE = 2000;

function markEventProcessed(eventId: string): boolean {
  if (processedEventIds.has(eventId)) return false; // already processed
  if (processedEventIds.size >= MAX_PROCESSED_CACHE) {
    // Evict oldest (Set iteration order is insertion order)
    const first = processedEventIds.values().next().value;
    if (first) processedEventIds.delete(first);
  }
  processedEventIds.add(eventId);
  return true; // first time
}

function verifyStripeSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;
  const parts = signature.split(",").reduce<Record<string, string>>(
    (acc, part) => {
      const [k, v] = part.split("=");
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    },
    {}
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const payload = `${t}.${rawBody}`;
  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
  return expected === v1;
}

function priceIdToPlanId(priceId: string): "essentials" | "pro" {
  const essentials =
    process.env.STRIPE_PRICE_ID_ESSENTIALS ??
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ESSENTIALS ??
    "";
  const pro =
    process.env.STRIPE_PRICE_ID_PRO ??
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO ??
    "";
  if (priceId && essentials && priceId === essentials) return "essentials";
  if (priceId && pro && priceId === pro) return "pro";
  return "pro";
}

/** Map Stripe subscription status string to our SubscriptionStatus. */
function mapSubscriptionStatus(
  stripeStatus: string | undefined
): string {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
      return "inactive";
    default:
      return "unknown";
  }
}

async function syncToClerk(
  email: string,
  updates: {
    plan?: "essentials" | "pro";
    subscription_status?: string;
  }
): Promise<void> {
  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({
      emailAddress: [email],
    });
    const user = users.data[0];
    if (user) {
      await client.users.updateUser(user.id, {
        publicMetadata: { ...user.publicMetadata, ...updates },
      });
    }
  } catch (e) {
    console.error(
      "[webhooks/stripe] Clerk sync:",
      e instanceof Error ? e.message : e
    );
  }
}

async function getEmailFromCustomerId(
  customerId: string
): Promise<string | null> {
  if (!hasStripe || !env.server.STRIPE_SECRET_KEY) return null;
  try {
    const StripeLib = await import("stripe");
    const stripe = new StripeLib.default(env.server.STRIPE_SECRET_KEY);
    const customer = await stripe.customers.retrieve(customerId);
    return (customer as Stripe.Customer).email?.trim() ?? null;
  } catch (e) {
    console.error(
      "[webhooks/stripe] customer lookup:",
      e instanceof Error ? e.message : e
    );
    return null;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? null;

  // Verify signature if webhook secret is set
  if (WEBHOOK_SECRET && !verifyStripeSignature(rawBody, signature)) {
    console.error("[webhooks/stripe] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody) as {
      id?: string;
      type?: string;
      data?: { object?: Record<string, unknown> };
    };

    const eventId = event.id;
    const type = event?.type;
    const obj = event?.data?.object as Record<string, unknown> | undefined;

    // ── Idempotency check ──
    if (eventId && !markEventProcessed(eventId)) {
      console.log(
        `[webhooks/stripe] Duplicate event skipped: ${eventId} (${type})`
      );
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    console.log(`[webhooks/stripe] Processing: ${type} (${eventId})`);

    // ── checkout.session.completed ──
    if (type === "checkout.session.completed" && obj) {
      const email = (
        obj.customer_email ??
        (obj.customer_details as { email?: string } | undefined)?.email
      ) as string | undefined;

      let planId: "essentials" | "pro" = "pro";
      const line0 = (
        obj.line_items as
          | { data?: { price?: string | { id?: string } }[] }
          | undefined
      )?.data?.[0];
      const priceId =
        typeof line0?.price === "string"
          ? line0.price
          : line0?.price?.id;
      if (priceId) planId = priceIdToPlanId(priceId);

      if (email?.trim()) {
        await updateAirtableUserPlan(email.trim(), planId);
        await syncToClerk(email.trim(), {
          plan: planId,
          subscription_status: "active",
        });
        console.log(
          `[webhooks/stripe] checkout complete: ${email} → ${planId}`
        );
      }
    }

    // ── customer.subscription.updated ──
    if (type === "customer.subscription.updated" && obj) {
      const customerId = obj.customer as string | undefined;
      const status = obj.status as string | undefined;
      const mappedStatus = mapSubscriptionStatus(status);

      if (customerId) {
        const email = await getEmailFromCustomerId(customerId);
        if (email) {
          const planId: "essentials" | "pro" =
            status === "active" || status === "trialing"
              ? "pro"
              : "essentials";
          await updateAirtableUserPlan(email, planId);
          await syncToClerk(email, {
            plan: planId,
            subscription_status: mappedStatus,
          });
          console.log(
            `[webhooks/stripe] sub updated: ${email} → ${mappedStatus} (${planId})`
          );
        }
      }
    }

    // ── customer.subscription.deleted ──
    if (type === "customer.subscription.deleted" && obj) {
      const customerId = obj.customer as string | undefined;
      if (customerId) {
        const email = await getEmailFromCustomerId(customerId);
        if (email) {
          await updateAirtableUserPlan(email, "essentials");
          await syncToClerk(email, {
            plan: "essentials",
            subscription_status: "canceled",
          });
          console.log(
            `[webhooks/stripe] sub deleted: ${email} → canceled`
          );
        }
      }
    }

    // ── invoice.payment_failed ──
    if (type === "invoice.payment_failed" && obj) {
      const customerId = obj.customer as string | undefined;
      if (customerId) {
        const email = await getEmailFromCustomerId(customerId);
        if (email) {
          await syncToClerk(email, { subscription_status: "past_due" });
          console.log(
            `[webhooks/stripe] payment failed: ${email} → past_due`
          );
        }
      }
    }
  } catch (e) {
    console.error("[webhooks/stripe] Error:", e);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
