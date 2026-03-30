/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminOrderById, updateOrderStatus } from "@/lib/orders";
import {
  OrderStatus,
  OrderStatusLabels,
  OrderStatusColors,
} from "@/types/order";
import { formatPrice } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ka-GE");
}

const ALL_STATUSES: OrderStatus[] = [
  "Pending",
  "AwaitingPayment",
  "Paid",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
];

export default function OrderDetail({ orderId }: { orderId: number }) {
  const queryClient = useQueryClient();
  const [statusValue, setStatusValue] = useState<OrderStatus | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => getAdminOrderById(orderId),
  });

  useEffect(() => {
    if (order && statusValue === null) {
      setStatusValue(order.status);
      setAdminNotes(order.adminNotes ?? "");
    }
  }, [order, statusValue]);

  const mutation = useMutation({
    mutationFn: () =>
      updateOrderStatus(orderId, {
        status: statusValue!,
        adminNotes: adminNotes.trim() || undefined,
      }),
    onSuccess: () => {
      // Reset local state so the useEffect re-syncs from the refetched data
      setStatusValue(null);
      setAdminNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        იტვირთება...
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-8 text-center text-red-500">
        შეკვეთა ვერ მოიძებნა.
      </div>
    );
  }

  const currentStatus = statusValue ?? order.status;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        შეკვეთების სია
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="font-ui text-4xl font-semibold">
          შეკვეთა #{order.id}
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${OrderStatusColors[order.status]}`}
        >
          {OrderStatusLabels[order.status]}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Contact */}
        <div className="rounded-2xl border border-black/8 bg-white p-5 space-y-1 text-sm">
          <p className="font-medium text-base mb-2">კონტაქტი</p>
          <p>{order.contactName}</p>
          <p className="text-muted-foreground">{order.contactPhone}</p>
          <p className="text-muted-foreground">{order.contactEmail}</p>
        </div>

        {/* Shipping */}
        <div className="rounded-2xl border border-black/8 bg-white p-5 space-y-1 text-sm">
          <p className="font-medium text-base mb-2">მიწოდება</p>
          <p>{order.shippingCity}</p>
          <p className="text-muted-foreground">{order.shippingAddressLine1}</p>
          {order.shippingAddressLine2 && (
            <p className="text-muted-foreground">{order.shippingAddressLine2}</p>
          )}
          {order.shippingPostalCode && (
            <p className="text-muted-foreground">ინდექსი: {order.shippingPostalCode}</p>
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
        {order.bogOrderId && (
          <div className="flex gap-2">
            <span className="text-muted-foreground w-32">BOG ID:</span>
            <span className="font-mono text-xs">{order.bogOrderId}</span>
          </div>
        )}
        {order.customerNotes && (
          <div className="flex gap-2">
            <span className="text-muted-foreground w-32">კომენტარი:</span>
            <span>{order.customerNotes}</span>
          </div>
        )}
      </div>

      {/* Status update */}
      <div className="rounded-2xl border border-black/8 bg-white p-5 space-y-4">
        <p className="font-medium">სტატუსის განახლება</p>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">სტატუსი</label>
          <select
            value={currentStatus}
            onChange={(e) => setStatusValue(e.target.value as OrderStatus)}
            className="w-full sm:w-64 rounded-xl border border-black/10 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {OrderStatusLabels[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">ადმინის შენიშვნა</label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            maxLength={1000}
            className="w-full rounded-xl border border-black/10 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
            placeholder="შიდა შენიშვნა (მომხმარებელს არ ეჩვენება)"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="bg-accent text-white hover:bg-accent-hover"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ინახება...
              </>
            ) : (
              "განახლება"
            )}
          </Button>
          {saved && (
            <span className="text-green-600 text-sm">✓ შენახულია</span>
          )}
          {mutation.isError && (
            <span className="text-red-500 text-sm">შეცდომა. სცადეთ თავიდან.</span>
          )}
        </div>
      </div>
    </div>
  );
}
