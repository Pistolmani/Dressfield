/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { createOrder } from "@/lib/orders";
import { validatePromoCode } from "@/lib/promo-codes";
import { submitCustomOrder } from "@/lib/custom-orders";
import { uploadDesignImage } from "@/lib/upload";
import { trackInitiateCheckout } from "@/lib/analytics";
import {
  getCartComposition,
  SEPARATE_CHECKOUT_REQUIRED_MESSAGE,
} from "@/lib/cart-composition";
import { getShippingCostByCity } from "@/lib/shipping";
import { CITY_OPTIONS } from "@/lib/georgian-cities";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import type { PromoCodeValidationResultDto } from "@/types/promo-code";

type Step = "form" | "review";
const CHECKOUT_PREFILL_STORAGE_KEY = "dressfield-checkout-prefill-v1";
const CUSTOM_ORDER_TOTAL_INVALID_MESSAGE =
  "ინდივიდუალური შეკვეთის თანხა ვერ დამუშავდა. გთხოვთ გადაამოწმოთ კალათა და სცადოთ თავიდან.";
const LEGACY_DESIGN_UNAVAILABLE_MESSAGE =
  "დიზაინის ფაილი აღარ არის ხელმისაწვდომი. გთხოვთ დაბრუნდეთ custom შეკვეთაში და თავიდან ატვირთოთ დიზაინი.";

interface FormData {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  shippingCity: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  customerNotes: string;
}

const emptyForm: FormData = {
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  shippingCity: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  customerNotes: "",
};

type CheckoutPrefillSnapshot = Pick<
  FormData,
  "contactName" | "contactPhone" | "contactEmail" | "shippingCity" | "shippingAddressLine1" | "shippingAddressLine2"
>;

// Validation helpers
const NAME_REGEX = /^[\u10A0-\u10FFa-zA-Z\s\-']+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_DIGITS_ONLY = /\D/g;

function normalizeLocalPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(PHONE_DIGITS_ONLY, "");
  if (!digits) return "";

  if (digits.length === 9 && digits.startsWith("5")) return digits;
  if (digits.length === 12 && digits.startsWith("995")) {
    const local = digits.slice(3);
    return local.length === 9 && local.startsWith("5") ? local : "";
  }
  if (digits.length === 14 && digits.startsWith("00995")) {
    const local = digits.slice(5);
    return local.length === 9 && local.startsWith("5") ? local : "";
  }

  const tail = digits.slice(-9);
  if (tail.length === 9 && tail.startsWith("5")) return tail;
  return "";
}

function extractApiErrorMessage(error: unknown): string | null {
  if (!isAxiosError(error)) return null;
  const data = error.response?.data;
  if (!data) return null;

  if (typeof data === "string") return data;

  if (typeof data === "object" && data !== null) {
    const maybeRecord = data as Record<string, unknown>;

    if (typeof maybeRecord.message === "string" && maybeRecord.message.trim()) {
      return maybeRecord.message;
    }

    if (typeof maybeRecord.title === "string" && maybeRecord.title.trim()) {
      return maybeRecord.title;
    }

    const errors = maybeRecord.errors;
    if (errors && typeof errors === "object") {
      for (const value of Object.values(errors as Record<string, unknown>)) {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
          return value[0];
        }
        if (typeof value === "string" && value.trim()) {
          return value;
        }
      }
    }
  }

  return null;
}

