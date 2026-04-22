"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuditLogs } from "@/lib/audit-log";
import { cn } from "@/lib/utils";
import type { AuditLogDto } from "@/types/audit-log";

const ENTITY_TYPES = ["", "Product", "Order", "CustomOrder", "PromoCode"];
const PAGE_SIZE = 50;

const actionLabel: Record<string, string> = {
  ProductCreated: "შექმნა",
  ProductUpdated: "განახლება",
  ProductDeleted: "წაშლა",
  OrderStatusChanged: "სტატუსი შეიცვალა",
  CustomOrderStatusChanged: "სტატუსი შეიცვალა",
  PromoCodeCreated: "შექმნა",
  PromoCodeUpdated: "განახლება",
  PromoCodeDeleted: "წაშლა",
};

const entityLabel: Record<string, string> = {
  Product: "პროდუქტი",
  Order: "შეკვეთა",
  CustomOrder: "ინდ. შეკვეთა",
  PromoCode: "პრომო კოდი",
};

const actionColor: Record<string, string> = {
  ProductCreated: "bg-emerald-50 text-emerald-700",
  ProductUpdated: "bg-blue-50 text-blue-700",
  ProductDeleted: "bg-red-50 text-red-700",
  OrderStatusChanged: "bg-amber-50 text-amber-700",
  CustomOrderStatusChanged: "bg-amber-50 text-amber-700",
  PromoCodeCreated: "bg-emerald-50 text-emerald-700",
  PromoCodeUpdated: "bg-blue-50 text-blue-700",
  PromoCodeDeleted: "bg-red-50 text-red-700",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ka-GE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAuditLogPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, entityType],
    queryFn: () =>
      getAuditLogs({ page, pageSize: PAGE_SIZE, entityType: entityType || undefined }),
    staleTime: 30_000,
  });

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">აუდიტის ჟურნალი</h1>
            {data && (
              <p className="text-xs text-muted-foreground mt-0.5">
                სულ {data.totalCount} ჩანაწერი
              </p>
            )}
          </div>
        </div>

        {/* Filter */}
        <select
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">ყველა კატეგორია</option>
          {ENTITY_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{entityLabel[t] ?? t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">თარიღი</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">კატეგორია</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">მოქმედება</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">ობიექტი</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">დეტალები</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">ადმინი</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  ჩანაწერები არ მოიძებნა
                </td>
              </tr>
            ) : (
              data?.items.map((log: AuditLogDto) => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-gray-600">
                      {entityLabel[log.entityType] ?? log.entityType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      actionColor[log.action] ?? "bg-gray-100 text-gray-700"
                    )}>
                      {actionLabel[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">
                      {log.entityName ?? log.entityId ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell max-w-xs truncate">
                    {log.details ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                    {log.actorEmail ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            გვ. {page} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
