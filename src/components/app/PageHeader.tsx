"use client";

import { cn } from "@/lib/utils";
import {
  PAGE_HEADER,
  PAGE_TITLE,
  PAGE_SUBTITLE,
  PAGE_HEADER_ACTIONS,
} from "@/lib/ui";
import { Breadcrumbs } from "./Breadcrumbs";
import type { BreadcrumbSegment } from "./Breadcrumbs";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  breadcrumbs?: BreadcrumbSegment[];
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  right,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn(PAGE_HEADER, "flex-col items-stretch", className)}>
      {breadcrumbs != null && breadcrumbs.length > 0 && (
        <Breadcrumbs segments={breadcrumbs} className="mb-2" />
      )}
      <div className={cn(PAGE_HEADER, "flex-1 min-w-0")}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>{title}</h1>
          {subtitle && <p className={cn(PAGE_SUBTITLE, "mt-1")}>{subtitle}</p>}
        </div>
        {right != null && <div className={PAGE_HEADER_ACTIONS}>{right}</div>}
      </div>
    </div>
  );
}
