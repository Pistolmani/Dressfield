import type { CartItem } from "@/stores/cart-store";

export const SEPARATE_CHECKOUT_REQUIRED_MESSAGE =
  "ინდივიდუალური შეკვეთა უნდა გაფორმდეს ცალკე. გთხოვთ დატოვოთ კალათაში მხოლოდ ერთი გადასახდელი შეკვეთა.";

export function getCartComposition(items: CartItem[]) {
  const customItems = items.filter((item) => Boolean(item.customOrderData));
  const regularItems = items.filter((item) => !item.customOrderData);
  const payableOrderCount = customItems.length + (regularItems.length > 0 ? 1 : 0);

  return {
    customItems,
    regularItems,
    payableOrderCount,
    requiresSeparateCheckout: payableOrderCount > 1,
  };
}
