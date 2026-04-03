type MetaEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

const CURRENCY = "GEL";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function trackMetaEvent(event: MetaEvent, params?: Record<string, unknown>) {
  if (!META_PIXEL_ID || typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("track", event, params);
}

export function trackPageView() {
  trackMetaEvent("PageView");
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
}

