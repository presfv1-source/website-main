"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  type Row,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStatusPill } from "@/components/app/LeadStatusPill";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RESPONSIVE_LIST_BREAKPOINT } from "@/lib/ui";
import type { Lead } from "@/lib/types";

const PAGE_SIZE = 10;

// Selectable source filters. HAR.com and Zillow are shown as disabled "Coming soon" in the dropdown.
const SOURCE_OPTIONS = ["All", "Realtor.com", "Website", "Facebook Leads", "Referral", "Open house", "Other"] as const;
type SourceFilterValue = (typeof SOURCE_OPTIONS)[number];

function normalizeSource(s: string | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

const KNOWN_SOURCES = ["zillow", "realtor.com", "website", "facebook leads", "har", "har.com", "referral", "open house"];

/** Treat empty or unknown source as "Other" for filtering. */
function sourceMatchesFilter(leadSource: string | undefined, filter: SourceFilterValue): boolean {
  const normalized = normalizeSource(leadSource);
  if (filter === "All") return true;
  if (filter === "Other") return !normalized || !KNOWN_SOURCES.includes(normalized);
  return normalized === normalizeSource(filter);
}

const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    cell: ({ row }) => (
      <Link
        href={`/app/leads/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.name}
      </Link>
    ),
    size: 9999,
    minSize: 120,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="truncate block max-w-[180px]" title={row.original.email}>
        {row.original.email}
      </span>
    ),
    size: 180,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        {row.original.phone || "—"}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => <LeadStatusPill status={row.original.status} />,
    size: 100,
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate block max-w-[100px]">
        {row.original.source || "—"}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "assignedToName",
    header: "Agent",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate block max-w-[120px]">
        {row.original.assignedToName ?? "—"}
      </span>
    ),
    size: 100,
  },
];

interface LeadsDataListProps {
  leads: Lead[];
}

export function LeadsDataList({ leads }: LeadsDataListProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilterValue>("All");

  const filteredBySource = leads.filter((l) => sourceMatchesFilter(l.source, sourceFilter));

  const table = useReactTable({
    data: filteredBySource,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  });

  const rows = table.getRowModel().rows ?? [];
  const hasRows = rows.length > 0;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const showPagination = totalRows > PAGE_SIZE;

  return (
    <div className="min-w-0 space-y-4">
      {/* Source filter + Search */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilterValue)}>
          <SelectTrigger className="w-[160px] h-9" size="default">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
            <SelectItem value="__har_com__" disabled className="opacity-80">
              <span className="flex items-center gap-2">
                HAR.com
                <span className="rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[10px] font-medium text-[#6a6a6a]">
                  Coming soon
                </span>
              </span>
            </SelectItem>
            <SelectItem value="__zillow__" disabled className="opacity-80">
              <span className="flex items-center gap-2">
                Zillow
                <span className="rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[10px] font-medium text-[#6a6a6a]">
                  Coming soon
                </span>
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Desktop: table with horizontal scroll on small viewports */}
      <div
        className={cn(
          "hidden rounded-lg border overflow-hidden min-w-0 w-full shadow-sm",
          `${RESPONSIVE_LIST_BREAKPOINT}:block overflow-x-auto`
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.id === "name" && "min-w-[140px] w-[25%]",
                        header.column.id === "email" && "min-w-[140px]",
                        (header.column.id === "phone" || header.column.id === "status") && "w-[100px] shrink-0",
                        header.column.id === "source" && "w-[90px] shrink-0",
                        header.column.id === "assignedToName" && "min-w-[100px] shrink-0",
                        canSort && "cursor-pointer select-none hover:bg-muted/50"
                      )}
                      onClick={() => canSort && header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="inline-block shrink-0 text-muted-foreground">
                            {isSorted === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : isSorted === "desc" ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <span className="inline-block w-4 h-4 opacity-40">⇅</span>
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {hasRows ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => router.push(`/app/leads/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === "name" && "font-medium",
                        cell.column.id === "phone" && "whitespace-nowrap"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {globalFilter ? "No leads match your search." : "No leads yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <div className={cn("space-y-3", `${RESPONSIVE_LIST_BREAKPOINT}:hidden`)}>
        {hasRows ? (
          rows.map((row) => (
            <Link
              key={row.id}
              href={`/app/leads/${row.original.id}`}
              className="block min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            >
              <Card className="overflow-hidden hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 space-y-2">
                  <p className="font-medium truncate">{row.original.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{row.original.email}</p>
                  <LeadStatusPill status={row.original.status} />
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">
            {globalFilter ? "No leads match your search." : "No leads yet."}
          </p>
        )}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * PAGE_SIZE + 1}–
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * PAGE_SIZE,
              totalRows
            )}{" "}
            of {totalRows}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
