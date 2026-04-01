import api from "@/lib/api";
import type { CartItem } from "@/stores/cart-store";
import type { ServerCartDto, SyncCartItemRequest, SyncCartRequest } from "@/types/cart";

export function toSyncCartItems(items: CartItem[]): SyncCartItemRequest[] {
  return items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
  }));
}

export async function getServerCart(): Promise<ServerCartDto> {
  const { data } = await api.get<ServerCartDto>("/api/cart");
  return data;
}

export async function syncServerCart(items: CartItem[]): Promise<ServerCartDto> {
  const payload: SyncCartRequest = { items: toSyncCartItems(items) };
  const { data } = await api.put<ServerCartDto>("/api/cart", payload);
  return data;
}

export async function clearServerCart(): Promise<void> {
  await api.delete("/api/cart");
}
