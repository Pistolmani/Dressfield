"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProduct,
  getAdminCategories,
  getAdminProductById,
  slugify,
  updateProduct,
} from "@/lib/catalog";
import type {
  CategoryDto,
  ProductDetailDto,
  ProductImagePayload,
  ProductPayload,
  ProductVariantPayload,
} from "@/types/catalog";

type ProductEditorProps = {
  productId?: number;
};

const emptyImage: ProductImagePayload = {
  imageUrl: "",
  altText: "",
  sortOrder: 0,
  isPrimary: true,
};

const emptyVariant: ProductVariantPayload = {
  name: "",
  value: "",
  sku: "",
  priceAdjustment: 0,
  stockQuantity: 0,
  isActive: true,
};

const emptyForm: ProductPayload = {
  categoryId: 0,
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  basePrice: 0,
  sku: "",
  isActive: true,
  isFeatured: false,
  images: [{ ...emptyImage }],
  variants: [{ ...emptyVariant }],
};

function mapProductToForm(product: ProductDetailDto): ProductPayload {
  return {
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    basePrice: product.basePrice,
    sku: product.sku,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    images:
      product.images.length > 0
        ? product.images
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((image) => ({
              imageUrl: image.imageUrl,
              altText: image.altText,
              sortOrder: image.sortOrder,
              isPrimary: image.isPrimary,
            }))
        : [{ ...emptyImage }],
    variants:
      product.variants.length > 0
        ? product.variants.map((variant) => ({
            name: variant.name,
            value: variant.value,
            sku: variant.sku,
            priceAdjustment: variant.priceAdjustment,
            stockQuantity: variant.stockQuantity,
            isActive: variant.isActive,
          }))
        : [{ ...emptyVariant }],
  };
}

function normalizeForm(form: ProductPayload): ProductPayload {
  const images = form.images
    .filter((image) => image.imageUrl.trim())
    .map((image, index) => ({
      imageUrl: image.imageUrl.trim(),
      altText: image.altText?.trim() || null,
      sortOrder: Number.isFinite(image.sortOrder) ? image.sortOrder : index,
      isPrimary: image.isPrimary,
    }));

  return {
    ...form,
    name: form.name.trim(),
    slug: form.slug.trim(),
    shortDescription: form.shortDescription?.trim() || null,
    description: form.description.trim(),
    sku: form.sku?.trim() || null,
    basePrice: Number(form.basePrice),
    categoryId: Number(form.categoryId),
    images: images.map((image, index) => ({
      ...image,
      isPrimary: images.some((item) => item.isPrimary) ? image.isPrimary : index === 0,
    })),
    variants: form.variants
      .filter((variant) => variant.name.trim())
      .map((variant) => ({
        name: variant.name.trim(),
        value: variant.value?.trim() || null,
        sku: variant.sku?.trim() || null,
        priceAdjustment: Number(variant.priceAdjustment),
        stockQuantity: Number(variant.stockQuantity),
        isActive: variant.isActive,
      })),
  };
}

