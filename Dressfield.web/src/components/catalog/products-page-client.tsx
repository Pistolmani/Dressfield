"use client";

import { Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Grid3x3, List, Menu } from "lucide-react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ProductList } from "@/components/catalog/product-list";
import { ProductFiltersSidebar } from "@/components/catalog/product-filters-sidebar";
import { Button } from "@/components/ui/button";
import {
  getProducts,
  PRODUCTS_PER_PAGE,
  sortProducts,
  type ProductSort,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? null;

  const [sort, setSort] = useState<ProductSort>("newest");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const productsQuery = useQuery({
    queryKey: ["products", activeCategory],
    queryFn: () => getProducts(activeCategory ? { category: activeCategory } : undefined),
  });

  const categoriesQuery = useQuery({
    queryKey: ["products", "categories-source"],
    queryFn: () => getProducts(),
  });

  const categories = useMemo(() => {
    const products = categoriesQuery.data ?? productsQuery.data ?? [];
    const seen = new Map<string, string>();

    for (const product of products) {
      if (product.categorySlug && product.categoryName && !seen.has(product.categorySlug)) {
        seen.set(product.categorySlug, product.categoryName);
      }
    }

    return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }));
  }, [categoriesQuery.data, productsQuery.data]);

  const filteredProducts = useMemo(() => {
    const base = productsQuery.data ?? [];
    const categoryFiltered = activeCategory
      ? base.filter((product) => product.categorySlug === activeCategory)
      : base;

    return sortProducts(categoryFiltered, sort);
  }, [activeCategory, productsQuery.data, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  function setCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    router.push(`/products?${params.toString()}`);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-black/8 bg-white py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 flex flex-col gap-3 pb-0">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">პროდუქტები</p>
            <h1 className="font-ui text-3xl sm:text-4xl font-semibold tracking-[0.03em]">
              ნაქარგების და ქარგვის კატალოგი
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              დაათვალიერე მზა ნაქარგი ნამუშევრები, ნახე დეტალები და შეუკვეთე ქარგვა შენი დიზაინით.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setCategory(null)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all border",
                  activeCategory === null
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent",
                )}
              >
                ყველა
              </button>

              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setCategory(category.slug)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all border",
                    activeCategory === category.slug
                      ? "bg-accent text-white border-accent shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent",
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex">
        <ProductFiltersSidebar
          sort={sort}
          onSortChange={(newSort) => {
            setSort(newSort);
            setPage(1);
          }}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={(slug) => setCategory(slug)}
          onClose={() => setSidebarOpen(false)}
          isOpen={sidebarOpen}
        />

        <div className="flex-1 py-10 sm:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <section className="space-y-6">
              <div className="flex flex-col gap-4 rounded-lg border border-black/8 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between gap-4 flex-1">
                  <div>
                    {productsQuery.isError ? (
                      <>
                        <p className="text-sm font-semibold text-destructive">
                          პროდუქტების ჩატვირთვა ვერ მოხერხდა
                        </p>
                        <p className="text-sm text-muted-foreground">
                          დარწმუნდი რომ API მუშაობს და სცადე თავიდან
                        </p>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSidebarOpen((open) => !open)}
                  >
                    <Menu className="h-4 w-4 mr-2" />
                    ფილტრები
                  </Button>
                </div>

                <div className="flex gap-2 bg-black/5 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    className={cn("h-9 w-9 p-0", viewMode === "grid" && "bg-accent hover:bg-accent")}
                    onClick={() => {
                      setViewMode("grid");
                      setPage(1);
                    }}
                    title="Grid view"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    className={cn("h-9 w-9 p-0", viewMode === "list" && "bg-accent hover:bg-accent")}
                    onClick={() => {
                      setViewMode("list");
                      setPage(1);
                    }}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {productsQuery.isError ? (
                <div className="space-y-3">
                  <div className="rounded-3xl border border-dashed border-destructive/40 bg-white px-6 py-12 text-center text-destructive">
                    პროდუქტების ჩატვირთვა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.
                  </div>
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={() => productsQuery.refetch()}>
                      ხელახლა ცდა
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <ProductGrid products={paginatedProducts} loading={productsQuery.isLoading} />
                  ) : (
                    <ProductList products={paginatedProducts} loading={productsQuery.isLoading} />
                  )}
                  {!productsQuery.isLoading && filteredProducts.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-black/12 bg-white px-6 py-12 text-center text-muted-foreground">
                      პროდუქტები ჯერ არ არის დამატებული.
                    </div>
                  ) : null}
                </>
              )}

              {!productsQuery.isError ? (
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
                    className={cn(
                      "h-10 px-4",
                      currentPage === totalPages && "pointer-events-none opacity-50",
                    )}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  >
                    შემდეგი
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductsPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProductsPageContent />
    </Suspense>
  );
}