function guessExtensionFromMime(type: string | undefined): string {
  if (!type) return "png";
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg";
  if (type.includes("webp")) return "webp";
  if (type.includes("png")) return "png";
  return "png";
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function allocateDiscountByShare(subtotals: number[], totalDiscount: number): number[] {
  const normalizedSubtotals = subtotals.map((value) => Math.max(0, roundMoney(value)));
  const subtotalSum = roundMoney(normalizedSubtotals.reduce((sum, value) => sum + value, 0));
  const normalizedDiscount = Math.min(subtotalSum, Math.max(0, roundMoney(totalDiscount)));

  if (subtotalSum <= 0 || normalizedDiscount <= 0) {
    return normalizedSubtotals.map(() => 0);
  }

  const discounts = normalizedSubtotals.map((subtotal) =>
    roundMoney(Math.min(subtotal, (normalizedDiscount * subtotal) / subtotalSum))
  );

  let remaining = roundMoney(
    normalizedDiscount - discounts.reduce((sum, value) => sum + value, 0)
  );

  if (remaining > 0) {
    for (let index = discounts.length - 1; index >= 0 && remaining > 0; index -= 1) {
      const available = roundMoney(normalizedSubtotals[index] - discounts[index]);
      if (available <= 0) continue;
      const delta = Math.min(available, remaining);
      discounts[index] = roundMoney(discounts[index] + delta);
      remaining = roundMoney(remaining - delta);
    }
  }

  return discounts;
}

// The custom-order canvas is hard-coded to 500x500 in ProductCanvas.tsx. We persist
// it so the admin renderer can scale the saved coords to any preview viewport size.
const CUSTOM_ORDER_CANVAS_SIZE = 500;

/**
 * Reads the intrinsic dimensions of an image URL so we can compute the final
 * rendered size (= natural x scale) the customer saw. Resolves to null on
 * failure rather than throwing - losing one design's geometry shouldn't block
 * checkout, and the admin renderer falls back to a coords-only block.
 */
function loadNaturalDimensions(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    // crossOrigin must be set BEFORE src to avoid tainting; harmless if the URL is same-origin.
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

function buildDesignSources(item: ReturnType<typeof useCartStore.getState>["items"][number]) {
  const fromPayload =
    item.customOrderData?.designs
      ?.filter((design) => typeof design.url === "string" && design.url.length > 0)
      .map((design, index) => ({
        url: design.url,
        side: design.side,
        sortOrder: Number.isFinite(design.sortOrder) ? design.sortOrder : index,
        transform: design.transform,
      })) ?? [];

  if (fromPayload.length > 0) {
    return fromPayload;
  }

  if (item.imageUrl) {
    return [
      {
        url: item.imageUrl,
        side: "front" as const,
        sortOrder: 0,
        transform: undefined,
      },
    ];
  }

  return [];
}

function mergeNotes(globalNote: string, itemNote?: string) {
  const parts = [itemNote?.trim(), globalNote.trim()].filter(
    (value): value is string => Boolean(value)
  );
  return parts.length > 0 ? parts.join("\n\n") : null;
}

function loadCheckoutPrefill(): CheckoutPrefillSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKOUT_PREFILL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutPrefillSnapshot>;
    return {
      contactName: typeof parsed.contactName === "string" ? parsed.contactName : "",
      contactPhone: typeof parsed.contactPhone === "string" ? parsed.contactPhone : "",
      contactEmail: typeof parsed.contactEmail === "string" ? parsed.contactEmail : "",
      shippingCity: typeof parsed.shippingCity === "string" ? parsed.shippingCity : "",
      shippingAddressLine1:
        typeof parsed.shippingAddressLine1 === "string" ? parsed.shippingAddressLine1 : "",
      shippingAddressLine2:
        typeof parsed.shippingAddressLine2 === "string" ? parsed.shippingAddressLine2 : "",
    };
  } catch {
    return null;
  }
}

function saveCheckoutPrefill(snapshot: CheckoutPrefillSnapshot) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKOUT_PREFILL_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore localStorage failures.
  }
}

