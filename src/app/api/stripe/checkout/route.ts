import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth";
import { requireBrokerOwner } from "@/lib/guards";
import { createCheckout } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionToken(request);
    const deny = requireBrokerOwner(session);
    if (deny) return deny;
    const body = await request.json().catch(() => ({}));
    const priceId = typeof body?.priceId === "string" ? body.priceId : undefined;
    const url = await createCheckout(priceId, session!.userId, session!.email);
    return NextResponse.json({ success: true, data: { url } });
  } catch (err) {
    console.error("[stripe/checkout POST]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Checkout failed" } },
      { status: 500 }
    );
  }
}
