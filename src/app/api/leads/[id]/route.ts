import { NextRequest, NextResponse } from "next/server";
import { hasAirtable } from "@/lib/config";
import { getDemoLeadById, getDemoLeads } from "@/lib/demo/data";
import { getDemoEnabled, getSessionToken } from "@/lib/auth";
import { requireAuth, requireBrokerOwner } from "@/lib/guards";
import { updateLead, deleteLead } from "@/lib/airtable";
import { triggerWebhook } from "@/lib/make";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionToken(request);
    const deny = requireAuth(session);
    if (deny) return deny;
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const status = body.status as string | undefined;
    const assignedTo = body.assignedTo as string | undefined;

    const demo = await getDemoEnabled(session!);
    if (demo) {
      const leads = getDemoLeads();
      const lead = leads.find((l) => l.id === id) ?? getDemoLeadById(id);
      if (!lead) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Lead not found" } },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: {
          ...lead,
          ...(status && { status }),
          ...(assignedTo !== undefined && { assignedTo }),
        },
      });
    }

    if (!hasAirtable) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_CONFIGURED", message: "Airtable not connected" } },
        { status: 503 }
      );
    }

    const updateData: Parameters<typeof updateLead>[1] = {};
    if (status && ["new", "contacted", "qualified", "appointment", "closed", "lost"].includes(status)) {
      updateData.status = status as "new" | "contacted" | "qualified" | "appointment" | "closed" | "lost";
    }
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || undefined;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "No valid fields to update" } },
        { status: 400 }
      );
    }

    const updated = await updateLead(id, updateData);

    if (status && (status === "appointment" || status === "closed")) {
      await triggerWebhook({
        type: "lead_status_changed",
        leadId: id,
        status,
        brokerageId: updated.brokerageId,
      });
    }
    if (assignedTo !== undefined) {
      await triggerWebhook({
        type: "lead_assigned",
        leadId: id,
        assignedAgentId: assignedTo || null,
        brokerageId: updated.brokerageId,
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("[leads PATCH]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update lead" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionToken();
    const deny = requireBrokerOwner(session);
    if (deny) return deny;
    const { id } = await params;

    const demo = await getDemoEnabled(session!);
    if (demo) {
      return NextResponse.json({ success: true, data: { deleted: true } });
    }

    if (!hasAirtable) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_CONFIGURED", message: "Airtable not connected" } },
        { status: 503 }
      );
    }

    await deleteLead(id);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (err) {
    console.error("[leads DELETE]", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to delete lead" } },
      { status: 500 }
    );
  }
}
