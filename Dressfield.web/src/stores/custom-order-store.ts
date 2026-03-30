import { create } from "zustand";
import type { ProductSummaryDto } from "@/types/catalog";

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface DesignConfig {
  designImageUrl: string;
  previewDataUrl: string;
  placement: string;
  size: string;
  threadColor: string;
  width: number | null;
  height: number | null;
  positionX: number | null;
  positionY: number | null;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface CustomOrderState {
  step: WizardStep;
  selectedProduct: ProductSummaryDto | null;
  uploadedFile: File | null;
  design: DesignConfig | null;
  contact: ContactInfo;
  totalPrice: number;
  setStep: (step: WizardStep) => void;
  setSelectedProduct: (product: ProductSummaryDto | null) => void;
  setUploadedFile: (file: File | null) => void;
  setDesign: (design: DesignConfig) => void;
  setContact: (contact: Partial<ContactInfo>) => void;
  setTotalPrice: (price: number) => void;
  reset: () => void;
}

const defaultContact: ContactInfo = { name: "", phone: "", email: "", notes: "" };

export const useCustomOrderStore = create<CustomOrderState>((set) => ({
  step: 1,
  selectedProduct: null,
  uploadedFile: null,
  design: null,
  contact: defaultContact,
  totalPrice: 45,
  setStep: (step) => set({ step }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  setUploadedFile: (uploadedFile) => set({ uploadedFile }),
  setDesign: (design) => set({ design }),
  setContact: (contact) => set((state) => ({ contact: { ...state.contact, ...contact } })),
  setTotalPrice: (totalPrice) => set({ totalPrice }),
  reset: () =>
    set((state) => {
      if (
        typeof window !== "undefined" &&
        state.design?.previewDataUrl &&
        state.design.previewDataUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(state.design.previewDataUrl);
      }

      return {
        step: 1,
        selectedProduct: null,
        uploadedFile: null,
        design: null,
        contact: defaultContact,
        totalPrice: 45,
      };
    }),
}));
