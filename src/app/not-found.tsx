import Link from "next/link";
import { Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-foreground mt-4">Page not found</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <Building2 className="size-5" aria-hidden />
          Back to LeadHandler.ai
        </Link>
      </div>
    </div>
  );
}
