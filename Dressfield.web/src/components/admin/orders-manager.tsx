"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAdminOrder, deleteAllPendingOrders, getAdminOrders } from "@/lib/orders";
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
  const queryClient = useQueryClient();

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: () => getAdminOrders(statusFilter || undefined),
  });

  // Only Pending orders can be hard-deleted; the backend enforces the same rule.
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-summary"] });
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "შეცდომა შეკვეთის წაშლისას.";
      window.alert(message);
    },
  });

  const handleDelete = (id: number) => {
    if (!window.confirm(`დარწმუნებული ხართ, რომ შეკვეთა #${id}-ის წაშლა გსურთ?`)) return;
    deleteMutation.mutate(id);
  };

  // Bulk delete - wipes every Pending order in one call. Guarded by the same
  // backend rule (only Pending can be removed), so this is safe to expose.
  const bulkDeleteMutation = useMutation({
    mutationFn: () => deleteAllPendingOrders(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-summary"] });
      if (result.deleted === 0) {
        window.alert("გადაუხდელი შეკვეთები არ მოიძებნა.");
      } else {
        window.alert(`წაიშალა ${result.deleted} შეკვეთა.`);
      }
    },
    onError: () => {
      window.alert("შეცდომა გადაუხდელი შეკვეთების წაშლისას.");
    },
  });

  const handleBulkDelete = () => {
    if (
      !window.confirm(
        "ნამდვილად გსურთ ყველა გადაუხდელი შეკვეთის წაშლა?\n\n" +
          "წაიშლება მხოლოდ გადაუხდელი შეკვეთები — გადახდილ შეკვეთებს ეს არ შეეხება."
      )
    )
      return;
    bulkDeleteMutation.mutate();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-ui text-4xl font-semibold">
          შეკვეთები
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            {bulkDeleteMutation.isPending ? "იშლება..." : "ყველა გადაუხდელის წაშლა"}
          </button>

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
              <th className="px-4 py-3 font-medium">შენიშვნა</th>
              <th className="px-4 py-3 font-medium">თარიღი</th>
              <th className="px-4 py-3 font-medium">ქმედება</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  იტვირთება...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-red-500">
                  შეცდომა მონაცემების ჩატვირთვისას.
                </td>
              </tr>
            )}
            {!isLoading && !isError && orders?.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
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
                <td className="px-4 py-3 text-muted-foreground max-w-[16rem]">
                  {order.customerNotes ? (
                    <span className="block truncate" title={order.customerNotes}>
                      {order.customerNotes}
                    </span>
                  ) : (
                    <span className="text-black/25">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/orders/detail?id=${order.id}`}
                      className="text-accent hover:underline text-xs font-medium"
                    >
                      დეტალები
                    </Link>
                    {order.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(order.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:underline text-xs font-medium disabled:opacity-50"
                        title="წაშლა (მხოლოდ Pending)"
                      >
                        {deleteMutation.isPending && deleteMutation.variables === order.id
                          ? "იშლება..."
                          : "წაშლა"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
