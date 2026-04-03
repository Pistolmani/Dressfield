/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { createOrder } from "@/lib/orders";
import { trackInitiateCheckout } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";

type Step = "form" | "review";

const SHIPPING_COST = Number(process.env.NEXT_PUBLIC_SHIPPING_COST ?? "5");

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

// Validation helpers
const NAME_REGEX = /^[\u10A0-\u10FFa-zA-Z\s\-']+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_DIGITS_ONLY = /\D/g;
const CITY_REGEX = /^[\u10A0-\u10FFa-zA-Z\s]+$/;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasTrackedInitiateCheckoutRef = useRef(false);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  useEffect(() => {
    if (items.length === 0 || hasTrackedInitiateCheckoutRef.current) {
      return;
    }

    const subtotal = totalPrice();
    const total = subtotal + SHIPPING_COST;

    trackInitiateCheckout({
      contentIds: Array.from(new Set(items.map((item) => String(item.productId)))),
      value: total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    });

    hasTrackedInitiateCheckoutRef.current = true;
  }, [items, totalPrice]);

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
    } else if (!CITY_REGEX.test(form.shippingCity.trim())) {
      e.shippingCity = "მხოლოდ ასოები დაშვებულია";
    }

    if (!form.shippingAddressLine1.trim()) {
      e.shippingAddressLine1 = "მისამართი სავალდებულოა";
    } else if (form.shippingAddressLine1.trim().length < 3) {
      e.shippingAddressLine1 = "მინიმუმ 3 სიმბოლო";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await createOrder({
        contactName: form.contactName.trim(),
        contactPhone: `+995${form.contactPhone}`,
        contactEmail: form.contactEmail.trim().toLowerCase(),
        shippingCity: form.shippingCity.trim(),
        shippingAddressLine1: form.shippingAddressLine1.trim(),
        shippingAddressLine2: form.shippingAddressLine2.trim() || undefined,
        customerNotes: form.customerNotes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      // Persist orderId before leaving — lets the confirmation page recover
      // if the tab closes between the redirect and BOG's return callback.
      if (result.orderId) {
        localStorage.setItem("dressfield_pending_order_id", String(result.orderId));
      }

      clearCart();

      if (result.paymentRedirectUrl) {
        window.location.href = result.paymentRedirectUrl;
      } else {
        router.push(`/order-confirmation?orderId=${result.orderId}&mock=1`);
      }
    } catch {
      setSubmitError("შეკვეთის გაფორმება ვერ მოხერხდა. სცადეთ თავიდან.");
    } finally {
      setSubmitting(false);
    }
  }

  const subtotal = totalPrice();
  const total = subtotal + SHIPPING_COST;

  // Order summary panel — shown on both steps
  const OrderSummary = () => (
    <div className="rounded-2xl border border-black/8 bg-white p-5 space-y-4 sticky top-6">
      <h2 className="font-semibold text-base">შეკვეთის შეჯამება</h2>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId ?? 0}`} className="flex items-center gap-3 text-sm">
            <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              )}
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
        <div className="flex justify-between text-muted-foreground">
          <span>მიწოდება</span>
          <span>{formatPrice(SHIPPING_COST)}</span>
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
                    <input
                      type="text"
                      value={form.shippingCity}
                      onChange={(e) => set("shippingCity", e.target.value)}
                      className={inputCls(!!errors.shippingCity)}
                      placeholder="მაგ. თბილისი"
                    />
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

                <Button
                  className="w-full bg-accent text-white hover:bg-accent-hover h-12 text-base font-bold shadow-md"
                  onClick={handleSubmit}
                  disabled={submitting}
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
