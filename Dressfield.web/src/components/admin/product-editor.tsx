"use client";

import axios from "axios";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProduct,
  getAdminProductById,
  slugify,
  updateProduct,
} from "@/lib/catalog";
import {
  UPLOAD_ALLOWED_EXTENSIONS,
  UPLOAD_MAX_SIZE_MB,
  UploadValidationError,
  uploadDesignImage,
  validateDesignFile,
} from "@/lib/upload";
import type {
  ProductDetailDto,
  ProductImagePayload,
  ProductPayload,
} from "@/types/catalog";

type ProductEditorProps = {
  productId?: number;
};

type ProductImageUploaderProps = {
  image: ProductImagePayload;
  index: number;
  isUploading: boolean;
  onChange: (patch: Partial<ProductImagePayload>) => void;
  onRemove: () => void;
};

const emptyForm: ProductPayload = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  basePrice: 0,
  sku: "",
  isActive: true,
  isFeatured: false,
  images: [],
  variants: [],
};

function mapProductToForm(product: ProductDetailDto): ProductPayload {
  return {
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
        : [],
    variants: [],
  };
}

function getSaveErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data && typeof data === "object") {
      const message = "message" in data && typeof data.message === "string" ? data.message : null;
      if (message) {
        return message;
      }

      const title = "title" in data && typeof data.title === "string" ? data.title : null;
      if (title) {
        return title;
      }

      if ("errors" in data && data.errors && typeof data.errors === "object") {
        for (const value of Object.values(data.errors)) {
          if (Array.isArray(value)) {
            const firstMessage = value.find((item) => typeof item === "string" && item.trim());
            if (typeof firstMessage === "string") {
              return firstMessage;
            }
          }
        }
      }
    }
  }

  return "პროდუქტის შენახვა ვერ მოხერხდა";
}

function normalizeForm(form: ProductPayload): ProductPayload {
  const images = form.images
    .filter((image) => image.imageUrl.trim())
    .map((image, index) => ({
      imageUrl: image.imageUrl.trim(),
      altText: image.altText?.trim() || null,
      sortOrder: index,
      isPrimary: image.isPrimary,
    }));

  const shortDescription = form.shortDescription?.trim() || null;

  return {
    ...form,
    name: form.name.trim(),
    slug: slugify(form.slug.trim() || form.name),
    shortDescription,
    description: shortDescription || form.name.trim(),
    sku: form.sku?.trim() || null,
    basePrice: Number(form.basePrice),
    images: images.map((image, index) => ({
      ...image,
      sortOrder: index,
      isPrimary: images.some((item) => item.isPrimary) ? image.isPrimary : index === 0,
    })),
    variants: [],
  };
}

