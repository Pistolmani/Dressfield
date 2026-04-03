export interface DesignTransform {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
}

export interface DesignItem {
  id: string;
  url: string;
  transform?: DesignTransform;
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
  
  // Step 2 is Size AND Color. We only skip it if the product skips clothing size 
  // AND has no colors available.
  const hasColors = (PRODUCT_COLORS[productId] && PRODUCT_COLORS[productId]!.length > 0);
  if (product.skipClothingSize && !hasColors) {
    skipped.push(2);
  }
  
  if (product.skipDesign) skipped.push(3);
  return skipped;
}

export interface ProductColor {
  id: string;
  label: string;
  hex: string;
}

export const PRODUCT_COLORS: Partial<Record<ProductTypeId, ProductColor[]>> = {
  hoodie: [
    { id: "black", label: "შავი", hex: "#000000" },
    { id: "white", label: "თეთრი", hex: "#ffffff" },
    { id: "dark_grey", label: "მუქი ნაცრისფერი", hex: "#4b4b4b" },
    { id: "grey", label: "ნაცრისფერი", hex: "#808080" },
    { id: "red", label: "წითელი", hex: "#e53e3e" },
    { id: "maroon", label: "ბორდოსფერი", hex: "#800000" },
    { id: "pomegranate", label: "ბროწეულისფერი", hex: "#9E1B32" },
    { id: "paprika", label: "პაპრიკა", hex: "#E53935" },
    { id: "orange", label: "ნარინჯისფერი", hex: "#ed8936" },
    { id: "phosphorus_orange", label: "ფოსფორის ნარინჯისფერი", hex: "#FF5E00" },
    { id: "yellow", label: "ყვითელი", hex: "#ecc94b" },
    { id: "mustard", label: "მდოგვისფერი", hex: "#FFDB58" },
    { id: "gold", label: "ოქროსფერი", hex: "#FFD700" },
    { id: "light_green", label: "ღია მწვანე", hex: "#90EE90" },
    { id: "pastel_green", label: "პასტელური მწვანე", hex: "#77DD77" },
    { id: "green", label: "მწვანე", hex: "#48bb78" },
    { id: "dark_green", label: "მუქი მწვანე", hex: "#276749" },
    { id: "light_blue", label: "ღია ლურჯი", hex: "#63b3ed" },
    { id: "blue", label: "ლურჯი", hex: "#3182ce" },
    { id: "royal_blue", label: "გაჯერებული ლურჯი", hex: "#4169E1" },
    { id: "indigo", label: "ინდიგო ლურჯი", hex: "#4B0082" },
    { id: "navy", label: "მუქი ლურჯი", hex: "#2c5282" },
    { id: "light_purple", label: "ღია იასამნისფერი", hex: "#DDA0DD" },
    { id: "purple", label: "იასამნისფერი", hex: "#805ad5" },
    { id: "light_pink", label: "ღია ვარდისფერი", hex: "#FFB6C1" },
    { id: "pink", label: "ვარდისფერი", hex: "#ed64a6" },
    { id: "brown", label: "ყავისფერი", hex: "#8b4513" },
    { id: "sand", label: "ქვიშისფერი", hex: "#d2b48c" },
  ],
  sweater: [
    { id: "black", label: "შავი", hex: "#000000" },
    { id: "brown", label: "ყავისფერი", hex: "#8b4513" },
    { id: "purple", label: "იასამნისფერი", hex: "#805ad5" },
    { id: "phosphorus", label: "ფოსფორისფერი", hex: "#ccff00" },
  ],
  tshirt: [
    { id: "black", label: "შავი", hex: "#000000" },
    { id: "white", label: "თეთრი", hex: "#ffffff" },
    { id: "red", label: "წითელი", hex: "#e53e3e" },
    { id: "navy", label: "მუქი ლურჯი", hex: "#2c5282" },
  ],
  longsleeve: [
    { id: "black", label: "შავი", hex: "#000000" },
    { id: "white", label: "თეთრი", hex: "#ffffff" },
    { id: "dark_green", label: "მუქი მწვანე", hex: "#276749" },
  ],
  cap: [
    { id: "black", label: "შავი", hex: "#000000" },
    { id: "white", label: "თეთრი", hex: "#ffffff" },
    { id: "dark_grey", label: "მუქი ნაცრისფერი", hex: "#4b4b4b" },
    { id: "red", label: "წითელი", hex: "#e53e3e" },
    { id: "orange", label: "ნარინჯისფერი", hex: "#ed8936" },
    { id: "yellow", label: "ყვითელი", hex: "#ecc94b" },
    { id: "green", label: "მწვანე", hex: "#48bb78" },
    { id: "dark_green", label: "მუქი მწვანე", hex: "#276749" },
    { id: "blue", label: "ლურჯი", hex: "#3182ce" },
    { id: "navy", label: "მუქი ლურჯი", hex: "#2c5282" },
    { id: "military_black", label: "სამხედრო მწვანე/შავი", hex: "#4B5320" },
    { id: "orange_black", label: "ნარინჯისფერი/შავი", hex: "#FF8C00" },
  ],
  custom: [
    { id: "black", label: "შავი", hex: "#000000" },
    { id: "white", label: "თეთრი", hex: "#ffffff" },
    { id: "grey", label: "ნაცრისფერი", hex: "#808080" },
    { id: "red", label: "წითელი", hex: "#e53e3e" },
    { id: "navy", label: "მუქი ლურჯი", hex: "#2c5282" },
    { id: "green", label: "მწვანე", hex: "#48bb78" },
  ]
};
