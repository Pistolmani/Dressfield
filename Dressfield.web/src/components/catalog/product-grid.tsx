import type { ProductSummaryDto } from "@/types/catalog";
import { ProductCard } from "./product-card";
import { SkeletonCard } from "./skeleton-card";

export function ProductGrid({
  products,
  loading = false,
}: {
  products: ProductSummaryDto[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
