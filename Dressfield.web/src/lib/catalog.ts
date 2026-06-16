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
    return next.sort((a, b) => (a.effectivePrice ?? a.basePrice) - (b.effectivePrice ?? b.basePrice));
  }

  if (sort === "price-desc") {
    return next.sort((a, b) => (b.effectivePrice ?? b.basePrice) - (a.effectivePrice ?? a.basePrice));
  }

  return next.sort((a, b) => b.id - a.id);
}

export async function getProducts(params?: { search?: string; category?: string }) {
  const { data } = await api.get<ProductSummaryDto[]>("/api/products", { params });
  return data.map(normalizeProductSummary);
}

export async function getAdminProducts(params?: { search?: string }) {
  const { data } = await api.get<ProductSummaryDto[]>("/api/products/admin", { params });
  return data.map(normalizeProductSummary);
}

export async function getProductBySlug(slug: string) {
  const { data } = await api.get<ProductDetailDto>(`/api/products/slug/${slug}`);
  return normalizeProductDetail(data);
}

export async function getAdminProductById(id: number) {
  const { data } = await api.get<ProductDetailDto>(`/api/products/admin/${id}`);
  return normalizeProductDetail(data);
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

function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;

  const base = getApiBaseUrl().replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

function normalizeProductSummary(product: ProductSummaryDto): ProductSummaryDto {
  return {
    ...product,
    primaryImageUrl: normalizeImageUrl(product.primaryImageUrl),
  };
}

function normalizeProductDetail(product: ProductDetailDto): ProductDetailDto {
  return {
    ...product,
    images: product.images.map((image) => ({
      ...image,
      imageUrl: normalizeImageUrl(image.imageUrl) ?? image.imageUrl,
    })),
  };
}

export async function getStaticProducts(): Promise<ProductSummaryDto[]> {
  // force-cache is required for static export (no-store makes the fetch dynamic,
  // which breaks build-time prerendering). Freshness is guaranteed instead by
  // always building clean — `npm run clean` clears .next/cache/fetch-cache so a
  // previous build's stale (since-deleted) image URLs can't be reused. See the
  // "clean" + build pipeline in deploy:hostinger.
  const response = await fetch(`${getApiBaseUrl()}/api/products`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch products for static generation (${response.status}). ` +
      `Is the backend running at ${getApiBaseUrl()}?`
    );
  }

  const products = (await response.json()) as ProductSummaryDto[];
  return products.map(normalizeProductSummary);
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

    const product = (await response.json()) as ProductDetailDto;
    return normalizeProductDetail(product);
  } catch {
    return null;
  }
}
