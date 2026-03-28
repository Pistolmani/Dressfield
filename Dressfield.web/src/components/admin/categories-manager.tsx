"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  slugify,
  updateCategory,
} from "@/lib/catalog";
import type { CategoryDto, CategoryPayload } from "@/types/catalog";

const emptyForm: CategoryPayload = {
  name: "",
  slug: "",
  description: "",
  displayOrder: 0,
  isActive: true,
};

function normalizePayload(form: CategoryPayload): CategoryPayload {
  return {
    ...form,
    description: form.description?.trim() || null,
    slug: form.slug.trim(),
    name: form.name.trim(),
  };
}

export function CategoriesManager() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [form, setForm] = useState<CategoryPayload>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: CategoryPayload) => {
      if (editingCategory) {
        return updateCategory(editingCategory.id, payload);
      }

      return createCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setSheetOpen(false);
      toast.success("კატეგორია შენახულია");
    },
    onError: () => toast.error("კატეგორიის შენახვა ვერ მოხერხდა"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("სტატუსი განახლდა");
    },
    onError: () => toast.error("სტატუსის განახლება ვერ მოხერხდა"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("კატეგორია წაიშალა");
    },
    onError: () => toast.error("წაშლა ვერ მოხერხდა"),
  });

  function openCreateSheet() {
    setEditingCategory(null);
    setForm(emptyForm);
    setSlugTouched(false);
    setSheetOpen(true);
  }

  function openEditSheet(category: CategoryDto) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    });
    setSlugTouched(true);
    setSheetOpen(true);
  }

  function submitForm() {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("სახელი და slug აუცილებელია");
      return;
    }

    saveMutation.mutate(normalizePayload(form));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            კატეგორიები
          </p>
          <h1 className="font-[family-name:var(--font-inter)] text-3xl font-semibold tracking-tight">
            კატეგორიების მართვა
          </h1>
        </div>
        <Button className="bg-accent text-white hover:bg-accent-hover" onClick={openCreateSheet}>
          <Plus className="h-4 w-4" />
          დამატება
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-black/[0.03] text-left">
              <tr>
                <th className="px-5 py-4 font-medium">სახელი</th>
                <th className="px-5 py-4 font-medium">Slug</th>
                <th className="px-5 py-4 font-medium">პროდუქტები</th>
                <th className="px-5 py-4 font-medium">აქტიური</th>
                <th className="px-5 py-4 font-medium text-right">მოქმედებები</th>
              </tr>
            </thead>
            <tbody>
              {categoriesQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    იტვირთება...
                  </td>
                </tr>
              ) : categoriesQuery.isError ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-destructive">
                    კატეგორიების ჩატვირთვა ვერ მოხერხდა.
                  </td>
                </tr>
              ) : categoriesQuery.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    კატეგორია ჯერ არ არის დამატებული.
                  </td>
                </tr>
              ) : null}
              {categoriesQuery.data?.map((category) => (
                <tr key={category.id} className="border-t border-black/6">
                  <td className="px-5 py-4">{category.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{category.slug}</td>
                  <td className="px-5 py-4">{category.productCount}</td>
                  <td className="px-5 py-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={category.isActive}
                        onChange={(event) =>
                          toggleMutation.mutate({
                            id: category.id,
                            payload: {
                              name: category.name,
                              slug: category.slug,
                              description: category.description,
                              displayOrder: category.displayOrder,
                              isActive: event.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4 accent-accent"
                      />
                      <span>{category.isActive ? "კი" : "არა"}</span>
                    </label>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditSheet(category)}>
                        <Pencil className="h-4 w-4" />
                        რედაქტირება
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`წავშალოთ კატეგორია: ${category.name}?`)) {
                            deleteMutation.mutate(category.id);
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {editingCategory ? "კატეგორიის რედაქტირება" : "კატეგორიის დამატება"}
            </SheetTitle>
            <SheetDescription>
              შეცვალე კატეგორიის ძირითადი პარამეტრები და შენახე ცვლილებები.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">სახელი</Label>
              <Input
                id="category-name"
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
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setForm((current) => ({ ...current, slug: event.target.value }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">აღწერა</Label>
              <textarea
                id="category-description"
                value={form.description || ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
                className="w-full rounded-xl border border-input px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-order">რიგითობა</Label>
              <Input
                id="category-order"
                type="number"
                value={form.displayOrder}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    displayOrder: Number(event.target.value),
                  }))
                }
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-black/8 px-3 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
                className="h-4 w-4 accent-accent"
              />
              <span className="text-sm">აქტიური კატეგორია</span>
            </label>
          </div>

          <SheetFooter className="border-t border-black/8">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              გაუქმება
            </Button>
            <Button
              className="bg-accent text-white hover:bg-accent-hover"
              onClick={submitForm}
            >
              შენახვა
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