function ProductEditorForm({
  categories,
  initialForm,
  productId,
}: {
  categories: CategoryDto[];
  initialForm: ProductPayload;
  productId?: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductPayload>({
    ...initialForm,
    categoryId: initialForm.categoryId || categories[0]?.id || 0,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(productId));

  const shortDescriptionLength = useMemo(
    () => form.shortDescription?.length || 0,
    [form.shortDescription]
  );

  const saveMutation = useMutation({
    mutationFn: async (payload: ProductPayload) => {
      if (typeof productId === "number") {
        return updateProduct(productId, payload);
      }

      return createProduct(payload);
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", product.id] });
      toast.success("პროდუქტი შენახულია");
      router.push("/admin/products");
    },
    onError: () => toast.error("პროდუქტის შენახვა ვერ მოხერხდა"),
  });

  function updateImage(index: number, patch: Partial<ProductImagePayload>) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, currentIndex) =>
        currentIndex === index ? { ...image, ...patch } : image
      ),
    }));
  }

  function updateVariant(index: number, patch: Partial<ProductVariantPayload>) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, ...patch } : variant
      ),
    }));
  }

  function submitForm() {
    const payload = normalizeForm(form);

    if (!payload.name || !payload.slug || !payload.description || !payload.categoryId) {
      toast.error("აუცილებელი ველები შეავსე");
      return;
    }

    saveMutation.mutate(payload);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-28 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            უკან
          </Button>
        </Link>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            პროდუქტები
          </p>
          <h1 className="font-[family-name:var(--font-inter)] text-3xl font-semibold tracking-tight">
            {productId ? "პროდუქტის რედაქტირება" : "ახალი პროდუქტი"}
          </h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-5 rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-inter)] text-xl font-semibold">
            ძირითადი ინფორმაცია
          </h2>
          <div className="space-y-2">
            <Label htmlFor="product-name">სახელი</Label>
            <Input
              id="product-name"
              value={form.name}
              onChange={(event) => {
                const nextName = event.target.value;
                setForm((current) => ({
                  ...current,
                  name: nextName,
                  slug: slugTouched ? current.slug : slugify(nextName),
                }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-slug">Slug</Label>
            <Input
              id="product-slug"
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setForm((current) => ({ ...current, slug: event.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-category">კატეგორია</Label>
            <select
              id="product-category"
              value={form.categoryId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  categoryId: Number(event.target.value),
                }))
              }
              className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-accent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-black/8 px-3 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
                className="h-4 w-4 accent-accent"
              />
              <span className="text-sm">აქტიური</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-black/8 px-3 py-3">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isFeatured: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-accent"
              />
              <span className="text-sm">რჩეული</span>
            </label>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-inter)] text-xl font-semibold">
            ფასი და SKU
          </h2>
          <div className="space-y-2">
            <Label htmlFor="product-price">ფასი</Label>
            <Input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={form.basePrice}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  basePrice: Number(event.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-sku">SKU</Label>
            <Input
              id="product-sku"
              value={form.sku || ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, sku: event.target.value }))
              }
            />
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-black/8 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="font-[family-name:var(--font-inter)] text-xl font-semibold">
            აღწერები
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="product-short-description">მოკლე აღწერა</Label>
              <span className="text-xs text-muted-foreground">
                {shortDescriptionLength}/300
              </span>
            </div>
            <textarea
              id="product-short-description"
              rows={4}
              maxLength={300}
              value={form.shortDescription || ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  shortDescription: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-input px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-description">სრული აღწერა</Label>
            <textarea
              id="product-description"
              rows={8}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-input px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-black/8 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-inter)] text-xl font-semibold">
              სურათები
            </h2>
            <Button
              variant="outline"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  images: [...current.images, { ...emptyImage, sortOrder: current.images.length }],
                }))
              }
            >
              <Plus className="h-4 w-4" />
              დამატება
            </Button>
          </div>
          <div className="space-y-4">
            {form.images.map((image, index) => (
              <div
                key={`${index}-${image.imageUrl}`}
                className="grid gap-3 rounded-2xl border border-black/8 p-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_120px_130px_auto]"
              >
                <Input
                  value={image.imageUrl}
                  placeholder="Image URL"
                  onChange={(event) =>
                    updateImage(index, { imageUrl: event.target.value })
                  }
                />
                <Input
                  value={image.altText || ""}
                  placeholder="Alt ტექსტი"
                  onChange={(event) => updateImage(index, { altText: event.target.value })}
                />
                <Input
                  type="number"
                  value={image.sortOrder}
                  onChange={(event) =>
                    updateImage(index, { sortOrder: Number(event.target.value) })
                  }
                />
                <label className="flex items-center gap-2 rounded-xl border border-black/8 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={image.isPrimary}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        images: current.images.map((currentImage, currentIndex) => ({
                          ...currentImage,
                          isPrimary:
                            currentIndex === index ? event.target.checked : false,
                        })),
                      }))
                    }
                    className="h-4 w-4 accent-accent"
                  />
                  მთავარი
                </label>
                <Button
                  variant="outline"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      images:
                        current.images.length > 1
                          ? current.images.filter((_, currentIndex) => currentIndex !== index)
                          : [{ ...emptyImage }],
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-black/8 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-inter)] text-xl font-semibold">
              ვარიანტები
            </h2>
            <Button
              variant="outline"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  variants: [...current.variants, { ...emptyVariant }],
                }))
              }
            >
              <Plus className="h-4 w-4" />
              დამატება
            </Button>
          </div>
          <div className="space-y-4">
            {form.variants.map((variant, index) => (
              <div
                key={`${index}-${variant.name}-${variant.value}`}
                className="grid gap-3 rounded-2xl border border-black/8 p-4 lg:grid-cols-[1fr_1fr_1fr_140px_120px_120px_auto]"
              >
                <Input
                  value={variant.name}
                  placeholder="სახელი"
                  onChange={(event) =>
                    updateVariant(index, { name: event.target.value })
                  }
                />
                <Input
                  value={variant.value || ""}
                  placeholder="მნიშვნელობა"
                  onChange={(event) =>
                    updateVariant(index, { value: event.target.value })
                  }
                />
                <Input
                  value={variant.sku || ""}
                  placeholder="SKU"
                  onChange={(event) => updateVariant(index, { sku: event.target.value })}
                />
                <Input
                  type="number"
                  step="0.01"
                  value={variant.priceAdjustment}
                  placeholder="ფასის სხვაობა"
                  onChange={(event) =>
                    updateVariant(index, {
                      priceAdjustment: Number(event.target.value),
                    })
                  }
                />
                <Input
                  type="number"
                  value={variant.stockQuantity}
                  placeholder="ნაშთი"
                  onChange={(event) =>
                    updateVariant(index, {
                      stockQuantity: Number(event.target.value),
                    })
                  }
                />
                <label className="flex items-center gap-2 rounded-xl border border-black/8 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={variant.isActive}
                    onChange={(event) =>
                      updateVariant(index, { isActive: event.target.checked })
                    }
                    className="h-4 w-4 accent-accent"
                  />
                  აქტიური
                </label>
                <Button
                  variant="outline"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      variants:
                        current.variants.length > 1
                          ? current.variants.filter(
                              (_, currentIndex) => currentIndex !== index
                            )
                          : [{ ...emptyVariant }],
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/8 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 py-4">
          <p className="text-sm text-muted-foreground">
            შეამოწმე სურათები, ვარიანტები და აღწერები შენახვამდე.
          </p>
          <div className="flex gap-3">
            <Link href="/admin/products">
              <Button variant="outline">გაუქმება</Button>
            </Link>
            <Button
              className="bg-accent text-white hover:bg-accent-hover"
              onClick={submitForm}
            >
              შენახვა
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductEditor({ productId }: ProductEditorProps) {
  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });

  const productQuery = useQuery({
    queryKey: ["admin-product", productId],
    queryFn: () => getAdminProductById(productId as number),
    enabled: typeof productId === "number",
  });

  if (categoriesQuery.isLoading || (productId && productQuery.isLoading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-3xl border border-black/8 bg-white p-6 text-sm text-muted-foreground">
          იტვირთება...
        </div>
      </div>
    );
  }

  if (categoriesQuery.isError || (productId && productQuery.isError)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-3xl border border-destructive/40 bg-white p-6 text-sm text-destructive">
          მონაცემების ჩატვირთვა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.
        </div>
      </div>
    );
  }

  return (
    <ProductEditorForm
      key={productId ? `product-${productId}` : "product-new"}
      categories={categoriesQuery.data || []}
      initialForm={productQuery.data ? mapProductToForm(productQuery.data) : emptyForm}
      productId={productId}
    />
  );
}
