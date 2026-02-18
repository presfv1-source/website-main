import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { CONTAINER_NARROW } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-12",
        CONTAINER_NARROW
      )}
    >
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xl font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <Building2 className="size-6" aria-hidden />
          LeadHandler.ai
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          SMS Lead Response &amp; Routing
        </p>
      </div>
      <SignUp
        redirectUrl="/app/dashboard"
        signInUrl="/login"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg rounded-xl",
          },
        }}
      />
      <p className="text-center mt-6 text-sm text-muted-foreground">
        <Link
          href="/"
          className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Back to home
        </Link>
      </p>
    </div>
  );
}
