"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/catalog";
import {
  getPlacementLabel,
  getSizeLabel,
  submitCustomOrder,
} from "@/lib/custom-orders";
import { useCustomOrderStore } from "@/stores/custom-order-store";

type ContactErrors = {
  name?: string;
  phone?: string;
  email?: string;
};

export function ContactStep() {
  const selectedProduct = useCustomOrderStore((state) => state.selectedProduct);
  const design = useCustomOrderStore((state) => state.design);
  const contact = useCustomOrderStore((state) => state.contact);
  const totalPrice = useCustomOrderStore((state) => state.totalPrice);
  const setContact = useCustomOrderStore((state) => state.setContact);
  const setStep = useCustomOrderStore((state) => state.setStep);
  const reset = useCustomOrderStore((state) => state.reset);

  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: () =>
      submitCustomOrder({
        baseProductId: selectedProduct?.id ?? null,
        contactName: contact.name,
        contactPhone: contact.phone,
        contactEmail: contact.email,
        totalPrice,
        customerNotes: contact.notes || null,
        designs: design
          ? [
              {
                designImageUrl: design.designImageUrl,
                placement: design.placement,
                size: design.size,
                threadColor: design.threadColor,
                width: design.width,
                height: design.height,
                positionX: design.positionX,
                positionY: design.positionY,
                sortOrder: 0,
              },
            ]
          : [],
      }),
    onSuccess: () => {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: () => {
      toast.error("შეკვეთის გაგზავნა ვერ მოხერხდა. სცადეთ ხელახლა.");
    },
  });

  function validate() {
    const nextErrors: ContactErrors = {};

    if (!contact.name.trim()) nextErrors.name = "სახელი და გვარი აუცილებელია";
    if (!contact.phone.trim()) nextErrors.phone = "ტელეფონი აუცილებელია";
    if (!contact.email.trim()) nextErrors.email = "ელ-ფოსტა აუცილებელია";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!design) {
      toast.error("დიზაინის მონაცემები ვერ მოიძებნა.");
      return;
    }

    if (!validate()) {
      return;
    }

    submitMutation.mutate();
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-black/8 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
        <h1 className="mt-4 font-ui text-5xl font-semibold tracking-[0.04em]">
          შეკვეთა გაიგზავნა!
        </h1>
        <p className="mt-2 text-muted-foreground">მალე დაგიკავშირდებით</p>
        <div className="mt-6">
          <Button
            className="bg-accent text-white hover:bg-accent-hover"
            onClick={() => {
              reset();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            ახალი შეკვეთა
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => setStep(5)}>
        <ArrowLeft className="h-4 w-4" />
        უკან
      </Button>

      <div className="space-y-2">
        <h1 className="font-ui text-5xl font-semibold tracking-[0.04em]">
          შეკვეთის გაფორმება
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="contact-name">სახელი და გვარი</Label>
            <Input
              id="contact-name"
              value={contact.name}
              onChange={(event) => setContact({ name: event.target.value })}
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">ტელეფონი</Label>
            <Input
              id="contact-phone"
              placeholder="+995 5XX XXX XXX"
              value={contact.phone}
              onChange={(event) => setContact({ phone: event.target.value })}
            />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">ელ-ფოსტა</Label>
            <Input
              id="contact-email"
              type="email"
              value={contact.email}
              onChange={(event) => setContact({ email: event.target.value })}
            />
            {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-notes">შენიშვნა</Label>
            <textarea
              id="contact-notes"
              rows={5}
              value={contact.notes}
              onChange={(event) => setContact({ notes: event.target.value })}
              className="w-full rounded-xl border border-input px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
          <h2 className="font-ui text-3xl font-semibold">
            შეკვეთის შეჯამება
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">პროდუქტი</span>
              <span>{selectedProduct?.name || "ცარიელი ტილო"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">ზომა</span>
              <span>{getSizeLabel(design?.size)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">განთავსება</span>
              <span>{getPlacementLabel(design?.placement)}</span>
            </div>
          </div>
          <div className="border-t border-black/8 pt-4">
            <p className="font-ui text-4xl font-semibold text-accent">
              {formatPrice(totalPrice)}
            </p>
          </div>
          <Button
            className="w-full bg-accent text-white hover:bg-accent-hover"
            disabled={submitMutation.isPending}
            onClick={handleSubmit}
          >
            {submitMutation.isPending ? "იგზავნება..." : "შეკვეთის გაგზავნა"}
          </Button>
        </div>
      </div>
    </div>
  );
}
