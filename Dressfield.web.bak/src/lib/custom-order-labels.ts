import type { ProductColor, ProductTypeId } from "@/config/custom-order";

const mojibakeMarker = "áƒ";

export const PRODUCT_DISPLAY_LABELS: Record<ProductTypeId, string> = {
  hoodie: "ჰუდი",
  sweater: "სვიტერი",
  tshirt: "მაისური",
  longsleeve: "გრძელსახელოიანი",
  cap: "კეპი",
  custom: "სხვა პროდუქტი",
};

export const EMBROIDERY_SIZE_NOTES: Record<"S" | "M" | "L" | "XL", string> = {
  S: "მცირე (~5×5 სმ)",
  M: "საშუალო (~8×8 სმ)",
  L: "დიდი (~12×12 სმ)",
  XL: "ძალიან დიდი (~15×15 სმ)",
};

export function normalizeText(raw: string | null | undefined, fallback: string) {
  if (!raw) return fallback;
  return raw.includes(mojibakeMarker) ? fallback : raw;
}

export function getProductDisplayLabel(productId: ProductTypeId, rawLabel: string) {
  return normalizeText(rawLabel, PRODUCT_DISPLAY_LABELS[productId]);
}

export function getColorDisplayLabel(color: ProductColor | null | undefined) {
  if (!color) return "";

  const fallback = color.id
    .replace(/_/g, " ")
    .replace(/\b[a-z]/g, (ch) => ch.toUpperCase());

  return normalizeText(color.label, fallback);
}
