"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OrderDetail from "@/components/admin/order-detail";

function DetailInner() {
  const params = useSearchParams();
  const id = Number(params.get("id"));

  if (!id) {
    return (
      <p className="p-8 text-red-500">შეკვეთის ID არ არის მითითებული.</p>
    );
  }

  return <OrderDetail orderId={id} />;
}

export default function AdminOrderDetailPage() {
  return (
    <Suspense>
      <DetailInner />
    </Suspense>
  );
}
