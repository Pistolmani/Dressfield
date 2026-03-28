"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CustomOrderDetail } from "@/components/admin/custom-order-detail";

function CustomOrderDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const orderId = id ? Number(id) : undefined;

  if (!orderId || Number.isNaN(orderId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-3xl border border-destructive/40 bg-white p-6 text-sm text-destructive">
          შეკვეთის ID არ არის მითითებული.
        </div>
      </div>
    );
  }

  return <CustomOrderDetail id={orderId} />;
}

export default function AdminCustomOrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="rounded-3xl border border-black/8 bg-white p-6 text-sm text-muted-foreground">
            იტვირთება...
          </div>
        </div>
      }
    >
      <CustomOrderDetailInner />
    </Suspense>
  );
}
