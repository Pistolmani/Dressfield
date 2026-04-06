"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createPromoCode,
  deletePromoCode,
  getAdminPromoCodes,
  updatePromoCode,
} from "@/lib/promo-codes";
import type { PromoCodeDto } from "@/types/promo-code";

type PromoFormState = {
  code: string;
  discountPercentage: string;
  isActive: boolean;
  expiresAtLocal: string;
};

const emptyForm: PromoFormState = {
  code: "",
  discountPercentage: "",
  isActive: true,
  expiresAtLocal: "",
};

function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toPayload(form: PromoFormState) {
  const code = form.code.trim().toUpperCase();
  const discountPercentage = Number.parseFloat(form.discountPercentage);

  if (!code) {
    throw new Error("Promo code is required.");
  }

  if (!Number.isFinite(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
    throw new Error("Discount must be between 0 and 100.");
  }

  return {
    code,
    discountPercentage,
    isActive: form.isActive,
    expiresAtUtc: form.expiresAtLocal ? new Date(form.expiresAtLocal).toISOString() : null,
  };
}

function mapPromoToForm(promo: PromoCodeDto): PromoFormState {
  return {
    code: promo.code,
    discountPercentage: String(promo.discountPercentage),
    isActive: promo.isActive,
    expiresAtLocal: isoToLocalInput(promo.expiresAtUtc),
  };
}

function formatDateTime(iso: string | null) {
  if (!iso) return "No expiry";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString("ka-GE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PromoCodesManager() {
  const queryClient = useQueryClient();
  const [createForm, setCreateForm] = useState<PromoFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<PromoFormState>(emptyForm);

  const promoCodesQuery = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: () => getAdminPromoCodes(),
  });

  const createMutation = useMutation({
    mutationFn: createPromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      setCreateForm(emptyForm);
      toast.success("Promo code created.");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Could not create promo code.";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReturnType<typeof toPayload> }) =>
      updatePromoCode(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      setEditingId(null);
      setEditForm(emptyForm);
      toast.success("Promo code updated.");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Could not update promo code.";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      toast.success("Promo code deleted.");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Could not delete promo code.";
      toast.error(message);
    },
  });

  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const sortedPromoCodes = useMemo(
    () => [...(promoCodesQuery.data ?? [])].sort((a, b) => b.id - a.id),
    [promoCodesQuery.data]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Admin</p>
        <h1 className="font-ui text-5xl font-semibold tracking-[0.04em]">Promo Codes</h1>
      </div>

      <section className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-ui text-2xl font-semibold">Create Promo Code</h2>

        <div className="grid gap-3 md:grid-cols-4">
          <Input
            value={createForm.code}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))
            }
            placeholder="Code (e.g. SPRING20)"
          />
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={createForm.discountPercentage}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, discountPercentage: event.target.value }))
            }
            placeholder="Discount %"
          />
          <Input
            type="datetime-local"
            value={createForm.expiresAtLocal}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, expiresAtLocal: event.target.value }))
            }
          />
          <label className="flex items-center gap-2 rounded-xl border border-black/8 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={createForm.isActive}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, isActive: event.target.checked }))
              }
              className="h-4 w-4 accent-accent"
            />
            Active
          </label>
        </div>

        <Button
          className="bg-accent text-white hover:bg-accent-hover"
          disabled={isBusy}
          onClick={() => {
            try {
              createMutation.mutate(toPayload(createForm));
            } catch (error) {
              const message = error instanceof Error ? error.message : "Invalid promo code data.";
              toast.error(message);
            }
          }}
        >
          <Plus className="h-4 w-4" />
          Add Promo Code
        </Button>
      </section>

      <section className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-black/[0.03] text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodesQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : promoCodesQuery.isError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-destructive">
                    Could not load promo codes.
                  </td>
                </tr>
              ) : sortedPromoCodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No promo codes yet.
                  </td>
                </tr>
              ) : null}

              {sortedPromoCodes.map((promo) => {
                const isEditing = editingId === promo.id;

                return (
                  <tr key={promo.id} className="border-t border-black/6">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          value={editForm.code}
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              code: event.target.value.toUpperCase(),
                            }))
                          }
                        />
                      ) : (
                        <span className="font-semibold">{promo.code}</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={editForm.discountPercentage}
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              discountPercentage: event.target.value,
                            }))
                          }
                        />
                      ) : (
                        `${promo.discountPercentage}%`
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? (
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={(event) =>
                              setEditForm((current) => ({ ...current, isActive: event.target.checked }))
                            }
                            className="h-4 w-4 accent-accent"
                          />
                          Active
                        </label>
                      ) : promo.isActive ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          type="datetime-local"
                          value={editForm.expiresAtLocal}
                          onChange={(event) =>
                            setEditForm((current) => ({ ...current, expiresAtLocal: event.target.value }))
                          }
                        />
                      ) : (
                        formatDateTime(promo.expiresAtUtc)
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              className="bg-accent text-white hover:bg-accent-hover"
                              disabled={isBusy}
                              onClick={() => {
                                try {
                                  updateMutation.mutate({
                                    id: promo.id,
                                    payload: toPayload(editForm),
                                  });
                                } catch (error) {
                                  const message =
                                    error instanceof Error ? error.message : "Invalid promo code data.";
                                  toast.error(message);
                                }
                              }}
                            >
                              <Save className="h-4 w-4" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(null);
                                setEditForm(emptyForm);
                              }}
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(promo.id);
                                setEditForm(mapPromoToForm(promo));
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              disabled={isBusy}
                              onClick={() => {
                                if (!window.confirm(`Delete promo code ${promo.code}?`)) return;
                                deleteMutation.mutate(promo.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
