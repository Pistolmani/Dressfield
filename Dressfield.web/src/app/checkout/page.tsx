/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { createOrder } from "@/lib/orders";
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
  shippingPostalCode: string;
  customerNotes: string;
}

const emptyForm: FormData = {
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  shippingCity: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingPostalCode: "",
  customerNotes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.contactName.trim()) e.contactName = "სახელი სავალდებულოა";
    if (!form.contactPhone.trim()) e.contactPhone = "ტელეფონი სავალდებულოა";
    if (!form.contactEmail.trim()) e.contactEmail = "ელ-ფოსტა სავალდებულოა";
    else if (!form.contactEmail.includes("@")) e.contactEmail = "ელ-ფოსტის ფორმატი არასწორია";
    if (!form.shippingCity.trim()) e.shippingCity = "ქალაქი სავალდებულოა";
    if (!form.shippingAddressLine1.trim()) e.shippingAddressLine1 = "მისამართი სავალდებულოა";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await createOrder({
        contactName: form.contactName.trim(),
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim().toLowerCase(),
        shippingCity: form.shippingCity.trim(),
        shippingAddressLine1: form.shippingAddressLine1.trim(),
        shippingAddressLine2: form.shippingAddressLine2.trim() || undefined,
        shippingPostalCode: form.shippingPostalCode.trim() || undefined,
        customerNotes: form.customerNotes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });

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

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="font-ui text-5xl font-semibold mb-6">
          გადახდა
        </h1>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8 text-sm font-medium">
          <span
            className={step === "form" ? "text-accent" : "text-muted-foreground"}
          >
            1. მიწოდება
          </span>
          <span className="text-muted-foreground">→</span>
          <span
            className={step === "review" ? "text-accent" : "text-muted-foreground"}
          >
            2. განხილვა
          </span>
        </div>

        {step === "form" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-4">
              <h2 className="font-medium text-lg">საკონტაქტო ინფორმაცია</h2>

              <Field label="სახელი და გვარი *" error={errors.contactName}>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  className={inputCls(!!errors.contactName)}
                  placeholder="მაგ. გიორგი ბერიძე"
                />
              </Field>

              <Field label="ტელეფონი *" error={errors.contactPhone}>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                  className={inputCls(!!errors.contactPhone)}
                  placeholder="+995 5XX XX XX XX"
                />
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

            <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-4">
              <h2 className="font-medium text-lg">მიწოდების მისამართი</h2>

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

              <Field label="მისამართი 2" error={errors.shippingAddressLine2}>
                <input
                  type="text"
                  value={form.shippingAddressLine2}
                  onChange={(e) => set("shippingAddressLine2", e.target.value)}
                  className={inputCls(false)}
                  placeholder="სახლი, სართული (არასავალდებულო)"
                />
              </Field>

              <Field label="საფოსტო ინდექსი">
                <input
                  type="text"
                  value={form.shippingPostalCode}
                  onChange={(e) => set("shippingPostalCode", e.target.value)}
                  className={inputCls(false)}
                  placeholder="0100"
                />
              </Field>

              <Field label="შენიშვნა">
                <textarea
                  value={form.customerNotes}
                  onChange={(e) => set("customerNotes", e.target.value)}
                  rows={3}
                  className={`${inputCls(false)} resize-none`}
                  placeholder="დამატებითი ინფორმაცია შეკვეთასთან დაკავშირებით"
                />
              </Field>
            </div>

            <Button
              className="w-full bg-accent text-white hover:bg-accent-hover h-11"
              onClick={() => validate() && setStep("review")}
            >
              გაგრძელება
            </Button>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            {/* Shipping summary */}
            <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-2 text-sm">
              <h2 className="font-medium text-base mb-3">მიწოდების მისამართი</h2>
              <p>{form.contactName} · {form.contactPhone}</p>
              <p>{form.contactEmail}</p>
              <p>{form.shippingCity}, {form.shippingAddressLine1}</p>
              {form.shippingAddressLine2 && <p>{form.shippingAddressLine2}</p>}
              {form.shippingPostalCode && <p>ინდექსი: {form.shippingPostalCode}</p>}
              {form.customerNotes && <p className="text-muted-foreground">შენიშვნა: {form.customerNotes}</p>}
            </div>

            {/* Cart items */}
            <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-3">
              <h2 className="font-medium text-base">შეკვეთა</h2>
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId ?? 0}`}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.variantLabel && (
                      <p className="text-muted-foreground text-xs">{item.variantLabel}</p>
                    )}
                  </div>
                  <p className="text-muted-foreground">×{item.quantity}</p>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="rounded-2xl border border-black/8 bg-white p-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ჯამი</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">მიწოდება</span>
                <span>{formatPrice(SHIPPING_COST)}</span>
              </div>
              <div className="border-t border-black/8 pt-2 flex justify-between font-semibold text-base">
                <span>სულ</span>
                <span className="text-accent">{formatPrice(total)}</span>
              </div>
            </div>

            {submitError && (
              <p className="text-red-500 text-sm text-center">{submitError}</p>
            )}

            <Button
              className="w-full bg-accent text-white hover:bg-accent-hover h-11"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  მუშავდება...
                </>
              ) : (
                "შეკვეთის გაფორმება"
              )}
            </Button>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← უკან
            </button>
          </div>
        )}
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
