import { NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth";
import { requireBrokerOwner } from "@/lib/guards";
import { createPortal } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await getSessionToken();
    const deny = requireBrokerOwner(session);
    if (deny) return deny;
    const url = await createPortal(session!.userId, session!.email);
    return NextResponse.json({ success: true, data: { url } });
  } catch (err) {
    console.error("[stripe/portal POST]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Portal failed" } },
      { status: 500 }
    );
  }
}
