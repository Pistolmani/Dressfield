/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getMyOrderById } from "@/lib/orders";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { formatPrice } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ka-GE");
}

function OrderDetailContent() {
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const { user, loading: authLoading } = useAuth();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["my-order", id],
    queryFn: () => getMyOrderById(id),
    enabled: !!user && id > 0,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        იტვირთება...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">შეკვეთის სანახავად გაიარეთ ავტორიზაცია.</p>
        <Link
          href="/auth/login"
          className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          შესვლა
        </Link>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-500">
        შეკვეთა ვერ მოიძებნა.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        შეკვეთების სია
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="font-ui text-2xl font-semibold">
          შეკვეთა #{order.id}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Contact & Shipping */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/8 bg-white p-5 space-y-1 text-sm">
          <p className="font-medium text-base mb-2">კონტაქტი</p>
          <p>{order.contactName}</p>
          <p className="text-muted-foreground">{order.contactPhone}</p>
          <p className="text-muted-foreground">{order.contactEmail}</p>
        </div>

        <div className="rounded-2xl border border-black/8 bg-white p-5 space-y-1 text-sm">
          <p className="font-medium text-base mb-2">მიწოდება</p>
          <p>{order.shippingCity}</p>
          <p className="text-muted-foreground">{order.shippingAddressLine1}</p>
          {order.shippingAddressLine2 && (
            <p className="text-muted-foreground">{order.shippingAddressLine2}</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-black/8 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-black/8">
          <p className="font-medium">პროდუქტები</p>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-black/8">
              <th className="px-5 py-2 font-medium w-12"></th>
              <th className="px-3 py-2 font-medium">პროდუქტი</th>
              <th className="px-3 py-2 font-medium">ფასი</th>
              <th className="px-3 py-2 font-medium">რ-ბა</th>
              <th className="px-3 py-2 font-medium">ჯამი</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-black/5 last:border-0">
                <td className="px-5 py-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                    {item.productImageUrl && (
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium">{item.productName}</p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  )}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {formatPrice(item.unitPrice)}
                </td>
                <td className="px-3 py-3 text-muted-foreground">{item.quantity}</td>
                <td className="px-3 py-3 font-medium">{formatPrice(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial summary */}
        <div className="px-5 py-4 border-t border-black/8 space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>ჯამი</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>მიწოდება</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-1 border-t border-black/8">
            <span>სულ</span>
            <span className="text-accent">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="rounded-2xl border border-black/8 bg-white p-5 text-sm space-y-1">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-32">შექმნილია:</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        {order.customerNotes && (
          <div className="flex gap-2">
            <span className="text-muted-foreground w-32">კომენტარი:</span>
            <span>{order.customerNotes}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense>
      <OrderDetailContent />
    </Suspense>
  );
}
