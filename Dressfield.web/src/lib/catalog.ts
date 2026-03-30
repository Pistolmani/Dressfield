import api from "@/lib/api";
import type {
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

export { formatPrice } from "@/lib/utils";

const georgianToLatinMap: Record<string, string> = {
  "ა": "a",
  "ბ": "b",
  "გ": "g",
  "დ": "d",
  "ე": "e",
  "ვ": "v",
  "ზ": "z",
  "თ": "t",
  "ი": "i",
  "კ": "k",
  "ლ": "l",
  "მ": "m",
  "ნ": "n",
  "ო": "o",
  "პ": "p",
  "ჟ": "zh",
  "რ": "r",
  "ს": "s",
  "ტ": "t",
  "უ": "u",
  "ფ": "f",
  "ქ": "q",
  "ღ": "gh",
  "ყ": "y",
  "შ": "sh",
  "ჩ": "ch",
  "ც": "ts",
  "ძ": "dz",
  "წ": "w",
  "ჭ": "ch",
  "ხ": "kh",
  "ჯ": "j",
  "ჰ": "h",
};

export function slugify(value: string) {
  const latinized = value
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => georgianToLatinMap[char] ?? char)
    .join("");

  return latinized
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

export async function getProducts(params?: { search?: string }) {
  const { data } = await api.get<ProductSummaryDto[]>("/api/products", { params });
  return data;
}

export async function getAdminProducts(params?: { search?: string }) {
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

export async function getStaticProducts(): Promise<ProductSummaryDto[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/products`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch products for static generation (${response.status}). ` +
      `Is the backend running at ${getApiBaseUrl()}?`
    );
  }

  return response.json() as Promise<ProductSummaryDto[]>;
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