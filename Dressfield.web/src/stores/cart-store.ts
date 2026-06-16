import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAccessToken } from "@/lib/api";
import { syncServerCart } from "@/lib/cart-api";

export interface CustomOrderData {
  productLabel?: string;
  productTypeId: string;
  orderIntent?: "own-product" | "buy-product";
  clothingSize?: string;
  selectedColor?: { id: string; label: string; hex: string };
  embroiderySize: string;
  frontDesignCount: number;
  backDesignCount: number;
  designs?: Array<{
    url: string;
    side: "front" | "back";
    sortOrder: number;
    transform?: {
      left: number;
      top: number;
      scaleX: number;
      scaleY: number;
      angle: number;
    };
  }>;
  orderNote?: string;
  canvasPreviewUrl?: string;
}

export interface CartItem {
  productId: number;
  productSlug?: string;
  variantId?: number;
  name: string;
  variantLabel?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  customOrderData?: CustomOrderData;
}

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, variantId: number | undefined, quantity: number) => void;
  clearCustomItems: () => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

function itemKey(productId: number, variantId?: number) {
  return `${productId}-${variantId ?? 0}`;
}

let suppressSync = false;
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let lastSyncedSnapshot = "[]";

export function setCartSyncSuppressed(value: boolean) {
  suppressSync = value;

  if (value && syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }
}

// Snapshot of the syncable items, used to detect real changes worth pushing to
// the server. Custom-order items are excluded (no server counterpart).
function computeSyncSnapshot(items: CartItem[]) {
  return JSON.stringify(
    items
      .filter((item) => !item.customOrderData)
      .map((item) => ({
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
      }))
  );
}

// Record the just-loaded server cart as the synced baseline. Must be called
// after replacing the local cart with the server's (login/refresh hydration);
// otherwise the baseline stays "[]" and the first removal back to an empty cart
// matches it and is wrongly skipped, so the server keeps the deleted item and it
// reappears on the next refresh.
export function markCartSynced(items: CartItem[]) {
  lastSyncedSnapshot = computeSyncSnapshot(items);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) =>
        set({
          items: items.map((item) => ({ ...item })),
        }),

      addItem: (item) =>
        set((state) => {
          const key = itemKey(item.productId, item.variantId);
          const existing = state.items.find((i) => itemKey(i.productId, i.variantId) === key);

          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.productId, i.variantId) === key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          return { items: [...state.items, item] };
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.productId, i.variantId) !== itemKey(productId, variantId)
          ),
        })),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.productId, i.variantId) === itemKey(productId, variantId)
              ? { ...i, quantity }
              : i
          ),
        })),

      clearCustomItems: () =>
        set((state) => ({
          items: state.items.filter((item) => !item.customOrderData),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "dressfield-cart" }
  )
);

useCartStore.subscribe((state, prevState) => {
  if (state.items === prevState.items) return;
  if (suppressSync) return;
  if (!getAccessToken()) return;

  const snapshot = computeSyncSnapshot(state.items);

  if (snapshot === lastSyncedSnapshot) return;

  if (syncTimer) clearTimeout(syncTimer);

  syncTimer = setTimeout(async () => {
    try {
      await syncServerCart(useCartStore.getState().items.filter((i) => !i.customOrderData));
      lastSyncedSnapshot = snapshot;
    } catch {
      // Keep local cart untouched; next mutation retries sync.
    }
  }, 500);
});
