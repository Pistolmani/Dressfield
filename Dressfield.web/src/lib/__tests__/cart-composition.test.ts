import { describe, expect, it } from "vitest";
import { getCartComposition } from "@/lib/cart-composition";
import type { CartItem } from "@/stores/cart-store";

const regular = (id: number): CartItem => ({
  productId: id,
  name: `Product ${id}`,
  price: 10,
  quantity: 1,
});

const custom = (id: number): CartItem => ({
  ...regular(id),
  // getCartComposition only checks truthiness of customOrderData
  customOrderData: {} as CartItem["customOrderData"],
});

describe("getCartComposition", () => {
  it("treats an empty cart as nothing to pay", () => {
    const c = getCartComposition([]);
    expect(c.payableOrderCount).toBe(0);
    expect(c.requiresSeparateCheckout).toBe(false);
  });

  it("collapses multiple regular items into a single payable order", () => {
    const c = getCartComposition([regular(1), regular(2), regular(3)]);
    expect(c.regularItems).toHaveLength(3);
    expect(c.payableOrderCount).toBe(1);
    expect(c.requiresSeparateCheckout).toBe(false);
  });

  it("allows a single custom item on its own", () => {
    const c = getCartComposition([custom(1)]);
    expect(c.customItems).toHaveLength(1);
    expect(c.payableOrderCount).toBe(1);
    expect(c.requiresSeparateCheckout).toBe(false);
  });

  it("flags a custom item mixed with regular items", () => {
    const c = getCartComposition([custom(1), regular(2)]);
    expect(c.payableOrderCount).toBe(2);
    expect(c.requiresSeparateCheckout).toBe(true);
  });

  it("flags multiple custom items", () => {
    const c = getCartComposition([custom(1), custom(2)]);
    expect(c.payableOrderCount).toBe(2);
    expect(c.requiresSeparateCheckout).toBe(true);
  });

  it("flags multiple custom items together with regular items", () => {
    const c = getCartComposition([custom(1), custom(2), regular(3)]);
    expect(c.payableOrderCount).toBe(3);
    expect(c.requiresSeparateCheckout).toBe(true);
  });
});
