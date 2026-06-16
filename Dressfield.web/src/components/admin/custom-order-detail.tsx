/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAdminCustomOrderById,
  updateCustomOrderStatus,
} from "@/lib/custom-orders";
import { formatPrice } from "@/lib/catalog";
import {
  CustomOrderStatusBadgeClasses,
  CustomOrderStatusLabels,
  type CustomOrderDesignDto,
  type CustomOrderDetailDto,
  type CustomOrderStatus,
} from "@/types/custom-order";
import { CustomOrderPreview } from "@/components/admin/custom-order-preview";

// Status 8 (PaymentProcessing) is system-managed - admins shouldn't set it manually.
const statusOptions: CustomOrderStatus[] = [0, 1, 2, 3, 4, 5, 6, 7];
const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

function getStatusBadgeClass(status: CustomOrderStatus) {
  return CustomOrderStatusBadgeClasses[status] ?? "bg-gray-200 text-gray-700";
}

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url) || url.startsWith("//");
}

function toAbsoluteUrl(url: string) {
  if (url.startsWith("//")) return `https:${url}`;
  if (isAbsoluteUrl(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
}

function resolveImageSources(url: string) {
  const normalized = url.trim();
  if (!normalized) return [];

  const sources: string[] = [toAbsoluteUrl(normalized)];

  try {
    const parsed = new URL(sources[0]);
    const fileName = parsed.pathname.split("/").pop();
    const isLegacyUploadPath =
      parsed.pathname.startsWith("/uploads/") &&
      !parsed.pathname.startsWith("/uploads/designs/");

    if (fileName && isLegacyUploadPath) {
      sources.push(`${API_BASE}/uploads/designs/${fileName}`);
    }
  } catch {
    // Keep primary source only.
  }

  return Array.from(new Set(sources));
}

function guessFileName(url: string, orderId: number, designId: number) {
  try {
    const pathname = new URL(toAbsoluteUrl(url)).pathname;
    const ext = pathname.includes(".") ? pathname.slice(pathname.lastIndexOf(".")) : ".png";
    return `order-${orderId}-design-${designId}${ext}`;
  } catch {
    return `order-${orderId}-design-${designId}.png`;
  }
}

/**
 * Downloads the design image. The blob-fetch dance is required because the
 * `download` attribute on <a> is ignored for cross-origin URLs (Azure Blob),
 * which would otherwise just open the image in a new tab.
 */
async function downloadDesignImage(url: string, fileName: string) {
  const sources = resolveImageSources(url);
  for (const src of sources) {
    try {
      const response = await fetch(src);
      if (!response.ok) continue;
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      return;
    } catch {
      // Try the next candidate source.
    }
  }
  // Last resort - open in a new tab so the admin can save manually.
  const fallback = sources[0];
  if (fallback) {
    window.open(fallback, "_blank", "noopener");
  } else {
    toast.error("სურათის ჩამოტვირთვა ვერ მოხერხდა");
  }
}

/**
 * True when the order carries enough Fabric geometry for {@link CustomOrderPreview}
 * to reconstruct the placement composite. Mirrors that component's own guards so the
 * "view placement" affordance only appears when it will actually render something.
 */
function orderHasPlacement(order: CustomOrderDetailDto) {
  if (!order.productTypeId || !order.canvasWidth || !order.canvasHeight) return false;
  return order.designs.some(
    (d) => d.positionX != null && d.positionY != null && d.width != null && d.height != null
  );
}

function designHasGeometry(design: CustomOrderDesignDto) {
  return (
    design.positionX != null &&
    design.positionY != null &&
    design.width != null &&
    design.height != null
  );
}

function ViewPlacementButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full border-accent/40 text-accent hover:bg-accent/10 hover:text-accent"
      onClick={onClick}
    >
      <MapPin className="mr-2 h-4 w-4" />
      ნახე განთავსება
    </Button>
  );
}

/**
 * Full-screen re-render of the customer's canvas, opened from a design's "view
 * placement" button. Reconstructs the composition from the saved coordinates -
 * no screenshot needed - and rings the design the admin clicked.
 */
function PlacementModal({
  order,
  highlightDesignId,
  onClose,
}: {
  order: CustomOrderDetailDto;
  highlightDesignId: number | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while the overlay is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-ui text-3xl font-semibold">დიზაინის განთავსება</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ზუსტად ისე, როგორც მომხმარებელმა განათავსა ტილოზე.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-black/5 hover:text-foreground"
            aria-label="დახურვა"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <CustomOrderPreview
          productTypeId={order.productTypeId}
          colorHex={order.colorHex}
          canvasWidth={order.canvasWidth}
          canvasHeight={order.canvasHeight}
          designs={order.designs}
          viewportSize={520}
          highlightDesignId={highlightDesignId}
        />
      </div>
    </div>
  );
}

function DesignDownloadButton({
  url,
  orderId,
  designId,
}: {
  url: string;
  orderId: number;
  designId: number;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      disabled={isDownloading}
      onClick={async () => {
        setIsDownloading(true);
        try {
          await downloadDesignImage(url, guessFileName(url, orderId, designId));
        } finally {
          setIsDownloading(false);
        }
      }}
    >
      <Download className="mr-2 h-4 w-4" />
      {isDownloading ? "იტვირთება..." : "ჩამოტვირთვა"}
    </Button>
  );
}

function DesignPreviewImage({ url }: { url: string }) {
  const sources = useMemo(() => resolveImageSources(url), [url]);
  const [index, setIndex] = useState(0);
  const src = sources[index] ?? sources[0];

  if (!src || index >= sources.length) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-2xl border border-dashed border-black/15 bg-muted/30 text-xs text-muted-foreground">
        სურათი ვერ მოიძებნა
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="დიზაინი"
      className="h-[200px] w-full rounded-2xl object-cover"
      onError={() => {
        if (index < sources.length - 1) {
          setIndex((prev) => prev + 1);
        } else {
          setIndex(sources.length);
        }
      }}
    />
  );
}

