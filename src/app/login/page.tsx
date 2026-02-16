import { Suspense } from "react";
import { LoginForm } from "@/components/app/LoginForm";
import { CONTAINER_NARROW } from "@/lib/ui";
import { cn } from "@/lib/utils";

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md mx-auto animate-pulse">
      <div className="h-8 w-48 mx-auto mb-8 bg-muted rounded" />
      <div className="rounded-xl border bg-card p-6 shadow-lg space-y-4">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
        <div className="h-11 w-full bg-muted rounded" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-12",
        CONTAINER_NARROW
      )}
    >
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
