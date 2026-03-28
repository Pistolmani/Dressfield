"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/catalog";
import { getAdminCustomOrders } from "@/lib/custom-orders";
import {
  CustomOrderStatusLabels,
  type CustomOrderStatus,
} from "@/types/custom-order";

const statusOptions: Array<{ value: "all" | CustomOrderStatus; label: string }> = [
  { value: "all", label: "ყველა სტატუსი" },
  { value: 0, label: "მოლოდინში" },
  { value: 1, label: "განხილვაში" },
  { value: 2, label: "დამტკიცებულია" },
  { value: 3, label: "წარმოებაში" },
  { value: 4, label: "დასრულებულია" },
  { value: 5, label: "უარყოფილია" },
  { value: 6, label: "გაუქმებულია" },
];

function getStatusBadgeClass(status: CustomOrderStatus) {
  switch (status) {
    case 0:
      return "bg-amber-100 text-amber-700";
    case 1:
      return "bg-blue-100 text-blue-700";
    case 2:
      return "bg-green-100 text-green-700";
    case 3:
      return "bg-accent/15 text-accent";
    case 4:
      return "bg-emerald-100 text-emerald-700";
    case 5:
      return "bg-red-100 text-red-700";
    case 6:
      return "bg-gray-200 text-gray-700";
  }
}

export function CustomOrdersManager() {
  const [status, setStatus] = useState<"all" | CustomOrderStatus>("all");

  const ordersQuery = useQuery({
    queryKey: ["admin-custom-orders", status],
    queryFn: () => getAdminCustomOrders(status === "all" ? undefined : status),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            ინდივიდუალური შეკვეთები
          </p>
          <h1 className="font-[family-name:var(--font-inter)] text-3xl font-semibold tracking-tight">
            შეკვეთების მართვა
          </h1>
        </div>
        <select
          value={String(status)}
          onChange={(event) =>
            setStatus(
              event.target.value === "all"
                ? "all"
                : (Number(event.target.value) as CustomOrderStatus)
            )
          }
          className="h-10 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-accent"
        >
          {statusOptions.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-black/[0.03] text-left">
              <tr>
                <th className="px-5 py-4 font-medium">ID</th>
                <th className="px-5 py-4 font-medium">სახელი</th>
                <th className="px-5 py-4 font-medium">ელ-ფოსტა</th>
                <th className="px-5 py-4 font-medium">პროდუქტი</th>
                <th className="px-5 py-4 font-medium">ფასი</th>
                <th className="px-5 py-4 font-medium">სტატუსი</th>
                <th className="px-5 py-4 font-medium">თარიღი</th>
                <th className="px-5 py-4 font-medium text-right">ჩვენება</th>
              </tr>
            </thead>
            <tbody>
              {ordersQuery.isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                    იტვირთება...
                  </td>
                </tr>
              ) : ordersQuery.isError ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-destructive">
                    შეკვეთების ჩატვირთვა ვერ მოხერხდა.
                  </td>
                </tr>
              ) : ordersQuery.data?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                    შეკვეთები არ მოიძებნა.
                  </td>
                </tr>
              ) : null}

              {ordersQuery.data?.map((order) => (
                <tr key={order.id} className="border-t border-black/6">
                  <td className="px-5 py-4">#{order.id}</td>
                  <td className="px-5 py-4">{order.contactName}</td>
                  <td className="px-5 py-4">{order.contactEmail}</td>
                  <td className="px-5 py-4">{order.baseProductName || "ცარიელი ტილო"}</td>
                  <td className="px-5 py-4 text-accent">{formatPrice(order.totalPrice)}</td>
                  <td className="px-5 py-4">
                    <Badge className={getStatusBadgeClass(order.status)}>
                      {CustomOrderStatusLabels[order.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    {new Date(order.createdAt).toLocaleDateString("ka-GE")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/custom-orders/detail?id=${order.id}`}>
                      <Button variant="outline" size="sm">
                        ჩვენება
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
