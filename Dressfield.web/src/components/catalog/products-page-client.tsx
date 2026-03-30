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

export function ProductsPageClient() {
  const [sort, setSort] = useState<ProductSort>("newest");
  const [page, setPage] = useState(1);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const filteredProducts = useMemo(() => sortProducts(productsQuery.data || [], sort), [productsQuery.data, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="bg-background py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex flex-col gap-3 border-b border-black/8 pb-6">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">პროდუქტები</p>
          <h1 className="font-ui text-5xl sm:text-6xl font-semibold tracking-[0.04em]">ნაქარგი პროდუქციის კატალოგი</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">დაათვალიერე მზა ნამუშევრები, ნახე დეტალები და დაამატე სასურველი ნივთები კალათაში.</p>
        </div>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-black/8 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ნაპოვნია <span className="font-semibold text-foreground">{filteredProducts.length}</span> პროდუქტი</p>
              <p className="text-sm text-muted-foreground">გვერდი {currentPage} / {totalPages}</p>
            </div>
            <div className="w-full sm:w-64">
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as ProductSort);
                  setPage(1);
                }}
                className="h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm outline-none ring-0 focus:border-accent"
              >
                {productSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {productsQuery.isError ? (
            <div className="rounded-3xl border border-dashed border-destructive/40 bg-white px-6 py-12 text-center text-destructive">პროდუქტების ჩატვირთვა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.</div>
          ) : (
            <>
              <ProductGrid products={paginatedProducts} loading={productsQuery.isLoading} />
              {!productsQuery.isLoading && filteredProducts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-black/12 bg-white px-6 py-12 text-center text-muted-foreground">პროდუქტები ჯერ არ არის დამატებული.</div>
              ) : null}
            </>
          )}

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              className={cn("h-10 px-4", currentPage === 1 && "pointer-events-none opacity-50")}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              წინა
            </Button>
            <Button
              variant="outline"
              className={cn("h-10 px-4", currentPage === totalPages && "pointer-events-none opacity-50")}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              შემდეგი
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
