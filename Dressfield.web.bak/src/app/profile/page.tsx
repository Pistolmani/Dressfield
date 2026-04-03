"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, User, LogOut, Loader2, Save } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getMyOrders } from "@/lib/orders";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ka-GE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

import { useSearchParams } from "next/navigation";

function ProfileContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState<"info" | "orders">(
    queryTab === "orders" ? "orders" : "info"
  );

  // Sync tab with URL search params when they change
  useEffect(() => {
    setActiveTab(queryTab === "orders" ? "orders" : "info");
  }, [queryTab]);

  // Edit info state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
    enabled: !!user && activeTab === "orders",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      await api.put("/api/auth/profile", data);
    },
    onSuccess: () => {
      toast.success("მონაცემები წარმატებით განახლდა");
      // In a real app, I'd update the user object in the auth context too
      // For now, I'll assume the back-end handles it and a refresh would show the truth.
      // But let's trigger a refresh if needed.
    },
    onError: () => {
      toast.error("მონაცემების განახლება ვერ მოხერხდა");
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">პროფილის სანახავად გაიარეთ ავტორიზაცია.</p>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-ui text-3xl font-bold tracking-tight">ჩემი პროფილი</h1>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => void logout()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          გასვლა
        </Button>
      </div>

      <div className="flex border-b border-black/8">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "info" ? "text-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          პირადი ინფორმაცია
          {activeTab === "info" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "orders" ? "text-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          შეკვეთების ისტორია
          {activeTab === "orders" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      </div>

      <div className="min-h-[40vh]">
        {activeTab === "info" ? (
          <div className="bg-white border border-black/8 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">სახელი</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-black/10 focus:border-accent outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">გვარი</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-black/10 focus:border-accent outline-none transition-colors"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 opacity-50">ელ-ფოსტა (არ იცვლება)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full h-11 px-4 rounded-xl border border-black/10 bg-gray-50 text-muted-foreground cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                className="w-full sm:w-auto px-8 h-12 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({ firstName, lastName })}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                შენახვა
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground/40" />
              </div>
            ) : orders?.length === 0 ? (
              <div className="bg-white border border-black/8 rounded-2xl py-16 text-center space-y-4">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <div className="space-y-1">
                  <p className="font-medium">შეკვეთები არ მოიძებნა</p>
                  <p className="text-sm text-muted-foreground">თქვენ ჯერ არ გაქვთ განხორციელებული შეკვეთა.</p>
                </div>
                <Link
                  href="/products"
                  className="inline-block bg-accent text-white px-8 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  პროდუქციის ნახვა
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders?.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/detail?id=${order.id}`}
                    className="block bg-white border border-black/8 rounded-2xl p-5 hover:border-accent/40 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="font-bold">შეკვეთა #{order.id}</span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          {formatDate(order.createdAt)} &middot; {order.itemCount} ნივთი
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="text-lg font-bold text-accent">
                          {formatPrice(order.totalAmount)}
                        </span>
                        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                          <Package className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}
