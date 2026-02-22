import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAirtableUserPlan, getBrokerageByEmail } from "@/lib/airtable";
import { hasStripe } from "@/lib/config";

export type PlanId = "free" | "essentials" | "pro";

export type SubscriptionStatus = "active" | "inactive" | "past_due" | "canceled";

export async function GET() {
  try {
    const session = await getSession();
    const email = session?.email;

    if (!email) {
      return NextResponse.json({
        success: true,
        data: { planId: "free" as PlanId, hasStripe },
      });
    }

    if (session.isDemo || !hasStripe) {
      return NextResponse.json({
        success: true,
        data: { planId: "free" as PlanId, hasStripe },
      });
    }

    const [plan, brokerage] = await Promise.all([
      getAirtableUserPlan(email),
      getBrokerageByEmail(email),
    ]);
    const planId: PlanId = plan === "essentials" || plan === "pro" ? plan : "free";
    const subscriptionStatus: SubscriptionStatus | undefined = brokerage?.status;
    return NextResponse.json({
      success: true,
      data: { planId, hasStripe, subscriptionStatus },
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: { planId: "free" as PlanId, hasStripe },
    });
  }
}
