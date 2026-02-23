import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BillingPageClient } from "./BillingPageClient";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await getSession();
  if (session?.role === "agent") redirect("/app/leads");
  const isSuperAdmin = session?.platformRole === "super_admin";
  return <BillingPageClient isSuperAdmin={isSuperAdmin} />;
}
