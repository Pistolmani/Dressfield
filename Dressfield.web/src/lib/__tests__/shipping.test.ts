import { describe, expect, it } from "vitest";
import {
  TBILISI_SHIPPING_COST,
  OTHER_CITIES_SHIPPING_COST,
  getShippingCostByCity,
} from "@/lib/shipping";

describe("getShippingCostByCity", () => {
  it("charges the Tbilisi rate for Tbilisi in any casing/spacing", () => {
    for (const city of ["Tbilisi", "tbilisi", "TBILISI", "  Tbilisi  ", "თბილისი"]) {
      expect(getShippingCostByCity(city)).toBe(TBILISI_SHIPPING_COST);
    }
  });

  it("defaults an empty city to the Tbilisi rate", () => {
    expect(getShippingCostByCity("")).toBe(TBILISI_SHIPPING_COST);
    expect(getShippingCostByCity("   ")).toBe(TBILISI_SHIPPING_COST);
  });

  it("charges the other-cities rate everywhere else", () => {
    for (const city of ["Batumi", "ბათუმი", "KUTAISI", "Rustavi"]) {
      expect(getShippingCostByCity(city)).toBe(OTHER_CITIES_SHIPPING_COST);
    }
  });

  it("keeps the documented tier values (must match backend)", () => {
    expect(TBILISI_SHIPPING_COST).toBe(5);
    expect(OTHER_CITIES_SHIPPING_COST).toBe(15);
  });
});
