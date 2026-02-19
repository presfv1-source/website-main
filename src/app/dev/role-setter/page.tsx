import Link from "next/link";
import { DevRoleSwitcher } from "@/components/app/DevRoleSwitcher";
import { Button } from "@/components/ui/button";

/**
 * Dev-only page: set your Clerk publicMetadata.role for testing.
 * Only useful in development; in production /dev/* is redirected to / by middleware.
 */
export default function DevRoleSetterPage() {
  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Dev: Set your role</h1>
      <p className="text-sm text-muted-foreground">
        Sign in first, then use the buttons below. Role is stored in Clerk publicMetadata and
        controls Dashboard (owner vs agent view). Page will reload after setting.
      </p>
      <DevRoleSwitcher />
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/app/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
