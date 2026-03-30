/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPlacementLabel,
  getSizeLabel,
  getThreadColorLabel,
  getAdminCustomOrderById,
  updateCustomOrderStatus,
} from "@/lib/custom-orders";
import { formatPrice } from "@/lib/catalog";
import {
  CustomOrderStatusLabels,
  type CustomOrderDetailDto,
  type CustomOrderStatus,
} from "@/types/custom-order";

const statusOptions: CustomOrderStatus[] = [0, 1, 2, 3, 4, 5, 6];

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

export function CustomOrderDetail({ id }: { id: number }) {
  const orderQuery = useQuery({
    queryKey: ["admin-custom-order", id],
    queryFn: () => getAdminCustomOrderById(id),
  });

  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-muted-foreground">იტვირთება...</div>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-destructive">
        შეკვეთის ჩატვირთვა ვერ მოხერხდა.
      </div>
    );
  }

  return <CustomOrderDetailContent key={order.id} order={order} />;
}

function CustomOrderDetailContent({ order }: { order: CustomOrderDetailDto }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<CustomOrderStatus>(order.status);
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || "");

  const updateMutation = useMutation({
    mutationFn: () => updateCustomOrderStatus(order.id, status, adminNotes || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-custom-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-custom-order", order.id] });
      toast.success("სტატუსი განახლდა");
    },
    onError: () => toast.error("სტატუსის განახლება ვერ მოხერხდა"),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Link href="/admin/custom-orders">
        <Button variant="outline">
          <ArrowLeft className="h-4 w-4" />
          უკან
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">შეკვეთა #{order.id}</p>
                <h1 className="font-ui text-5xl font-semibold tracking-[0.04em]">
                  {order.contactName}
                </h1>
              </div>
              <Badge className={getStatusBadgeClass(order.status)}>
                {CustomOrderStatusLabels[order.status]}
              </Badge>
            </div>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">ტელეფონი</p>
                <p>{order.contactPhone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ელ-ფოსტა</p>
                <p>{order.contactEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">შექმნის თარიღი</p>
                <p>{new Date(order.createdAt).toLocaleString("ka-GE")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">განახლების თარიღი</p>
                <p>{new Date(order.updatedAt).toLocaleString("ka-GE")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">პროდუქტი</p>
                <p>{order.baseProductName || "ცარიელი ტილო"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ფასი</p>
                <p className="text-accent">{formatPrice(order.totalPrice)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
            <h2 className="font-ui text-3xl font-semibold">
              დიზაინები
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {order.designs.map((design) => (
                <div key={design.id} className="space-y-3 rounded-3xl border border-black/8 p-4">
                  <img
                    src={design.designImageUrl}
                    alt="დიზაინი"
                    className="h-[200px] w-full rounded-2xl object-cover"
                  />
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">განთავსება:</span> {getPlacementLabel(design.placement)}</p>
                    <p><span className="text-muted-foreground">ზომა:</span> {getSizeLabel(design.size)}</p>
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground">ძაფის ფერი:</span>
                      {design.threadColor ? (
                        <>
                          <span
                            className="h-4 w-4 rounded-full border border-black/8"
                            style={{ backgroundColor: design.threadColor }}
                          />
                          {getThreadColorLabel(design.threadColor)}
                        </>
                      ) : (
                        "-"
                      )}
                    </p>
                    <p><span className="text-muted-foreground">სიგანე:</span> {design.width ?? "-"}%</p>
                    <p><span className="text-muted-foreground">სიმაღლე:</span> {design.height ?? "-"}%</p>
                    <p><span className="text-muted-foreground">X:</span> {design.positionX ?? "-"}%</p>
                    <p><span className="text-muted-foreground">Y:</span> {design.positionY ?? "-"}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.customerNotes ? (
            <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
              <h2 className="font-ui text-3xl font-semibold">
                მომხმარებლის შენიშვნა
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {order.customerNotes}
              </p>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm h-fit">
          <h2 className="font-ui text-3xl font-semibold">
            სტატუსის განახლება
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">მიმდინარე სტატუსი</p>
              <Badge className={getStatusBadgeClass(order.status)}>
                {CustomOrderStatusLabels[order.status]}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ახალი სტატუსი</label>
              <select
                value={status}
                onChange={(event) => setStatus(Number(event.target.value) as CustomOrderStatus)}
                className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-accent"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {CustomOrderStatusLabels[option]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ადმინისტრატორის შენიშვნა</label>
              <textarea
                rows={5}
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                className="w-full rounded-xl border border-input px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <Button
              className="w-full bg-accent text-white hover:bg-accent-hover"
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              სტატუსის განახლება
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
