/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock, Package, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getMyOrderById, getPublicOrderStatus } from "@/lib/orders";
import { useCartStore } from "@/stores/cart-store";
import { trackPurchase } from "@/lib/analytics";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

type PollPhase = "polling" | "slow" | "timedOut";

const SLOW_THRESHOLD_MS = 120_000;
const TIMEOUT_THRESHOLD_MS = 300_000;
const POLL_INTERVAL_MS = 3_000;
const PHASE_TICK_MS = 5_000;

function isPendingStatus(status: OrderStatus | undefined) {
  return status === "AwaitingPayment" || status === "Pending";
}

function isTerminalStatus(status: OrderStatus | undefined) {
  return (
    status === "Paid" ||
    status === "Processing" ||
    status === "Shipped" ||
    status === "Delivered" ||
    status === "Cancelled" ||
    status === "Refunded"
  );
}

function ConfirmationContent() {
  const params = useSearchParams();
  const isCustomOrder = params.get("custom") === "1";
  const { user } = useAuth();
  const [phase, setPhase] = useState<PollPhase>("polling");

  const orderIdParam = params.get("orderId");
  const orderKeyParam = params.get("key");

  const orderId =
    orderIdParam ??
    (typeof window !== "undefined" ? localStorage.getItem("dressfield_pending_order_id") : null);

  const orderKey =
    orderKeyParam ??
    (typeof window !== "undefined" ? localStorage.getItem("dressfield_pending_order_key") : null);

  const id = orderId ? Number(orderId) : 0;
  const canPollAsUser = !isCustomOrder && !!user && id > 0;
  const canPollAsGuest = !isCustomOrder && !user && id > 0 && !!orderKey;
  const canPoll = canPollAsUser || canPollAsGuest;

  const clearCart = useCartStore((state) => state.clearCart);
  const clearCustomItems = useCartStore((state) => state.clearCustomItems);
  const pollStartRef = useRef<number | null>(null);
  const pollSessionRef = useRef<string>("");
  const hasTrackedPurchaseRef = useRef(false);
  const hasCartClearedRef = useRef(false);

  const pollSessionKey = `${id}:${orderKey ?? ""}:${user?.id ?? "guest"}`;

  const ensurePollSession = useCallback(() => {
    if (pollSessionRef.current !== pollSessionKey) {
      pollSessionRef.current = pollSessionKey;
      pollStartRef.current = Date.now();
      setPhase("polling");
      return;
    }

    if (pollStartRef.current === null) {
      pollStartRef.current = Date.now();
      setPhase("polling");
    }
  }, [pollSessionKey]);

  const updatePhaseFromElapsed = useCallback(() => {
    if (!canPoll) return;

    ensurePollSession();
    if (pollStartRef.current === null) return;

    const elapsed = Date.now() - pollStartRef.current;
    const nextPhase: PollPhase =
      elapsed > TIMEOUT_THRESHOLD_MS
        ? "timedOut"
        : elapsed > SLOW_THRESHOLD_MS
          ? "slow"
          : "polling";

    setPhase((prev) => (prev === nextPhase ? prev : nextPhase));
  }, [canPoll, ensurePollSession]);

  useEffect(() => {
    if (isCustomOrder) return;

    if (orderIdParam && typeof window !== "undefined") {
      localStorage.setItem("dressfield_pending_order_id", orderIdParam);
    }
    if (orderKeyParam && typeof window !== "undefined") {
      localStorage.setItem("dressfield_pending_order_key", orderKeyParam);
    }
  }, [isCustomOrder, orderIdParam, orderKeyParam]);

  useEffect(() => {
    if (!isCustomOrder || typeof window === "undefined") return;
    localStorage.removeItem("dressfield_pending_order_id");
    localStorage.removeItem("dressfield_pending_order_key");
    clearCustomItems();
  }, [isCustomOrder, clearCustomItems]);

  const myOrderQuery = useQuery({
    queryKey: ["my-order", id, pollSessionKey],
    queryFn: () => getMyOrderById(id),
    enabled: canPollAsUser,
    refetchInterval: (query) => {
      ensurePollSession();
      updatePhaseFromElapsed();

      if (pollStartRef.current === null) return false;
      const elapsed = Date.now() - pollStartRef.current;
      if (elapsed > TIMEOUT_THRESHOLD_MS) return false;

      return isPendingStatus(query.state.data?.status) || !query.state.data
        ? POLL_INTERVAL_MS
        : false;
    },
  });

  const guestStatusQuery = useQuery({
    queryKey: ["order-public-status", id, orderKey, pollSessionKey],
    queryFn: () => getPublicOrderStatus(id, orderKey!),
    enabled: canPollAsGuest,
    refetchInterval: (query) => {
      ensurePollSession();
      updatePhaseFromElapsed();

      if (pollStartRef.current === null) return false;
      const elapsed = Date.now() - pollStartRef.current;
      if (elapsed > TIMEOUT_THRESHOLD_MS) return false;

      return isPendingStatus(query.state.data?.status) || !query.state.data
        ? POLL_INTERVAL_MS
        : false;
    },
  });

  const status = myOrderQuery.data?.status ?? guestStatusQuery.data?.status;
  const isCancelled = status === "Cancelled";
  const isPending = canPoll && (isPendingStatus(status) || !status);

  useEffect(() => {
    if (!isPending) return;

    const interval = window.setInterval(() => {
      updatePhaseFromElapsed();
    }, PHASE_TICK_MS);

    return () => window.clearInterval(interval);
  }, [isPending, pollSessionKey, status, canPoll, updatePhaseFromElapsed]);

  useEffect(() => {
    if (!isPending && isTerminalStatus(status) && typeof window !== "undefined") {
      localStorage.removeItem("dressfield_pending_order_id");
      localStorage.removeItem("dressfield_pending_order_key");
    }
  }, [isPending, status]);

  useEffect(() => {
    if (!myOrderQuery.data || isPending || hasTrackedPurchaseRef.current) return;

    trackPurchase({
      orderId: String(myOrderQuery.data.id),
      value: myOrderQuery.data.totalAmount,
    });

    hasTrackedPurchaseRef.current = true;
  }, [myOrderQuery.data, isPending]);

  // Clear the cart once payment is confirmed (Paid or further). This fires here
  // rather than in checkout so that items are preserved if the user cancels payment.
  useEffect(() => {
    if (hasCartClearedRef.current) return;
    if (!isTerminalStatus(status) || status === "Cancelled" || status === "Refunded") return;
    clearCart();
    hasCartClearedRef.current = true;
  }, [status, clearCart]);

  if (!orderId || id <= 0) {
    return (
      <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center px-4 text-center">
        <AlertTriangle className="h-20 w-20 text-amber-500 mb-6" />
        <h1 className="font-ui text-4xl font-semibold mb-2">შეკვეთის ნომერი ვერ მოიძებნა</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          სცადეთ ელ-ფოსტის შემოწმება ან დაბრუნდით მთავარ გვერდზე.
        </p>
        <Link href="/">
          <Button className="bg-accent text-white hover:bg-accent-hover">
            მთავარ გვერდზე დაბრუნება
          </Button>
        </Link>
      </div>
    );
  }

  if (isCustomOrder) {
    return (
      <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
        <h1 className="font-ui text-5xl font-semibold mb-2">Custom order submitted</h1>
        <p className="text-muted-foreground text-lg mb-2">
          Order number: <span className="font-semibold text-foreground">#{orderId}</span>
        </p>
        <p className="text-muted-foreground max-w-md mb-6">
          We received your custom request and our team will contact you soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/">
            <Button className="bg-accent text-white hover:bg-accent-hover">
              მთავარი გვერდი
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">პროდუქტები</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasErrors =
    myOrderQuery.isError || guestStatusQuery.isError || (!canPollAsUser && !canPollAsGuest);

  return (
    <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center px-4 text-center">
      {isCancelled ? (
        <XCircle className="h-20 w-20 text-red-500 mb-6" />
      ) : isPending ? (
        phase === "timedOut" ? (
          <AlertTriangle className="h-20 w-20 text-amber-500 mb-6" />
        ) : (
          <Clock className="h-20 w-20 text-orange-400 mb-6" />
        )
      ) : (
        <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
      )}

      <h1 className="font-ui text-5xl font-semibold mb-2">
        {isCancelled
          ? "გადახდა უარყოფილია"
          : isPending
            ? phase === "timedOut"
              ? "გადახდა ჯერ კიდევ მუშავდება"
              : "გადახდა მუშავდება..."
            : "შეკვეთა წარმატებით გაფორმდა!"}
      </h1>

      <p className="text-muted-foreground text-lg mb-2">
        თქვენი შეკვეთის ნომერია <span className="font-semibold text-foreground">#{orderId}</span>
      </p>

      {status && (
        <div className="mb-4">
          <OrderStatusBadge status={status} />
        </div>
      )}

      {isPending && phase === "slow" && (
        <div className="mb-4 max-w-xl rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          გადახდის დადასტურება ჩვეულებრივზე მეტ დროს მოითხოვს. მიიღებთ დადასტურების ელ-ფოსტას.
        </div>
      )}

      {isPending && phase === "timedOut" ? (
        <p className="text-muted-foreground max-w-md mb-6">
          გადახდა ჯერ კიდევ მუშავდება. შეამოწმეთ ელ-ფოსტა ან შეკვეთების ისტორია.
        </p>
      ) : isCancelled ? (
        <p className="text-muted-foreground max-w-md mb-6">
          ტრანზაქცია არ დადასტურდა. შეგიძლიათ თავიდან სცადოთ.
        </p>
      ) : (
        <p className="text-muted-foreground max-w-md mb-6">
          გადახდის დადასტურების შემდეგ მიიღებთ შეკვეთის დეტალებს ელ-ფოსტაზე.
        </p>
      )}

      {myOrderQuery.data && myOrderQuery.data.items.length > 0 && (
        <div className="w-full max-w-md rounded-2xl border border-black/8 bg-white text-left mb-6">
          <div className="px-4 py-3 border-b border-black/8">
            <p className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              შეკვეთის შეჯამება
            </p>
          </div>
          <div className="divide-y divide-black/5">
            {myOrderQuery.data.items.map((item) => (
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
            <span className="font-semibold text-accent">
              {formatPrice(myOrderQuery.data.totalAmount)}
            </span>
          </div>
        </div>
      )}

<div className="flex flex-col sm:flex-row gap-3">
        {user && (
          <Link href={`/orders/detail?id=${orderId}`}>
            <Button variant="outline">შეკვეთის დეტალები</Button>
          </Link>
        )}
        {isPending && phase === "timedOut" ? (
          <Link href="/orders">
            <Button variant="outline">შეკვეთების ისტორია</Button>
          </Link>
        ) : isCancelled ? (
          <Link href="/products">
            <Button variant="outline">თავიდან სცადე</Button>
          </Link>
        ) : null}
        <Link href="/">
          <Button className="bg-accent text-white hover:bg-accent-hover">
            მთავარ გვერდზე დაბრუნება
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">საყიდლების გაგრძელება</Button>
        </Link>
      </div>

      {hasErrors && (
        <p className="mt-4 text-sm text-amber-700">
          შეკვეთის სტატუსის განახლება ამ ეტაპზე ვერ მოხერხდა. გადაამოწმეთ ელ-ფოსტა.
        </p>
      )}
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
