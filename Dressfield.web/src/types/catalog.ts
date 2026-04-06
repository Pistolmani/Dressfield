export type ProductSummaryDto = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: number;
  salePercentage: number;
  effectivePrice: number;
  isOnSale: boolean;
  primaryImageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  categorySlug?: string | null;
  categoryName?: string | null;
};

export type ProductImageDto = {
  id: number;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductVariantDto = {
  id: number;
  name: string;
  value: string | null;
  sku: string | null;
  priceAdjustment: number;
  stockQuantity: number;
  isActive: boolean;
};

export type ProductDetailDto = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  basePrice: number;
  salePercentage: number;
  effectivePrice: number;
  isOnSale: boolean;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  images: ProductImageDto[];
  variants: ProductVariantDto[];
};

export type ProductImagePayload = {
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductVariantPayload = {
  name: string;
  value: string | null;
  sku: string | null;
  priceAdjustment: number;
  stockQuantity: number;
  isActive: boolean;
};

export type ProductPayload = {
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  basePrice: number;
  salePercentage: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  images: ProductImagePayload[];
  variants: ProductVariantPayload[];
};
