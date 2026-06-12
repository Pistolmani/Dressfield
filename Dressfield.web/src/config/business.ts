// Central merchant/legal identity used across the footer and policy pages.
// Required by Bank of Georgia iPay to lift the test transaction limit.
//
// TODO(owner): replace `legalName` and `idNumber` with the real Individual
// Entrepreneur (ი/მ) registration details, then rebuild and redeploy.
export const BUSINESS = {
  displayName: "DressField",

  // --- Legal identity (Individual Entrepreneur / ი/მ) ---
  legalForm: "ი/მ",
  legalName: "ი/მ [სახელი გვარი]", // TODO(owner): confirm exact registered name
  idNumber: "[ს/კ XXXXXXXXX]", // TODO(owner): confirm personal/tax ID number

  // --- Contact ---
  email: "contact@dressfield.ge",
  phone: "+995 511 226 148",
  phoneHref: "tel:+995511226148",

  // --- Presence ---
  country: "საქართველო",
  // Online-only store; no physical retail address.
  locationLabel: "ონლაინ მაღაზია — საქართველო",
  instagram: "https://www.instagram.com/dressfield.stitch/",
  instagramHandle: "dressfield.stitch",

  // --- Fulfilment ---
  deliveryDays: "2–5 სამუშაო დღე",
  currency: "ლარი (GEL)",
} as const;

// Convenience: full legal identity string, e.g. "ი/მ სახელი გვარი (ს/კ XXXXXXXXX)".
export const BUSINESS_LEGAL_LINE = `${BUSINESS.legalName} (${BUSINESS.idNumber})`;
