"use client";

import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

const STEP_LABELS = [
  "პროდუქტი",
  "ზომა/ფერი",
  "დიზაინი",
  "პარამეტრები",
  "შეჯამება",
] as const;

interface StepIndicatorProps {
  currentStep: number;
  skippedSteps?: number[];
}

export function StepIndicator({ currentStep, skippedSteps = [] }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isSkipped  = skippedSteps.includes(stepNumber);
          const isDone     = !isSkipped && stepNumber < currentStep;
          const isActive   = !isSkipped && stepNumber === currentStep;
          const isUpcoming = !isSkipped && stepNumber > currentStep;

          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5 min-w-[48px]">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                    isDone    && "border-accent bg-accent text-white",
                    isActive  && "border-accent bg-white text-accent",
                    isUpcoming && "border-gray-300 bg-white text-gray-400",
                    isSkipped  && "border-gray-200 bg-gray-50 text-gray-300",
                  )}
                >
                  {isDone   ? <Check className="h-4 w-4" strokeWidth={2.5} /> :
                   isSkipped ? <Minus className="h-4 w-4" /> :
                   <span>{stepNumber}</span>}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium text-center leading-tight",
                    isActive   && "text-accent",
                    isDone     && "text-accent/70",
                    isUpcoming && "text-gray-400",
                    isSkipped  && "text-gray-300 line-through",
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEP_LABELS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 mb-5 transition-all",
                    isSkipped ? "bg-gray-100" :
                    stepNumber < currentStep ? "bg-accent" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
