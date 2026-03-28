"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import {
  getProducts,
  PRODUCTS_PER_PAGE,
  productSortOptions,
  sortProducts,
  type ProductSort,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface CategoryPageClientProps {
  categoryId: number;
}

export function CategoryPageClient({ categoryId }: CategoryPageClientProps) {
  const [sort, setSort] = useState<ProductSort>("newest");
  const [page, setPage] = useState(1);

  const productsQuery = useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: () => getProducts({ categoryId }),
  });

  const sortedProducts = useMemo(() => {
    return sortProducts(productsQuery.data ?? [], sort);
  }, [productsQuery.data, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          ნაპოვნია{" "}
          <span className="font-semibold text-foreground">{sortedProducts.length}</span>{" "}
          პროდუქტი
        </p>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as ProductSort);
            setPage(1);
          }}
          className="h-10 rounded-xl border border-black/8 bg-white px-3 text-sm outline-none focus:border-accent sm:w-52"
        >
          {productSortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {productsQuery.isError ? (
        <div className="rounded-3xl border border-dashed border-destructive/40 bg-white px-6 py-12 text-center text-destructive">
          პროდუქტების ჩატვირთვა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.
        </div>
      ) : (
        <>
          <ProductGrid
            products={paginatedProducts}
            loading={productsQuery.isLoading}
          />

          {!productsQuery.isLoading && sortedProducts.length === 0 && (
            <div className="rounded-3xl border border-dashed border-black/12 bg-white px-6 py-16 text-center text-muted-foreground">
              ამ კატეგორიაში პროდუქტი ჯერ არ არის დამატებული.
            </div>
          )}
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            className={cn("h-10 px-4", currentPage === 1 && "pointer-events-none opacity-50")}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            წინა
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            className={cn("h-10 px-4", currentPage === totalPages && "pointer-events-none opacity-50")}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            შემდეგი
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
