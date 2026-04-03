"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  ShoppingBag,
  Scissors,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAdminOrders } from "@/lib/orders";
import { getAdminCustomOrders } from "@/lib/custom-orders";
import { getAdminDashboardSummary } from "@/lib/admin-dashboard";
import { OrderStatusLabels, OrderStatusColors } from "@/types/order";
import { CustomOrderStatusLabels } from "@/types/custom-order";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ka-GE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminDashboardPage() {
  const {
    data: summary,
    isLoading: loadingSummary,
    isError: errorSummary,
  } = useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: () => getAdminDashboardSummary(),
  });

  const {
    data: orders = [],
    isLoading: loadingOrders,
    isError: errorOrders,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => getAdminOrders(),
  });

  const {
    data: customOrders = [],
    isLoading: loadingCustom,
    isError: errorCustom,
  } = useQuery({
    queryKey: ["admin-custom-orders"],
    queryFn: () => getAdminCustomOrders(),
  });

  const isLoading = loadingSummary || loadingOrders || loadingCustom;
  const isError = errorSummary || errorOrders || errorCustom;

  const totalOrdersCount = summary?.totalOrders ?? 0;
  const totalRevenue = summary?.totalRevenue ?? 0;
  const paidTodayCount = summary?.paidTodayCount ?? 0;
  const pendingCustomCount = summary?.pendingCustomOrdersCount ?? 0;

  // Pending + reviewing require admin attention
  const pendingCustomOrders = customOrders.filter((co) => co.status === 0 || co.status === 1);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentPendingCustom = [...pendingCustomOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">ადმინისტრატორი</p>
        <h1 className="text-3xl font-ui font-semibold text-foreground mt-1">მართვის პანელი</h1>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">შეცდომა</h3>
            <p className="text-sm text-red-700 mt-1">
              მონაცემების ჩატვირთვა ვერ მოხერხდა. სცადეთ მოგვიანებით.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          loading={isLoading}
          icon={ShoppingBag}
          label="სულ შეკვეთები"
          value={totalOrdersCount.toString()}
          iconClassName="text-blue-600 bg-blue-100"
        />
        <KpiCard
          loading={isLoading}
          icon={TrendingUp}
          label="შემოსავალი"
          value={formatPrice(totalRevenue)}
          iconClassName="text-green-600 bg-green-100"
        />
        <KpiCard
          loading={isLoading}
          icon={DollarSign}
          label="გადახდილი დღეს"
          value={paidTodayCount.toString()}
          iconClassName="text-emerald-600 bg-emerald-100"
        />
        <KpiCard
          loading={isLoading}
          icon={Clock}
          label="მოლოდინში (Custom)"
          value={pendingCustomCount.toString()}
          iconClassName="text-orange-600 bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold font-ui">ბოლო შეკვეთები</h2>
              <Link
                href="/admin/orders"
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                ყველა ნახვა <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
              {isLoading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground text-sm">
                  შეკვეთები არ მოიძებნა
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 hover:bg-black/[0.02] transition-colors"
                    >
                      <div>
                        <Link
                          href={`/admin/orders/detail?id=${order.id}`}
                          className="font-medium hover:underline text-foreground"
                        >
                          #{order.id} {order.contactName}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(order.createdAt)} · {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${OrderStatusColors[order.status]}`}
                      >
                        {OrderStatusLabels[order.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold font-ui">ყურადღება (Custom)</h2>
              <Link
                href="/admin/custom-orders"
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                ყველა მართვა <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50/30 overflow-hidden shadow-sm">
              {isLoading ? (
                <div className="p-5 space-y-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : recentPendingCustom.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  მოლოდინში მყოფი შეკვეთები არ არის
                </div>
              ) : (
                <div className="divide-y divide-orange-200">
                  {recentPendingCustom.map((co) => (
                    <div
                      key={co.id}
                      className="flex items-center justify-between p-4 hover:bg-orange-50/50 transition-colors"
                    >
                      <div>
                        <Link
                          href={`/admin/custom-orders/detail?id=${co.id}`}
                          className="font-medium hover:underline text-foreground"
                        >
                          #{co.id} {co.contactName}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(co.createdAt)}</p>
                      </div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-200 text-orange-900 border border-orange-300">
                        {CustomOrderStatusLabels[co.status as keyof typeof CustomOrderStatusLabels]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-4 text-center lg:text-left">
              სწრაფი ქმედებები
            </h2>
            <div className="space-y-3">
              <QuickActionCard href="/admin/products" icon={Package} label="პროდუქტები" />
              <QuickActionCard href="/admin/orders" icon={ShoppingBag} label="შეკვეთები" />
              <QuickActionCard href="/admin/custom-orders" icon={Scissors} label="Custom შეკვეთები" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  loading,
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  loading: boolean;
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-20 mt-1" />
          ) : (
            <p className="text-2xl font-semibold font-ui mt-0.5">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-border bg-white p-4 shadow-sm hover:border-accent hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <span className="font-semibold text-foreground text-sm">{label}</span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
    </Link>
  );
}

