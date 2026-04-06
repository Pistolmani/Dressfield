/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteProduct, formatPrice, getAdminProducts } from "@/lib/catalog";

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=320&q=80";

export function ProductsManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const productsQuery = useQuery({
    queryKey: ["admin-products", debouncedSearch],
    queryFn: () => getAdminProducts({ search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("პროდუქტი წაიშალა");
    },
    onError: () => toast.error("პროდუქტის წაშლა ვერ მოხერხდა"),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">პროდუქტები</p>
          <h1 className="font-ui text-5xl font-semibold tracking-[0.04em]">პროდუქტების მართვა</h1>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-accent text-white hover:bg-accent-hover">
            <Plus className="h-4 w-4" />
            დამატება
          </Button>
        </Link>
      </div>

      <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ძებნა" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-black/[0.03] text-left">
              <tr>
                <th className="px-5 py-4 font-medium">სურათი</th>
                <th className="px-5 py-4 font-medium">სახელი</th>
                <th className="px-5 py-4 font-medium">ფასი</th>
                <th className="px-5 py-4 font-medium">აქტიური</th>
                <th className="px-5 py-4 font-medium text-right">მოქმედებები</th>
              </tr>
            </thead>
            <tbody>
              {productsQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">იტვირთება...</td>
                </tr>
              ) : productsQuery.isError ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-destructive">პროდუქტების ჩატვირთვა ვერ მოხერხდა.</td>
                </tr>
              ) : productsQuery.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">პროდუქტი ჯერ არ არის დამატებული.</td>
                </tr>
              ) : null}
              {productsQuery.data?.map((product) => (
                <tr key={product.id} className="border-t border-black/6">
                  <td className="px-5 py-4">
                    <img src={product.primaryImageUrl || fallbackImage} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                  </td>
                  <td className="px-5 py-4">{product.name}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      {product.isOnSale ? (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.basePrice)}
                        </span>
                      ) : null}
                      <div className="flex items-center gap-2">
                        <span className="text-accent font-semibold">
                          {formatPrice(product.effectivePrice ?? product.basePrice)}
                        </span>
                        {product.isOnSale ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                            Sale
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{product.isActive ? "კი" : "არა"}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/edit?id=${product.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                          რედაქტირება
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`წავშალოთ პროდუქტი: ${product.name}?`)) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        წაშლა
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