export function CustomOrderDetail({ id }: { id: number }) {
  const orderQuery = useQuery({
    queryKey: ["admin-custom-order", id],
    queryFn: () => getAdminCustomOrderById(id),
  });

  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-muted-foreground">იტვირთება...</div>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-destructive">
        შეკვეთის ჩატვირთვა ვერ მოხერხდა.
      </div>
    );
  }

  return <CustomOrderDetailContent key={order.id} order={order} />;
}

function CustomOrderDetailContent({ order }: { order: CustomOrderDetailDto }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<CustomOrderStatus>(order.status);
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || "");
  // null = modal closed. A design id opens the placement view with that design ringed.
  const [placementDesignId, setPlacementDesignId] = useState<number | null>(null);
  const [placementOpen, setPlacementOpen] = useState(false);
  const canShowPlacement = useMemo(() => orderHasPlacement(order), [order]);

  const openPlacement = (designId: number | null) => {
    setPlacementDesignId(designId);
    setPlacementOpen(true);
  };

  const updateMutation = useMutation({
    mutationFn: () => updateCustomOrderStatus(order.id, status, adminNotes || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-custom-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-custom-order", order.id] });
      toast.success("სტატუსი განახლდა");
    },
    onError: () => toast.error("სტატუსის განახლება ვერ მოხერხდა"),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Link href="/admin/custom-orders">
        <Button variant="outline">
          <ArrowLeft className="h-4 w-4" />
          უკან
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">შეკვეთა #{order.id}</p>
                <h1 className="font-ui text-5xl font-semibold tracking-[0.04em]">
                  {order.contactName}
                </h1>
              </div>
              <Badge className={getStatusBadgeClass(order.status)}>
                {CustomOrderStatusLabels[order.status]}
              </Badge>
            </div>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">ტელეფონი</p>
                <p>{order.contactPhone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ელ-ფოსტა</p>
                <p>{order.contactEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">შექმნის თარიღი</p>
                <p>{new Date(order.createdAt).toLocaleString("ka-GE")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">განახლების თარიღი</p>
                <p>{new Date(order.updatedAt).toLocaleString("ka-GE")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">პროდუქტი</p>
                <p>{order.baseProductName || "ცარიელი ტილო"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ფასი</p>
                <p className="text-accent">{formatPrice(order.totalPrice)}</p>
              </div>
            </div>
          </div>

          {/* Visual composite for orders with captured canvas geometry. Renders
              nothing for legacy orders, in which case the raw coords block below
              still gives the admin enough info to act. */}
          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-ui text-3xl font-semibold">დიზაინის განთავსება</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  ნაჩვენებია სად განათავსა მომხმარებელმა დიზაინი ტილოზე.
                </p>
              </div>
              {canShowPlacement && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent/40 text-accent hover:bg-accent/10 hover:text-accent"
                  onClick={() => openPlacement(null)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  გადიდება
                </Button>
              )}
            </div>
            <div className="mt-4">
              {canShowPlacement ? (
                <CustomOrderPreview
                  productTypeId={order.productTypeId}
                  colorHex={order.colorHex}
                  canvasWidth={order.canvasWidth}
                  canvasHeight={order.canvasHeight}
                  designs={order.designs}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  ვიზუალური გადახედვა მიუწვდომელია — შეკვეთა შესრულდა გადახედვის ფუნქციის
                  დამატებამდე. იხილეთ დიზაინის ფაილები ქვემოთ.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
            <h2 className="font-ui text-3xl font-semibold">დიზაინები</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {order.designs.map((design) => (
                <div key={design.id} className="space-y-3 rounded-3xl border border-black/8 p-4">
                  <DesignPreviewImage url={design.designImageUrl} />
                  <DesignDownloadButton
                    url={design.designImageUrl}
                    orderId={order.id}
                    designId={design.id}
                  />
                  {canShowPlacement && designHasGeometry(design) && (
                    <ViewPlacementButton onClick={() => openPlacement(design.id)} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Always render so admins can confirm at a glance whether the customer
              left a note. Previously the whole section was hidden when notes
              were empty, which made it look like the data wasn't coming through
              even when it was. */}
          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
            <h2 className="font-ui text-3xl font-semibold">მომხმარებლის შენიშვნა</h2>
            {order.customerNotes && order.customerNotes.trim().length > 0 ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                {order.customerNotes}
              </p>
            ) : (
              <p className="mt-3 text-sm italic text-muted-foreground">
                შენიშვნა არ არის დატოვებული.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm h-fit">
          <h2 className="font-ui text-3xl font-semibold">სტატუსის განახლება</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">მიმდინარე სტატუსი</p>
              <Badge className={getStatusBadgeClass(order.status)}>
                {CustomOrderStatusLabels[order.status]}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ახალი სტატუსი</label>
              <select
                value={status}
                onChange={(event) => setStatus(Number(event.target.value) as CustomOrderStatus)}
                className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-accent"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {CustomOrderStatusLabels[option]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ადმინისტრატორის შენიშვნა</label>
              <textarea
                rows={5}
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                className="w-full rounded-xl border border-input px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <Button
              className="w-full bg-accent text-white hover:bg-accent-hover"
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              სტატუსის განახლება
            </Button>
          </div>
        </div>
      </div>

      {placementOpen && (
        <PlacementModal
          order={order}
          highlightDesignId={placementDesignId}
          onClose={() => setPlacementOpen(false)}
        />
      )}
    </div>
  );
}
