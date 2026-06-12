type MetaEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

const CURRENCY = "GEL";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// --- Meta Pixel helpers -------------------------------------------------------

function trackMetaEvent(event: MetaEvent, params?: Record<string, unknown>) {
  if (!META_PIXEL_ID || typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }
  window.fbq("track", event, params);
}

// --- GA4 helpers -------------------------------------------------------------

function trackGaEvent(eventName: string, params?: Record<string, unknown>) {
  if (!GA_ID || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", eventName, params);
}

// --- Public tracking functions ------------------------------------------------

export function trackPageView() {
  trackMetaEvent("PageView");
  // GA4 pathname page_view is sent by <GoogleAnalytics />; this helper is only
  // called for Meta Pixel SPA navigation.
}

export function trackGaPageView(url: string) {
  if (!GA_ID || typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("config", GA_ID, { page_path: url });
}

export function trackViewContent(args: {
  contentId: string;
  contentName: string;
  value: number;
}) {
  trackMetaEvent("ViewContent", {
    content_ids: [args.contentId],
    content_name: args.contentName,
    content_type: "product",
    currency: CURRENCY,
    value: args.value,
  });

  trackGaEvent("view_item", {
    currency: CURRENCY,
    value: args.value,
    items: [
      {
        item_id: args.contentId,
        item_name: args.contentName,
      },
    ],
  });
}

export function trackAddToCart(args: {
  contentId: string;
  contentName: string;
  value: number;
  quantity: number;
}) {
  trackMetaEvent("AddToCart", {
    content_ids: [args.contentId],
    content_name: args.contentName,
    content_type: "product",
    currency: CURRENCY,
    value: args.value,
    num_items: args.quantity,
  });

  trackGaEvent("add_to_cart", {
    currency: CURRENCY,
    value: args.value,
    items: [
      {
        item_id: args.contentId,
        item_name: args.contentName,
        quantity: args.quantity,
      },
    ],
  });
}

export function trackInitiateCheckout(args: {
  contentIds: string[];
  value: number;
  itemCount: number;
}) {
  trackMetaEvent("InitiateCheckout", {
    content_ids: args.contentIds,
    content_type: "product",
    currency: CURRENCY,
    value: args.value,
    num_items: args.itemCount,
  });

  trackGaEvent("begin_checkout", {
    currency: CURRENCY,
    value: args.value,
    items: args.contentIds.map((id) => ({ item_id: id })),
  });
}

export function trackPurchase(args: {
  orderId: string;
  value: number;
}) {
  trackMetaEvent("Purchase", {
    content_type: "product",
    currency: CURRENCY,
    value: args.value,
    order_id: args.orderId,
  });

  trackGaEvent("purchase", {
    transaction_id: args.orderId,
    currency: CURRENCY,
    value: args.value,
  });
}
