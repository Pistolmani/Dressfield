export interface DesignItem {
  id: string;
  url: string;
}

export const PRODUCT_TYPES = [
  {
    id: "hoodie",
    label: "ჰუდი",
    svgTemplate:     "/templates/hoodie.svg",
    svgTemplateBack: "/templates/hoodie-back.svg",
    designZone:     { x: 140, y: 120, width: 120, height: 120 },
    designZoneBack: { x: 135, y: 130, width: 130, height: 120 },
    basePrice: 50,
    skipClothingSize: false,
    skipDesign: false,
    hasBack: true,
  },
  {
    id: "sweater",
    label: "სვიტერი",
    svgTemplate:     "/templates/sweater.svg",
    svgTemplateBack: "/templates/sweater-back.svg",
    designZone:     { x: 140, y: 110, width: 120, height: 120 },
    designZoneBack: { x: 138, y: 120, width: 124, height: 118 },
    basePrice: 45,
    skipClothingSize: false,
    skipDesign: false,
    hasBack: true,
  },
  {
    id: "tshirt",
    label: "მაისური",
    svgTemplate:     "/templates/tshirt.svg",
    svgTemplateBack: "/templates/tshirt-back.svg",
    designZone:     { x: 130, y: 100, width: 140, height: 120 },
    designZoneBack: { x: 135, y: 118, width: 130, height: 112 },
    basePrice: 30,
    skipClothingSize: false,
    skipDesign: false,
    hasBack: true,
  },
  {
    id: "longsleeve",
    label: "გრძელსახელოიანი",
    svgTemplate:     "/templates/longsleeve.svg",
    svgTemplateBack: "/templates/longsleeve-back.svg",
    designZone:     { x: 130, y: 100, width: 140, height: 120 },
    designZoneBack: { x: 135, y: 118, width: 130, height: 112 },
    basePrice: 35,
    skipClothingSize: false,
    skipDesign: false,
    hasBack: true,
  },
  {
    id: "cap",
    label: "კეპი",
    svgTemplate:     "/templates/cap.svg",
    svgTemplateBack: "/templates/cap-back.svg",
    designZone:     { x: 120, y: 100, width: 160, height: 100 },
    designZoneBack: { x: 148, y: 142, width: 104, height: 96 },
    basePrice: 25,
    skipClothingSize: true,
    skipDesign: false,
    hasBack: true,
  },
  {
    id: "custom",
    label: "სხვა პროდუქტი",
    svgTemplate:     "/templates/custom.svg",
    svgTemplateBack: "/templates/custom.svg",
    designZone:     { x: 60, y: 60, width: 280, height: 280 },
    designZoneBack: { x: 60, y: 60, width: 280, height: 280 },
    basePrice: 60,
    skipClothingSize: true,
    skipDesign: false,
    hasBack: false,
  },
] as const;

export type ProductTypeId = (typeof PRODUCT_TYPES)[number]["id"];
export type ProductType   = (typeof PRODUCT_TYPES)[number];

export const CLOTHING_SIZES = ["S", "M", "L", "XL"] as const;
export type ClothingSize = (typeof CLOTHING_SIZES)[number];

export const EMBROIDERY_SIZES = [
  { id: "S",  label: "S",  extraPrice: 0,  note: "მცირე (~5×5სმ)" },
  { id: "M",  label: "M",  extraPrice: 10, note: "საშუალო (~8×8სმ)" },
  { id: "L",  label: "L",  extraPrice: 20, note: "დიდი (~12×12სმ)" },
  { id: "XL", label: "XL", extraPrice: 35, note: "ძალიან დიდი (~15×15სმ)" },
] as const;
export type EmbroiderySizeId = (typeof EMBROIDERY_SIZES)[number]["id"];

export const PLACEMENTS = [
  { id: "chest-left",   label: "მკერდი (მარცხენა)" },
  { id: "chest-center", label: "მკერდი (ცენტრი)" },
  { id: "back",         label: "ზურგი" },
  { id: "sleeve",       label: "სახელო" },
] as const;
export type PlacementId = (typeof PLACEMENTS)[number]["id"];

export const ALL_STEPS = [1, 2, 3, 4, 5] as const;

export function getSkippedSteps(productId: ProductTypeId): number[] {
  const product = PRODUCT_TYPES.find((p) => p.id === productId);
  if (!product) return [];
  const skipped: number[] = [];
  if (product.skipClothingSize) skipped.push(2);
  if (product.skipDesign)       skipped.push(3);
  return skipped;
}