function splitFullName(fullName: string): { firstName: string; lastName: string } | null {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, loading: authLoading, updateProfile } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoApplyError, setPromoApplyError] = useState<string | null>(null);
  const [promoApplying, setPromoApplying] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeValidationResultDto | null>(null);
  const hasTrackedInitiateCheckoutRef = useRef(false);

  const { customItems, regularItems, requiresSeparateCheckout } = getCartComposition(items);
  const promoEligible = items.length > 0;
  const shippingCost = getShippingCostByCity(form.shippingCity);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  useEffect(() => {
    const snapshot = loadCheckoutPrefill();
    if (!snapshot) return;

    setForm((prev) => {
      const next = { ...prev };
      let changed = false;

      if (!prev.contactName && snapshot.contactName) {
        next.contactName = snapshot.contactName;
        changed = true;
      }
      if (!prev.contactPhone && snapshot.contactPhone) {
        next.contactPhone = snapshot.contactPhone;
        changed = true;
      }
      if (!prev.contactEmail && snapshot.contactEmail) {
        next.contactEmail = snapshot.contactEmail;
        changed = true;
      }
      if (!prev.shippingCity && snapshot.shippingCity) {
        next.shippingCity = snapshot.shippingCity;
        changed = true;
      }
      if (!prev.shippingAddressLine1 && snapshot.shippingAddressLine1) {
        next.shippingAddressLine1 = snapshot.shippingAddressLine1;
        changed = true;
      }
      if (!prev.shippingAddressLine2 && snapshot.shippingAddressLine2) {
        next.shippingAddressLine2 = snapshot.shippingAddressLine2;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    if (promoEligible) return;
    setAppliedPromo(null);
    setPromoApplyError(null);
  }, [promoEligible]);

  useEffect(() => {
    if (items.length === 0 || hasTrackedInitiateCheckoutRef.current) {
      return;
    }

    const subtotal = totalPrice();
    const total = subtotal + shippingCost;

    trackInitiateCheckout({
      contentIds: Array.from(new Set(items.map((item) => String(item.productId)))),
      value: total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    });

    hasTrackedInitiateCheckoutRef.current = true;
  }, [items, shippingCost, totalPrice]);

  useEffect(() => {
    if (authLoading || !user) return;

    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    const userEmail = user.email?.trim().toLowerCase() ?? "";
    const userPhone = normalizeLocalPhone(user.phoneNumber ?? user.phone);
    const userCity = user.city?.trim() ?? "";
    const userAddressLine1 = user.addressLine1?.trim() ?? "";

    setForm((prev) => {
      const next = { ...prev };
      let changed = false;

      if (!prev.contactName && fullName) {
        next.contactName = fullName;
        changed = true;
      }
      if (!prev.contactEmail && userEmail) {
        next.contactEmail = userEmail;
        changed = true;
      }
      if (!prev.contactPhone && userPhone) {
        next.contactPhone = userPhone;
        changed = true;
      }
      if (!prev.shippingCity && userCity) {
        next.shippingCity = userCity;
        changed = true;
      }
      if (!prev.shippingAddressLine1 && userAddressLine1) {
        next.shippingAddressLine1 = userAddressLine1;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [authLoading, user]);

  function set(field: keyof FormData, value: string) {
    // Smart sanitization per field
    let sanitized = value;
    if (field === "contactName") {
      // No leading spaces, no consecutive spaces
      sanitized = value.replace(/^\s+/, "").replace(/\s{2,}/g, " ");
    } else if (field === "contactPhone") {
      // Digits only, max 9
      sanitized = value.replace(PHONE_DIGITS_ONLY, "").slice(0, 9);
    } else if (field === "contactEmail") {
      // No spaces, auto-lowercase
      sanitized = value.replace(/\s/g, "").toLowerCase();
    } else if (field === "shippingCity") {
      sanitized = value.replace(/^\s+/, "").replace(/\s{2,}/g, " ");
    }
    setForm((prev) => ({ ...prev, [field]: sanitized }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    const name = form.contactName.trim();
    if (!name) {
      e.contactName = "სახელი სავალდებულოა";
    } else if (name.length < 2) {
      e.contactName = "მინიმუმ 2 სიმბოლო";
    } else if (!name.includes(" ")) {
      e.contactName = "გთხოვთ მიუთითეთ სახელი და გვარი";
    } else if (!NAME_REGEX.test(name)) {
      e.contactName = "მხოლოდ ასოები დაშვებულია";
    }

    if (!form.contactPhone) {
      e.contactPhone = "ტელეფონი სავალდებულოა";
    } else if (form.contactPhone.length !== 9) {
      e.contactPhone = "ტელეფონის ნომერი 9 ციფრისგან უნდა შედგებოდეს";
    } else if (!form.contactPhone.startsWith("5")) {
      e.contactPhone = "მობილურის ნომერი 5-ით უნდა იწყებოდეს";
    }

    if (!form.contactEmail.trim()) {
      e.contactEmail = "ელ-ფოსტა სავალდებულოა";
    } else if (!EMAIL_REGEX.test(form.contactEmail)) {
      e.contactEmail = "ელ-ფოსტის ფორმატი არასწორია";
    }

    if (!form.shippingCity.trim()) {
      e.shippingCity = "ქალაქი სავალდებულოა";
    }

    if (!form.shippingAddressLine1.trim()) {
      e.shippingAddressLine1 = "მისამართი სავალდებულოა";
    } else if (form.shippingAddressLine1.trim().length < 3) {
      e.shippingAddressLine1 = "მინიმუმ 3 სიმბოლო";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleApplyPromoCode() {
    if (!promoEligible || promoApplying) return;

    const code = promoCodeInput.trim();
    if (!code) {
      setAppliedPromo(null);
      setPromoApplyError("Enter a promo code.");
      return;
    }

    setPromoApplying(true);
    setPromoApplyError(null);

    try {
      const result = await validatePromoCode({ code, subtotal });
      if (!result.isValid) {
        setAppliedPromo(null);
        setPromoApplyError(result.message || "Promo code is invalid.");
        return;
      }

      setAppliedPromo(result);
      setPromoCodeInput(result.code ?? code.toUpperCase());
    } catch (error) {
      setAppliedPromo(null);
      setPromoApplyError(extractApiErrorMessage(error) ?? "Promo code validation failed.");
    } finally {
      setPromoApplying(false);
    }
  }

  function handleRemovePromoCode() {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoApplyError(null);
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (requiresSeparateCheckout) {
      setSubmitError(SEPARATE_CHECKOUT_REQUIRED_MESSAGE);
      return;
    }

    setSubmitting(true);
    try {
      const contactName = form.contactName.trim();
      const contactPhone = `+995${form.contactPhone}`;
      const contactEmail = form.contactEmail.trim().toLowerCase();
      const shippingCity = form.shippingCity.trim();
      const shippingAddressLine1 = form.shippingAddressLine1.trim();
      const shippingAddressLine2 = form.shippingAddressLine2.trim() || undefined;
      const sharedCustomerNotes = form.customerNotes.trim();

      saveCheckoutPrefill({
        contactName,
        contactPhone: form.contactPhone,
        contactEmail,
        shippingCity,
        shippingAddressLine1,
        shippingAddressLine2: shippingAddressLine2 ?? "",
      });

      if (user) {
        const parsedName = splitFullName(contactName);
        const firstName = parsedName?.firstName ?? user.firstName?.trim() ?? "";
        const lastName = parsedName?.lastName ?? user.lastName?.trim() ?? "";

        if (firstName && lastName) {
          try {
            await updateProfile({
              firstName,
              lastName,
              phone: contactPhone,
              city: shippingCity || undefined,
              addressLine1: shippingAddressLine1 || undefined,
            });
          } catch {
            // Do not block checkout if profile sync fails.
          }
        }
      }

      if (customItems.length > 0) {
        const createdCustomOrderIds: number[] = [];
        let uploadSequence = 0;
        const customItemSubtotals = customItems.map((item) => roundMoney(item.price * item.quantity));
        const customSubtotal = roundMoney(
          customItemSubtotals.reduce((sum, itemSubtotal) => sum + itemSubtotal, 0)
        );
        const customPromoDiscount =
          appliedPromo && customSubtotal > 0
            ? Math.min(
                customSubtotal,
                roundMoney((customSubtotal * appliedPromo.discountPercentage) / 100)
              )
            : 0;
        const customItemDiscounts = allocateDiscountByShare(customItemSubtotals, customPromoDiscount);

        for (const [itemIndex, item] of customItems.entries()) {
          const sources = buildDesignSources(item);
          if (sources.length === 0) {
            throw new Error("Custom დიზაინის სურათი ვერ მოიძებნა.");
          }

          const designs = [];
          for (const source of sources) {
            let designImageUrl = source.url;

            if (designImageUrl.startsWith("blob:")) {
              let response: Response;
              try {
                response = await fetch(designImageUrl);
              } catch {
                throw new Error(LEGACY_DESIGN_UNAVAILABLE_MESSAGE);
              }
              if (!response.ok) {
                throw new Error(LEGACY_DESIGN_UNAVAILABLE_MESSAGE);
              }

              const blob = await response.blob();
              const extension = guessExtensionFromMime(blob.type);
              const file = new File(
                [blob],
                `custom-design-${Date.now()}-${uploadSequence}.${extension}`,
                { type: blob.type || "image/png" }
              );
              uploadSequence += 1;
              designImageUrl = await uploadDesignImage(file);
            }

            // Capture the full Fabric.js transform so the admin can re-render the
            // composition. Width/height are the final on-canvas px (natural x scale),
            // which is what the admin renderer needs to position the design without
            // having to load the image itself first.
            const naturalDims = await loadNaturalDimensions(designImageUrl);
            const scaleX = source.transform?.scaleX ?? null;
            const scaleY = source.transform?.scaleY ?? null;
            const renderedWidth =
              naturalDims && scaleX != null ? naturalDims.width * scaleX : null;
            const renderedHeight =
              naturalDims && scaleY != null ? naturalDims.height * scaleY : null;

            designs.push({
              designImageUrl,
              placement: source.side === "back" ? "back" : "chest",
              size: item.customOrderData?.embroiderySize ?? null,
              threadColor: null,
              side: source.side ?? null,
              width: renderedWidth,
              height: renderedHeight,
              positionX: source.transform?.left ?? null,
              positionY: source.transform?.top ?? null,
              scaleX,
              scaleY,
              angle: source.transform?.angle ?? null,
              sortOrder: source.sortOrder,
            });
          }

          const quantityNote = item.quantity > 1 ? `Quantity: ${item.quantity}` : "";
          const itemPromoDiscount = customItemDiscounts[itemIndex] ?? 0;
          const promoNote =
            itemPromoDiscount > 0 && appliedPromo?.code
              ? `Promo (${appliedPromo.code}): -${itemPromoDiscount.toFixed(2)} GEL`
              : "";
          const itemNotes = [item.customOrderData?.orderNote, quantityNote]
            .filter((value): value is string => Boolean(value && value.trim()))
            .join("\n");
          const mergedItemNotes = [itemNotes, promoNote]
            .filter((value): value is string => Boolean(value && value.trim()))
            .join("\n");
          // Delivery is charged once per checkout. Add it to the first custom order so the
          // amount sent to BOG matches the checkout total (subtotal - promo + shipping).
          const itemShipping = itemIndex === 0 ? shippingCost : 0;
          const itemTotalPrice = roundMoney(
            Math.max(0, (customItemSubtotals[itemIndex] ?? 0) - itemPromoDiscount) + itemShipping
          );

          if (itemTotalPrice <= 0) {
            setSubmitError(CUSTOM_ORDER_TOTAL_INVALID_MESSAGE);
            return;
          }

          const customOrder = await submitCustomOrder({
            baseProductId: null,
            contactName,
            contactPhone,
            contactEmail,
            totalPrice: itemTotalPrice,
            customerNotes: mergeNotes(sharedCustomerNotes, mergedItemNotes),
            // Garment context - lets the admin render the right silhouette + color
            // behind the saved design overlays.
            productTypeId: item.customOrderData?.productTypeId ?? null,
            colorHex: item.customOrderData?.selectedColor?.hex ?? null,
            clothingSize: item.customOrderData?.clothingSize ?? null,
            canvasWidth: CUSTOM_ORDER_CANVAS_SIZE,
            canvasHeight: CUSTOM_ORDER_CANVAS_SIZE,
            designs,
          });

          createdCustomOrderIds.push(customOrder.orderId);

          // Persist orderId for confirmation page recovery
          localStorage.setItem("dressfield_pending_order_id", String(customOrder.orderId));

          // Redirect to BOG payment as soon as session is ready.
          // Do NOT clear the cart here - clear it on the confirmation page after payment succeeds.
          // This way items are restored if the user cancels or payment fails.
          if (createdCustomOrderIds.length === 1 && customOrder.paymentRedirectUrl) {
            window.location.href = customOrder.paymentRedirectUrl;
            return;
          }
        }

        clearCart();
        router.push(
          `/order-confirmation?custom=1&orderId=${createdCustomOrderIds[0]}&count=${createdCustomOrderIds.length}`
        );
        return;
      }

      const result = await createOrder({
        contactName,
        contactPhone,
        contactEmail,
        shippingCity,
        shippingAddressLine1,
        shippingAddressLine2,
        promoCode: appliedPromo?.code ?? undefined,
        customerNotes: sharedCustomerNotes || undefined,
        items: regularItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      // Persist orderId before leaving - lets the confirmation page recover
      // if the tab closes between the redirect and BOG's return callback.
      if (result.orderId) {
        localStorage.setItem("dressfield_pending_order_id", String(result.orderId));
      }

      if (result.paymentRedirectUrl) {
        // Do NOT clear the cart before the BOG redirect - the confirmation page
        // will clear it once payment is confirmed. This restores items if the
        // user cancels or payment fails.
        window.location.href = result.paymentRedirectUrl;
      } else {
        clearCart();
        router.push(`/order-confirmation?orderId=${result.orderId}`);
      }
    } catch (error) {
      const apiMessage = extractApiErrorMessage(error);
      if (apiMessage) {
        setSubmitError(apiMessage);
      } else if (error instanceof Error && error.message === LEGACY_DESIGN_UNAVAILABLE_MESSAGE) {
        setSubmitError(error.message);
      } else {
        setSubmitError("შეკვეთის გაფორმება ვერ მოხერხდა. სცადეთ თავიდან.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const subtotal = totalPrice();
  const promoDiscountPercentage = appliedPromo ? appliedPromo.discountPercentage : 0;
  const promoDiscount =
    appliedPromo
      ? Math.min(subtotal, roundMoney(subtotal * promoDiscountPercentage / 100))
      : 0;
  const total = roundMoney(Math.max(0, subtotal - promoDiscount) + shippingCost);

  // Order summary panel - shown on both steps
  const OrderSummary = () => (
    <div className="rounded-2xl border border-black/8 bg-white p-5 space-y-4 sticky top-6">
      <h2 className="font-semibold text-base">შეკვეთის შეჯამება</h2>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId ?? 0}`} className="flex items-center gap-3 text-sm">
            <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={item.imageUrl || "/dressfield-fallback.jpg"}
                alt={item.name}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  const img = event.currentTarget;
                  if (img.dataset.fallbackApplied === "1") return;
                  img.dataset.fallbackApplied = "1";
                  img.src = "/dressfield-fallback.jpg";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              {item.variantLabel && (
                <p className="text-muted-foreground text-xs truncate">{item.variantLabel}</p>
              )}
              <p className="text-xs text-muted-foreground">×{item.quantity}</p>
            </div>
            <p className="font-semibold flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-black/8 pt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>ჯამი</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {appliedPromo ? (
          <div className="flex justify-between text-green-600">
            <span>Promo ({promoDiscountPercentage}%)</span>
            <span>-{formatPrice(promoDiscount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-muted-foreground">
          <span>მიწოდება</span>
          <span>{formatPrice(shippingCost)}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1 border-t border-black/8">
          <span>სულ</span>
          <span className="text-accent">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header + Step Indicator */}
        <div className="mb-8">
          <h1 className="font-ui text-3xl sm:text-4xl font-bold mb-4">გადახდა</h1>
          <div className="flex items-center gap-0">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === "form" ? "bg-accent text-white" : "bg-black text-white"}`}>
              <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</span>
              მიწოდება
            </div>
            <div className="h-px w-6 bg-black/15" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === "review" ? "bg-accent text-white" : "bg-black/10 text-muted-foreground"}`}>
              <span className="h-5 w-5 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold">2</span>
              განხილვა
            </div>
          </div>
        </div>

        {/* Two-column layout: form left, order summary right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* LEFT: Form or Review */}
          <div>
            {step === "form" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-4">
                  <h2 className="font-semibold text-base">საკონტაქტო ინფორმაცია</h2>

                  <Field label="სახელი და გვარი *" error={errors.contactName}>
                    <input
                      type="text"
                      value={form.contactName}
                      onChange={(e) => set("contactName", e.target.value)}
                      className={inputCls(!!errors.contactName)}
                      placeholder="მაგ. გიორგი ბერიძე"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="ტელეფონი *" error={errors.contactPhone}>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-black/10 bg-gray-50 text-sm text-muted-foreground select-none">
                          +995
                        </span>
                        <input
                          type="tel"
                          value={form.contactPhone}
                          onChange={(e) => set("contactPhone", e.target.value)}
                          className={`${inputCls(!!errors.contactPhone)} rounded-l-none`}
                          placeholder="5XX XX XX XX"
                          maxLength={9}
                        />
                      </div>
                    </Field>

                    <Field label="ელ-ფოსტა *" error={errors.contactEmail}>
                      <input
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => set("contactEmail", e.target.value)}
                        className={inputCls(!!errors.contactEmail)}
                        placeholder="name@example.com"
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-4">
                  <h2 className="font-semibold text-base">მიწოდების მისამართი</h2>

                  <Field label="ქალაქი *" error={errors.shippingCity}>
                    <select
                      value={form.shippingCity}
                      onChange={(e) => set("shippingCity", e.target.value)}
                      className={inputCls(!!errors.shippingCity)}
                    >
                      <option value="" disabled>
                        აირჩიეთ ქალაქი
                      </option>
                      {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="მისამართი *" error={errors.shippingAddressLine1}>
                    <input
                      type="text"
                      value={form.shippingAddressLine1}
                      onChange={(e) => set("shippingAddressLine1", e.target.value)}
                      className={inputCls(!!errors.shippingAddressLine1)}
                      placeholder="ქუჩა, ბინა, კვარტალი"
                    />
                  </Field>

                  <Field label="მისამართი 2 (არასავალდებულო)" error={errors.shippingAddressLine2}>
                    <input
                      type="text"
                      value={form.shippingAddressLine2}
                      onChange={(e) => set("shippingAddressLine2", e.target.value)}
                      className={inputCls(false)}
                      placeholder="სახლი, სართული"
                    />
                  </Field>

                  <Field label="შენიშვნა (არასავალდებულო)">
                    <textarea
                      value={form.customerNotes}
                      onChange={(e) => set("customerNotes", e.target.value)}
                      rows={2}
                      className={`${inputCls(false)} resize-none`}
                      placeholder="დამატებითი ინფორმაცია შეკვეთასთან"
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-3">
                  <h2 className="font-semibold text-base">Promo Code</h2>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(event) => {
                        setPromoCodeInput(event.target.value.toUpperCase());
                        setPromoApplyError(null);
                      }}
                      className={inputCls(false)}
                      placeholder="Enter promo code"
                      disabled={promoApplying || submitting || Boolean(appliedPromo)}
                    />
                    {appliedPromo ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemovePromoCode}
                        disabled={promoApplying || submitting}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        className="bg-accent text-white hover:bg-accent-hover"
                        onClick={handleApplyPromoCode}
                        disabled={promoApplying || submitting}
                      >
                        {promoApplying ? "Applying..." : "Apply"}
                      </Button>
                    )}
                  </div>
                  {appliedPromo ? (
                    <p className="text-xs text-green-600">
                      Applied: {appliedPromo.code} ({appliedPromo.discountPercentage}% off)
                    </p>
                  ) : null}
                  {promoApplyError ? <p className="text-xs text-red-500">{promoApplyError}</p> : null}
                </div>

                <Button
                  className="w-full bg-accent text-white hover:bg-accent-hover h-12 text-base font-semibold"
                  onClick={() => validate() && setStep("review")}
                >
                  გადახდისკენ →
                </Button>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-4">
                {/* Delivery summary card */}
                <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-2 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-base">მიწოდების მისამართი</h2>
                    <button
                      type="button"
                      onClick={() => setStep("form")}
                      className="text-xs text-accent hover:underline"
                    >
                      შეცვლა
                    </button>
                  </div>
                  <p className="font-medium">{form.contactName}</p>
                  <p className="text-muted-foreground">+995{form.contactPhone} · {form.contactEmail}</p>
                  <p className="text-muted-foreground">{form.shippingCity}, {form.shippingAddressLine1}</p>
                  {form.shippingAddressLine2 && <p className="text-muted-foreground">{form.shippingAddressLine2}</p>}
                  {form.customerNotes && (
                    <p className="mt-2 rounded-lg bg-black/3 px-3 py-2 text-xs text-muted-foreground">
                      შენიშვნა: {form.customerNotes}
                    </p>
                  )}
                </div>

                {submitError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {submitError}
                  </div>
                )}

                {requiresSeparateCheckout ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {SEPARATE_CHECKOUT_REQUIRED_MESSAGE}
                  </div>
                ) : null}

                <Button
                  className="w-full bg-accent text-white hover:bg-accent-hover h-12 text-base font-bold shadow-md"
                  onClick={handleSubmit}
                  disabled={submitting || requiresSeparateCheckout}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      მუშავდება...
                    </>
                  ) : (
                    "შეკვეთის დადასტურება"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  გადახდის შემდეგ გადამისამართდებით BOG iPay-ზე
                </p>

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← მონაცემების შეცვლა
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Sticky order summary */}
          <div>
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border ${
    hasError ? "border-red-400" : "border-black/10"
  } bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors`;
}
