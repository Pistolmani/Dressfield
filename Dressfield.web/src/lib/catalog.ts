import api from "@/lib/api";
import type {
  CategoryDto,
  CategoryPayload,
  ProductDetailDto,
  ProductPayload,
  ProductSummaryDto,
} from "@/types/catalog";

export const PRODUCTS_PER_PAGE = 12;
export const productSortOptions = [
  { value: "newest", label: "უახლესი" },
  { value: "price-asc", label: "ფასი ზრდადობით" },
  { value: "price-desc", label: "ფასი კლებადობით" },
] as const;

export type ProductSort = (typeof productSortOptions)[number]["value"];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("ka-GE", {
    style: "currency",
    currency: "GEL",
    maximumFractionDigits: 2,
  }).format(price);
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function sortProducts(products: ProductSummaryDto[], sort: ProductSort) {
  const next = [...products];

  if (sort === "price-asc") {
    return next.sort((a, b) => a.basePrice - b.basePrice);
  }

  if (sort === "price-desc") {
    return next.sort((a, b) => b.basePrice - a.basePrice);
  }

  return next.sort((a, b) => b.id - a.id);
}

export async function getCategories() {
  const { data } = await api.get<CategoryDto[]>("/api/categories");
  return data;
}

export async function getAdminCategories() {
  const { data } = await api.get<CategoryDto[]>("/api/categories/admin");
  return data;
}

export async function getProducts(params?: { categoryId?: number; search?: string }) {
  const { data } = await api.get<ProductSummaryDto[]>("/api/products", { params });
  return data;
}

export async function getAdminProducts(params?: { categoryId?: number; search?: string }) {
  const { data } = await api.get<ProductSummaryDto[]>("/api/products/admin", { params });
  return data;
}

export async function getProductBySlug(slug: string) {
  const { data } = await api.get<ProductDetailDto>(`/api/products/slug/${slug}`);
  return data;
}

export async function getAdminProductById(id: number) {
  const { data } = await api.get<ProductDetailDto>(`/api/products/admin/${id}`);
  return data;
}

export async function createCategory(payload: CategoryPayload) {
  const { data } = await api.post<CategoryDto>("/api/categories", payload);
  return data;
}

export async function updateCategory(id: number, payload: CategoryPayload) {
  const { data } = await api.put<CategoryDto>(`/api/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: number) {
  await api.delete(`/api/categories/${id}`);
}

export async function createProduct(payload: ProductPayload) {
  const { data } = await api.post<ProductDetailDto>("/api/products", payload);
  return data;
}

export async function updateProduct(id: number, payload: ProductPayload) {
  const { data } = await api.put<ProductDetailDto>(`/api/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: number) {
  await api.delete(`/api/products/${id}`);
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}

export async function getStaticProducts() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/products`, {
      cache: "force-cache",
    });

    if (!response.ok) {
      return [] as ProductSummaryDto[];
    }

    return (await response.json()) as ProductSummaryDto[];
  } catch {
    return [] as ProductSummaryDto[];
  }
}

export async function getStaticCategories() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/categories`, {
      cache: "force-cache",
    });
    if (!response.ok) return [] as CategoryDto[];
    return (await response.json()) as CategoryDto[];
  } catch {
    return [] as CategoryDto[];
  }
}

export async function getStaticProductBySlug(slug: string) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/products/slug/${slug}`, {
      cache: "force-cache",
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ProductDetailDto;
  } catch {
    return null;
  }
}
