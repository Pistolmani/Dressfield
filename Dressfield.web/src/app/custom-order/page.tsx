"use client";

import { StepIndicator } from "@/components/custom-order/step-indicator";
import { ProductPickerStep } from "@/components/custom-order/product-picker-step";
import { UploadStep } from "@/components/custom-order/upload-step";
import { CanvasEditorStep } from "@/components/custom-order/canvas-editor-step";
import { OptionsStep } from "@/components/custom-order/options-step";
import { MockupPreviewStep } from "@/components/custom-order/mockup-preview-step";
import { ContactStep } from "@/components/custom-order/contact-step";
import { useCustomOrderStore } from "@/stores/custom-order-store";

export default function CustomOrderPage() {
  const step = useCustomOrderStore((state) => state.step);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <StepIndicator currentStep={step} />
      {step === 1 ? <ProductPickerStep /> : null}
      {step === 2 ? <UploadStep /> : null}
      {step === 3 ? <CanvasEditorStep /> : null}
      {step === 4 ? <OptionsStep /> : null}
      {step === 5 ? <MockupPreviewStep /> : null}
      {step === 6 ? <ContactStep /> : null}
    </div>
  );
}
