import type { CartItem } from "@/stores/cart-store";
import type { ServerCartItemDto } from "@/types/cart";

function itemKey(productId: number | string, variantId?: number | null) {
  return `${productId}-${variantId ?? 0}`;
}

export function mapServerCartItemToLocal(item: ServerCartItemDto): CartItem {
  return {
    productId: item.productId,
    variantId: item.variantId ?? undefined,
    name: item.productName,
    variantLabel: item.variantLabel ?? undefined,
    price: item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl ?? undefined,
  };
}

export function mapServerCartToLocal(items: ServerCartItemDto[]): CartItem[] {
  return items.map(mapServerCartItemToLocal);
}

export function mergeCarts(localItems: CartItem[], serverItems: ServerCartItemDto[]): CartItem[] {
  const merged = new Map<string, CartItem>();

  for (const item of localItems) {
    merged.set(itemKey(item.productId, item.variantId), { ...item });
  }

  for (const serverItem of serverItems) {
    const mappedServer = mapServerCartItemToLocal(serverItem);
    const key = itemKey(mappedServer.productId, mappedServer.variantId);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, mappedServer);
      continue;
    }

    merged.set(key, {
      ...existing,
      name: mappedServer.name || existing.name,
      variantLabel: mappedServer.variantLabel ?? existing.variantLabel,
      price: mappedServer.price,
      imageUrl: mappedServer.imageUrl ?? existing.imageUrl,
      quantity: Math.max(existing.quantity, mappedServer.quantity),
    });
  }

  return Array.from(merged.values());
}
