"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts, PRODUCTS_PER_PAGE, productSortOptions, sortProducts, type ProductSort } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ProductsPageClient() {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [sort, setSort] = useState<ProductSort>("newest");
  const [page, setPage] = useState(1);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const filteredProducts = useMemo(() => {
    const base = productsQuery.data || [];
    const byCategory =
      selectedCategoryIds.length === 0
        ? base
        : base.filter((product) => selectedCategoryIds.includes(product.categoryId));

    return sortProducts(byCategory, sort);
  }, [productsQuery.data, selectedCategoryIds, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  function toggleCategory(categoryId: number) {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
    setPage(1);
  }

  return (
    <div className="bg-background py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex flex-col gap-3 border-b border-black/8 pb-6">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            პროდუქტები
          </p>
          <h1 className="font-[family-name:var(--font-inter)] text-3xl font-semibold tracking-tight sm:text-4xl">
            ნაქარგი პროდუქციის კატალოგი
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            დაალაგე კატეგორიების მიხედვით, ნახე დეტალები და დაამატე სასურველი
            ნივთები კალათაში.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-black/8 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="space-y-6">
              <section className="space-y-3">
                <h2 className="font-[family-name:var(--font-inter)] text-lg font-semibold">
                  კატეგორიები
                </h2>
                <label className="flex items-center gap-3 rounded-xl border border-black/8 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.length === 0}
                    onChange={() => {
                      setSelectedCategoryIds([]);
                      setPage(1);
                    }}
                    className="h-4 w-4 rounded border-black/20 accent-accent"
                  />
                  <span className="flex-1 text-sm">ყველა კატეგორია</span>
                </label>
                {categoriesQuery.data?.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 rounded-xl border border-black/8 px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="h-4 w-4 rounded border-black/20 accent-accent"
                    />
                    <span className="flex-1 text-sm">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {category.productCount}
                    </span>
                  </label>
                ))}
              </section>

              <section className="space-y-3">
                <h2 className="font-[family-name:var(--font-inter)] text-lg font-semibold">
                  დალაგება
                </h2>
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as ProductSort);
                    setPage(1);
                  }}
                  className="h-11 w-full rounded-xl border border-black/8 bg-white px-3 text-sm outline-none ring-0 focus:border-accent"
                >
                  {productSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </section>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                ნაპოვნია{" "}
                <span className="font-semibold text-foreground">
                  {filteredProducts.length}
                </span>{" "}
                პროდუქტი
              </p>
              <p className="text-sm text-muted-foreground">
                გვერდი {currentPage} / {totalPages}
              </p>
            </div>

            {productsQuery.isError ? (
              <div className="rounded-3xl border border-dashed border-destructive/40 bg-white px-6 py-12 text-center text-destructive">
                პროდუქტების ჩატვირთვა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.
              </div>
            ) : (
              <>
                <ProductGrid
                  products={paginatedProducts}
                  loading={productsQuery.isLoading || categoriesQuery.isLoading}
                />

                {!productsQuery.isLoading && filteredProducts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-black/12 bg-white px-6 py-12 text-center text-muted-foreground">
                    არჩეული ფილტრებით პროდუქტი ვერ მოიძებნა.
                  </div>
                ) : null}
              </>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                className={cn(
                  "h-10 px-4",
                  currentPage === 1 && "pointer-events-none opacity-50"
                )}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                წინა
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "h-10 px-4",
                  currentPage === totalPages && "pointer-events-none opacity-50"
                )}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                შემდეგი
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
