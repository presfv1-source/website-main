"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardTestSmsCardProps {
  phoneNumber: string;
}

export function DashboardTestSmsCard({ phoneNumber }: DashboardTestSmsCardProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(phoneNumber.replace(/\D/g, "").replace(/^1?/, "+1") || phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl dark:bg-orange-950/20 dark:border-orange-800">
      <h3 className="font-bold text-lg">Test the Magic</h3>
      <p className="mt-1 text-sm text-muted-foreground">Text this number from your phone:</p>
      <div className="font-mono bg-white dark:bg-background p-3 rounded mt-2 flex items-center justify-between gap-2">
        <span className="truncate">{phoneNumber}</span>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0 min-h-[36px]">
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-muted-foreground">Try: &quot;Interested in 77002 condo&quot;</p>
      <Button asChild variant="outline" size="sm" className="mt-4 min-h-[44px]">
        <Link href="/app/messages">Refresh Inbox</Link>
      </Button>
    </div>
  );
}
