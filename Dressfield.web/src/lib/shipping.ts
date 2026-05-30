// Delivery pricing for regular (catalog) orders.
//
// IMPORTANT: the backend mirrors this exact rule in
// Dressfield.Infrastructure/Services/OrderService.cs -> ResolveShippingCost().
// If you change the costs or the city matching here, change it there too, or the
// amount shown at checkout will drift from the amount charged at BOG.

export const TBILISI_SHIPPING_COST = 5;
export const OTHER_CITIES_SHIPPING_COST = 15;

/** Tbilisi (any casing/spacing, Latin or Georgian) ships at the base rate; everywhere else is the other-cities rate. */
export function getShippingCostByCity(city: string): number {
  const normalized = city.trim().toLowerCase();
  if (!normalized) return TBILISI_SHIPPING_COST;
  if (normalized === "tbilisi" || normalized === "თბილისი") {
    return TBILISI_SHIPPING_COST;
  }
  return OTHER_CITIES_SHIPPING_COST;
}
