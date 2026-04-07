"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { productSortOptions, type ProductSort } from "@/lib/catalog";

export type ProductCategoryFilter = {
  slug: string;
  name: string;
};

interface ProductFiltersSidebarProps {
  sort: ProductSort;
  onSortChange: (sort: ProductSort) => void;
  categories: ProductCategoryFilter[];
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export function ProductFiltersSidebar({
  sort,
  onSortChange,
  categories,
  activeCategory,
  onCategoryChange,
  onClose,
  isOpen = true,
}: ProductFiltersSidebarProps) {
  const [expandSort, setExpandSort] = useState(true);
  const [expandCategory, setExpandCategory] = useState(true);

  const runAndClose = (action: () => void) => {
    action();
    onClose?.();
  };

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen md:h-auto z-50 md:z-0",
          "w-72 md:w-48 lg:w-56",
          "bg-white border-r border-black/8 md:border-r-0 md:border-b md:border-black/8",
          "transform transition-transform duration-300 md:transform-none overflow-y-auto",
          !isOpen && "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-4 md:p-0 space-y-6">
          <div className="md:hidden flex items-center justify-between pb-4 border-b border-black/8">
            <h2 className="font-ui font-semibold text-foreground">ფილტრები</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            <button
              onClick={() => setExpandSort((prev) => !prev)}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-black/5 transition-colors"
            >
              <h3 className="font-ui font-semibold text-sm text-foreground">დალაგება</h3>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  expandSort && "rotate-180",
                )}
              />
            </button>

            {expandSort ? (
              <div className="mt-2 space-y-1 pl-3">
                {productSortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => runAndClose(() => onSortChange(option.value))}
                    className={cn(
                      "block w-full text-left py-2 px-2 rounded text-sm transition-colors",
                      sort === option.value
                        ? "bg-accent/10 font-semibold text-accent"
                        : "text-muted-foreground hover:bg-black/5 hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {categories.length > 0 && (
            <>
              <div className="hidden md:block h-px bg-black/8" />
              <div>
                <button
                  onClick={() => setExpandCategory((prev) => !prev)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-black/5 transition-colors"
                >
                  <h3 className="font-ui font-semibold text-sm text-foreground">კატეგორია</h3>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      expandCategory && "rotate-180",
                    )}
                  />
                </button>

                {expandCategory ? (
                  <div className="mt-2 space-y-1 pl-3">
                    <button
                      onClick={() => runAndClose(() => onCategoryChange(null))}
                      className={cn(
                        "block w-full text-left py-2 px-2 rounded text-sm transition-colors",
                        activeCategory === null
                          ? "bg-accent/10 font-semibold text-accent"
                          : "text-muted-foreground hover:bg-black/5 hover:text-foreground",
                      )}
                    >
                      ყველა
                    </button>

                    {categories.map((category) => (
                      <button
                        key={category.slug}
                        onClick={() => runAndClose(() => onCategoryChange(category.slug))}
                        className={cn(
                          "block w-full text-left py-2 px-2 rounded text-sm transition-colors",
                          activeCategory === category.slug
                            ? "bg-accent/10 font-semibold text-accent"
                            : "text-muted-foreground hover:bg-black/5 hover:text-foreground",
                        )}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
