"use client";

import { cn } from "@/lib/utils";
import type { WizardStep } from "@/stores/custom-order-store";

const steps = [
  "პროდუქტი",
  "ატვირთვა",
  "რედაქტირება",
  "პარამეტრები",
  "გადახედვა",
  "შეკვეთა",
] as const;

export function StepIndicator({ currentStep }: { currentStep: WizardStep }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">ნაბიჯი {currentStep} / 6</p>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((label, index) => {
          const stepNumber = (index + 1) as WizardStep;
          const isDone = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={label} className="flex min-w-fit items-center gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                    isActive && "bg-accent text-white",
                    isDone && "bg-accent/20 text-accent",
                    !isActive && !isDone && "bg-black/5 text-muted-foreground"
                  )}
                >
                  {stepNumber}
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                </div>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "h-px w-10 sm:w-14",
                    stepNumber < currentStep ? "bg-accent" : "bg-black/8"
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
