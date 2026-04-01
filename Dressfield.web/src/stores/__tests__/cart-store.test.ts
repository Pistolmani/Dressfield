import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "@/stores/cart-store";

describe("cart-store", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().setItems([]);
  });

  it("adds and aggregates duplicate items", () => {
    const store = useCartStore.getState();

    store.addItem({
      productId: 1,
      name: "Tee",
      price: 20,
      quantity: 1,
    });
    store.addItem({
      productId: 1,
      name: "Tee",
      price: 20,
      quantity: 2,
    });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it("removes item by product+variant key", () => {
    useCartStore.getState().setItems([
      { productId: 1, variantId: 1, name: "Tee", price: 20, quantity: 1 },
      { productId: 1, variantId: 2, name: "Tee", price: 22, quantity: 1 },
    ]);

    useCartStore.getState().removeItem(1, 1);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].variantId).toBe(2);
  });

  it("updates quantity", () => {
    useCartStore.getState().setItems([
      { productId: 5, name: "Hoodie", price: 80, quantity: 1 },
    ]);

    useCartStore.getState().updateQuantity(5, undefined, 4);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  it("clears cart", () => {
    useCartStore.getState().setItems([
      { productId: 1, name: "Tee", price: 20, quantity: 1 },
    ]);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("computes totals", () => {
    useCartStore.getState().setItems([
      { productId: 1, name: "Tee", price: 20, quantity: 2 },
      { productId: 2, name: "Cap", price: 15, quantity: 3 },
    ]);

    expect(useCartStore.getState().totalItems()).toBe(5);
    expect(useCartStore.getState().totalPrice()).toBe(85);
  });
});
