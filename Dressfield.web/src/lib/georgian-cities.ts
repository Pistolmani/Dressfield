// City options for the checkout delivery form.
//
// Delivery pricing is binary (see src/lib/shipping.ts): "თბილისი" → base rate,
// everything else (including OTHER_CITY) → other-cities rate. The value stored is
// the Georgian city name so it matches getShippingCostByCity and the backend.

export const OTHER_CITY = "სხვა ქალაქი";

export const GEORGIAN_CITIES = [
  "თბილისი",
  "ბათუმი",
  "ქუთაისი",
  "რუსთავი",
  "გორი",
  "ზუგდიდი",
  "ფოთი",
  "ხაშური",
  "სამტრედია",
  "სენაკი",
  "ზესტაფონი",
  "მარნეული",
  "თელავი",
  "ახალციხე",
  "ქობულეთი",
  "ოზურგეთი",
  "კასპი",
  "ბორჯომი",
  "ახალქალაქი",
  "გარდაბანი",
] as const;

/** All selectable options in display order, with "Other" last. */
export const CITY_OPTIONS: readonly string[] = [...GEORGIAN_CITIES, OTHER_CITY];
