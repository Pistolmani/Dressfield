"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getMyOrders } from "@/lib/orders";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { formatPrice } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ka-GE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function OrdersContent() {
  const { user, loading: authLoading } = useAuth();

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        იტვირთება...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">შეკვეთების სანახავად გაიარეთ ავტორიზაცია.</p>
        <Link
          href="/auth/login"
          className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          შესვლა
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-[family-name:var(--font-inter)] text-2xl font-semibold">
        ჩემი შეკვეთები
      </h1>

      {isLoading && (
        <div className="py-16 text-center text-muted-foreground">იტვირთება...</div>
      )}

      {isError && (
        <div className="py-16 text-center text-red-500">
          შეცდომა მონაცემების ჩატვირთვისას.
        </div>
      )}

      {!isLoading && !isError && orders?.length === 0 && (
        <div className="py-16 text-center space-y-3">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">ჯერ არ გაქვთ შეკვეთები.</p>
          <Link
            href="/products"
            className="inline-block bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            პროდუქცია
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/detail?id=${order.id}`}
              className="block rounded-2xl border border-black/8 bg-white p-5 hover:border-black/15 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">შეკვეთა #{order.id}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)} &middot; {order.itemCount} პოზიცია
                  </p>
                </div>
                <span className="text-lg font-semibold text-accent">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}