function ProductImageUploader({ image, index, isUploading, onChange, onRemove }: ProductImageUploaderProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-black/8 p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-black/10 bg-gray-50 px-4 py-6 text-center">
            {image.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.imageUrl} alt={image.altText || `Product image ${index + 1}`} className="h-36 w-full rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                {isUploading ? <LoaderCircle className="h-8 w-8 animate-spin text-accent" /> : <UploadCloud className="h-8 w-8 text-accent" />}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Alt ტექსტი</Label>
            <Input value={image.altText || ""} placeholder="მაგ: შავი ჰუდი ნაქარგით" onChange={(event) => onChange({ altText: event.target.value })} />
          </div>

          <div className="flex items-end gap-3">
            <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-black/8 px-3 text-sm">
              <input type="checkbox" checked={image.isPrimary} onChange={(event) => onChange({ isPrimary: event.target.checked })} className="h-4 w-4 accent-accent" />
              მთავარი სურათი
            </label>
            <Button variant="outline" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-xl bg-black/3 px-3 py-2 text-xs text-muted-foreground break-all">
            {image.imageUrl || "სურათი ჯერ არ არის ატვირთული"}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductEditorForm({
  initialForm,
  productId,
}: {
  initialForm: ProductPayload;
  productId?: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductPayload>(initialForm);
  const [slugTouched, setSlugTouched] = useState(Boolean(productId));
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const shortDescriptionLength = useMemo(() => form.shortDescription?.length || 0, [form.shortDescription]);

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
    onError: (error) => toast.error(getSaveErrorMessage(error)),
  });

  function updateImage(index: number, patch: Partial<ProductImagePayload>) {
    setForm((current) => {
      const nextImages = current.images.map((image, currentIndex) => {
        if (currentIndex !== index) {
          return patch.isPrimary ? { ...image, isPrimary: false } : image;
        }

        return { ...image, ...patch };
      });

      return {
        ...current,
        images: nextImages,
      };
    });
  }

  async function uploadImages(files: File[]) {
    if (files.length === 0) return;

    try {
      setIsUploadingImages(true);
      setUploadError("");

      for (const file of files) {
        validateDesignFile(file);
      }

      const uploaded = await Promise.all(
        files.map(async (file, index) => {
          const url = await uploadDesignImage(file);
          return {
            imageUrl: url,
            altText: file.name.replace(/\.[^.]+$/, ""),
            sortOrder: form.images.length + index,
            isPrimary: form.images.length === 0 && index === 0,
          } satisfies ProductImagePayload;
        })
      );

      setForm((current) => ({
        ...current,
        images: [...current.images, ...uploaded].map((image, index) => ({
          ...image,
          sortOrder: index,
          isPrimary: current.images.length === 0 ? index === 0 : image.isPrimary,
        })),
      }));

      toast.success(`${uploaded.length} სურათი აიტვირთა`);
    } catch (error) {
      if (error instanceof UploadValidationError) {
        setUploadError(error.message);
      } else {
        setUploadError("სურათების ატვირთვა ვერ მოხერხდა.");
      }
      toast.error("სურათების ატვირთვა ვერ მოხერხდა");
    } finally {
      setIsUploadingImages(false);
    }
  }

  const dropzone = useDropzone({
    multiple: true,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    onDropAccepted: async (acceptedFiles) => {
      await uploadImages(acceptedFiles);
    },
    onDropRejected: () => {
      setUploadError("მხოლოდ JPG, PNG ან WebP ფორმატია დაშვებული.");
    },
  });

  function submitForm() {
    const payload = normalizeForm(form);

    if (!payload.name || !payload.slug) {
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
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">პროდუქტები</p>
          <h1 className="font-ui text-5xl font-semibold tracking-[0.04em]">
            {productId ? "პროდუქტის რედაქტირება" : "ახალი პროდუქტი"}
          </h1>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-5 rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
          <h2 className="font-ui text-3xl font-semibold">ძირითადი ინფორმაცია</h2>
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
              placeholder="ავტომატურად შეივსება სახელიდან"
              onChange={(event) => {
                setSlugTouched(true);
                setForm((current) => ({ ...current, slug: slugify(event.target.value) }));
              }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-black/8 px-3 py-3">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} className="h-4 w-4 accent-accent" />
              <span className="text-sm">აქტიური</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-black/8 px-3 py-3">
              <input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))} className="h-4 w-4 accent-accent" />
              <span className="text-sm">რჩეული</span>
            </label>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
          <h2 className="font-ui text-3xl font-semibold">ფასი და SKU</h2>
          <div className="space-y-2">
            <Label htmlFor="product-price">ფასი</Label>
            <Input id="product-price" type="number" min="0" step="0.01" value={form.basePrice} onChange={(event) => setForm((current) => ({ ...current, basePrice: Number(event.target.value) }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-sku">SKU</Label>
            <Input id="product-sku" value={form.sku || ""} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} />
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-black/8 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="font-ui text-3xl font-semibold">მოკლე აღწერა</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="product-short-description">ტექსტი</Label>
              <span className="text-xs text-muted-foreground">{shortDescriptionLength}/300</span>
            </div>
            <textarea
              id="product-short-description"
              rows={5}
              maxLength={300}
              value={form.shortDescription || ""}
              onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value, description: event.target.value }))}
              className="w-full rounded-xl border border-input px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="მოკლე ტექსტი, რომელიც გამოჩნდება ბარათზე და პროდუქტის ზედა ნაწილში"
            />
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-black/8 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="space-y-2">
            <h2 className="font-ui text-3xl font-semibold">სურათები</h2>
            <p className="text-sm text-muted-foreground">შეგიძლია ერთდროულად რამდენიმე სურათი ატვირთო. ეს იყენებს იმავე upload flow-ს, რასაც მომხმარებლის custom-order გვერდი.</p>
          </div>

          <div
            {...dropzone.getRootProps()}
            className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-black/12 bg-gray-50 px-4 py-8 text-center transition-colors hover:border-accent hover:bg-violet-50/60"
          >
            <input {...dropzone.getInputProps()} />
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              {isUploadingImages ? <LoaderCircle className="h-8 w-8 animate-spin text-accent" /> : <UploadCloud className="h-8 w-8 text-accent" />}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isUploadingImages ? "სურათები იტვირთება..." : "ატვირთე ერთი ან რამდენიმე სურათი"}
              </p>
              <p className="text-xs text-muted-foreground">
                {UPLOAD_ALLOWED_EXTENSIONS.join(", ").toUpperCase().replaceAll(".", "")} - მაქსიმუმ {UPLOAD_MAX_SIZE_MB} MB თითო ფაილზე
              </p>
            </div>
          </div>

          {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}

          <div className="space-y-4">
            {form.images.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/12 bg-white px-6 py-10 text-center text-sm text-muted-foreground">
                ჯერ სურათი არ არის დამატებული.
              </div>
            ) : (
              form.images.map((image, index) => (
                <ProductImageUploader
                  key={`${index}-${image.imageUrl}`}
                  image={image}
                  index={index}
                  isUploading={isUploadingImages}
                  onChange={(patch) => updateImage(index, patch)}
                  onRemove={() =>
                    setForm((current) => ({
                      ...current,
                      images: current.images.filter((_, currentIndex) => currentIndex !== index).map((nextImage, nextIndex) => ({
                        ...nextImage,
                        sortOrder: nextIndex,
                        isPrimary: nextImage.isPrimary || nextIndex === 0,
                      })),
                    }))
                  }
                />
              ))
            )}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/8 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 py-4">
          <p className="text-sm text-muted-foreground">შეამოწმე სურათები და ძირითადი მონაცემები შენახვამდე.</p>
          <div className="flex gap-3">
            <Link href="/admin/products"><Button variant="outline">გაუქმება</Button></Link>
            <Button className="bg-accent text-white hover:bg-accent-hover" onClick={submitForm} disabled={saveMutation.isPending || isUploadingImages}>
              {saveMutation.isPending ? "ინახება..." : "შენახვა"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductEditor({ productId }: ProductEditorProps) {
  const productQuery = useQuery({
    queryKey: ["admin-product", productId],
    queryFn: () => getAdminProductById(productId as number),
    enabled: typeof productId === "number",
  });

  if (productId && productQuery.isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="rounded-3xl border border-black/8 bg-white p-6 text-sm text-muted-foreground">იტვირთება...</div></div>;
  }

  if (productId && productQuery.isError) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="rounded-3xl border border-destructive/40 bg-white p-6 text-sm text-destructive">მონაცემების ჩატვირთვა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.</div></div>;
  }

  return (
    <ProductEditorForm
      key={productId ? `product-${productId}` : "product-new"}
      initialForm={productQuery.data ? mapProductToForm(productQuery.data) : emptyForm}
      productId={productId}
    />
  );
}
