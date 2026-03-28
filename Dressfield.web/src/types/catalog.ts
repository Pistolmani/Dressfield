export type CategoryDto = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
};

export type ProductSummaryDto = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: number;
  primaryImageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
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
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  basePrice: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  images: ProductImageDto[];
  variants: ProductVariantDto[];
};

export type CategoryPayload = {
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
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
  categoryId: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  basePrice: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  images: ProductImagePayload[];
  variants: ProductVariantPayload[];
};
