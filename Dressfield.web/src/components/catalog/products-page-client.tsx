"use client";

import { useMemo, useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
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

  // Derive available categories from loaded products
  const categories = useMemo(() => {
    const products = productsQuery.data ?? [];
    const seen = new Map<string, string>();
    for (const p of products) {
      if (p.categorySlug && p.categoryName && !seen.has(p.categorySlug)) {
        seen.set(p.categorySlug, p.categoryName);
      }
    }
    return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }));
  }, [productsQuery.data]);

  const filteredProducts = useMemo(() => {
    const base = productsQuery.data ?? [];
    // If the API doesn't filter server-side, filter client-side as fallback
    const categoryFiltered = activeCategory
      ? base.filter((p) => p.categorySlug === activeCategory)
      : base;
    return sortProducts(categoryFiltered, sort);
  }, [productsQuery.data, sort, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
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
      {/* Page Header */}
      <div className="border-b border-black/8 bg-white py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 flex flex-col gap-3 pb-0">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">პროდუქტები</p>
            <h1 className="font-ui text-3xl sm:text-4xl font-semibold tracking-[0.03em]">ნაქარგი პროდუქციის კატალოგი</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">დაათვალიერე მზა ნამუშევრები, ნახე დეტალები და დაამატე სასურველი ნივთები კალათაში.</p>
          </div>

          {/* Category filter pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setCategory(null)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all border",
                  activeCategory === null
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent"
                )}
              >
                ყველა
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all border",
                    activeCategory === cat.slug
                      ? "bg-accent text-white border-accent shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <ProductFiltersSidebar
          sort={sort}
          onSortChange={(newSort) => {
            setSort(newSort);
            setPage(1);
          }}
          onClose={() => setSidebarOpen(false)}
          isOpen={sidebarOpen}
        />

        {/* Products Content */}
        <div className="flex-1 py-10 sm:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <section className="space-y-6">
              <div className="flex flex-col gap-4 rounded-lg border border-black/8 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between gap-4 flex-1">
                  <div>
                    <p className="text-sm text-muted-foreground">ნაპოვნია <span className="font-semibold text-foreground">{filteredProducts.length}</span> პროდუქტი</p>
                    <p className="text-sm text-muted-foreground">გვერდი {currentPage} / {totalPages}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
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
                <div className="rounded-3xl border border-dashed border-destructive/40 bg-white px-6 py-12 text-center text-destructive">პროდუქტების ჩატვირთვა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.</div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <ProductGrid products={paginatedProducts} loading={productsQuery.isLoading} />
                  ) : (
                    <ProductList products={paginatedProducts} loading={productsQuery.isLoading} />
                  )}
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
