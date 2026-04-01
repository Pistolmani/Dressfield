import { describe, expect, it } from "vitest";
import { mergeCarts } from "@/lib/cart-merge";

describe("mergeCarts", () => {
  it("returns local-only items when server is empty", () => {
    const result = mergeCarts(
      [{ productId: 1, name: "Tee", price: 20, quantity: 2 }],
      []
    );
    expect(result).toHaveLength(1);
    expect(result[0].productId).toBe(1);
  });

  it("returns server-only items when local is empty", () => {
    const result = mergeCarts([], [
      {
        productId: 2,
        variantId: null,
        productName: "Cap",
        variantLabel: null,
        price: 15,
        quantity: 3,
        imageUrl: null,
      },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Cap");
  });

  it("uses max quantity for overlapping keys", () => {
    const result = mergeCarts(
      [{ productId: 1, variantId: 4, name: "Tee", price: 20, quantity: 1 }],
      [
        {
          productId: 1,
          variantId: 4,
          productName: "Tee",
          variantLabel: "Size: L",
          price: 22,
          quantity: 5,
          imageUrl: null,
        },
      ]
    );

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(5);
    expect(result[0].price).toBe(22);
  });

  it("unions unique items from both sides", () => {
    const result = mergeCarts(
      [{ productId: 1, name: "Tee", price: 20, quantity: 1 }],
      [
        {
          productId: 2,
          variantId: null,
          productName: "Cap",
          variantLabel: null,
          price: 15,
          quantity: 2,
          imageUrl: null,
        },
      ]
    );

    expect(result).toHaveLength(2);
    expect(result.map((x) => x.productId).sort()).toEqual([1, 2]);
  });
});
