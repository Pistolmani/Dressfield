/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getMyOrderById } from "@/lib/orders";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { formatPrice } from "@/lib/utils";

function ConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const isMock = params.get("mock") === "1";
  const { user } = useAuth();

  const id = orderId ? Number(orderId) : 0;

  const { data: order } = useQuery({
    queryKey: ["my-order", id],
    queryFn: () => getMyOrderById(id),
    enabled: !!user && id > 0,
    refetchInterval: (query) => {
      // Poll every 3s while still awaiting payment (webhook may not have arrived yet)
      const status = query.state.data?.status;
      return status === "AwaitingPayment" || status === "Pending" ? 3000 : false;
    },
  });

  const isPending = order?.status === "AwaitingPayment" || order?.status === "Pending";

  return (
    <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center px-4 text-center">
      {isPending ? (
        <Clock className="h-20 w-20 text-orange-400 mb-6" />
      ) : (
        <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
      )}

      <h1 className="font-ui text-5xl font-semibold mb-2">
        {isPending ? "გადახდა მუშავდება..." : "შეკვეთა წარმატებით გაფორმდა!"}
      </h1>

      {orderId && (
        <p className="text-muted-foreground text-lg mb-2">
          თქვენი შეკვეთის ნომერია{" "}
          <span className="font-semibold text-foreground">#{orderId}</span>
        </p>
      )}

      {order && (
        <div className="mb-4">
          <OrderStatusBadge status={order.status} />
        </div>
      )}

      <p className="text-muted-foreground max-w-md mb-6">
        {isPending
          ? "გადახდა დადასტურების პროცესშია. გთხოვთ დაელოდოთ."
          : "გადახდის დადასტურების შემდეგ მიიღებთ შეკვეთის დეტალებს ელ-ფოსტაზე."}
      </p>

      {/* Order summary */}
      {order && order.items.length > 0 && (
        <div className="w-full max-w-md rounded-2xl border border-black/8 bg-white text-left mb-6">
          <div className="px-4 py-3 border-b border-black/8">
            <p className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              შეკვეთის შეჯამება
            </p>
          </div>
          <div className="divide-y divide-black/5">
            {order.items.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {item.productImageUrl && (
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.productName}</p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  )}
                </div>
                <div className="text-sm text-right">
                  <p className="font-medium">{formatPrice(item.lineTotal)}</p>
                  <p className="text-xs text-muted-foreground">&times;{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-black/8 flex justify-between text-sm">
            <span className="font-semibold">სულ</span>
            <span className="font-semibold text-accent">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      )}

      {isMock && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
          (Dev: mock payment — no real transaction)
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {user && (
          <Link href={`/orders/detail?id=${orderId}`}>
            <Button variant="outline">შეკვეთის დეტალები</Button>
          </Link>
        )}
        <Link href="/">
          <Button className="bg-accent text-white hover:bg-accent-hover">
            მთავარ გვერდზე დაბრუნება
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">საყიდლები გაგრძელება</Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
