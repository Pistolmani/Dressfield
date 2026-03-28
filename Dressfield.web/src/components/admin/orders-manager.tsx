"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminOrders } from "@/lib/orders";
import {
  OrderStatus,
  OrderStatusLabels,
  OrderStatusColors,
} from "@/types/order";
import { formatPrice } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ka-GE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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

export default function OrdersManager() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: () => getAdminOrders(statusFilter || undefined),
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-inter)] text-2xl font-semibold">
          შეკვეთები
        </h1>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 w-full sm:w-56"
        >
          <option value="">ყველა სტატუსი</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {OrderStatusLabels[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-black/8 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-black/8 text-left text-muted-foreground text-xs">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">კონტაქტი</th>
              <th className="px-4 py-3 font-medium">ქალაქი</th>
              <th className="px-4 py-3 font-medium">სტატუსი</th>
              <th className="px-4 py-3 font-medium">ჯამი</th>
              <th className="px-4 py-3 font-medium">პოზ.</th>
              <th className="px-4 py-3 font-medium">თარიღი</th>
              <th className="px-4 py-3 font-medium">ქმედება</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  იტვირთება...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-red-500">
                  შეცდომა მონაცემების ჩატვირთვისას.
                </td>
              </tr>
            )}
            {!isLoading && !isError && orders?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  შეკვეთები არ მოიძებნა.
                </td>
              </tr>
            )}
            {orders?.map((order) => (
              <tr
                key={order.id}
                className="border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors"
              >
                <td className="px-4 py-3 font-medium text-muted-foreground">
                  #{order.id}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{order.contactName}</p>
                  <p className="text-xs text-muted-foreground">{order.contactPhone}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.shippingCity}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${OrderStatusColors[order.status]}`}
                  >
                    {OrderStatusLabels[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-accent">
                  {formatPrice(order.totalAmount)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.itemCount}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/detail?id=${order.id}`}
                    className="text-accent hover:underline text-xs font-medium"
                  >
                    დეტალები
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
