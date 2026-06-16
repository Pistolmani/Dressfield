export type CustomOrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const CustomOrderStatusLabels: Record<CustomOrderStatus, string> = {
  0: "მოლოდინში",
  1: "გადახდის მოლოდინში",
  2: "განხილვაში",
  3: "დამტკიცებულია",
  4: "წარმოებაში",
  5: "დასრულებულია",
  6: "უარყოფილია",
  7: "გაუქმებულია",
  8: "გადახდის დამუშავება",
};

export const CustomOrderStatusBadgeClasses: Record<CustomOrderStatus, string> = {
  0: "bg-amber-100 text-amber-700", // Pending
  1: "bg-blue-100 text-blue-700", // AwaitingPayment
  2: "bg-indigo-100 text-indigo-700", // Reviewing - paid, needs admin attention
  3: "bg-green-100 text-green-700", // Approved
  4: "bg-accent/15 text-accent", // InProduction
  5: "bg-emerald-100 text-emerald-700", // Completed
  6: "bg-red-100 text-red-700", // Rejected
  7: "bg-gray-200 text-gray-700", // Cancelled
  8: "bg-slate-100 text-slate-700", // PaymentProcessing (system-managed)
};

// Custom orders have no dedicated "Paid" status. A successful BOG payment moves
// the order from AwaitingPayment(1)/PaymentProcessing(8) to Reviewing(2), so any
// status >= Reviewing means the customer has paid (except the terminal
// Rejected(6)/Cancelled(7)). The admin uses this to know real money came in.
export const PAID_CUSTOM_ORDER_STATUSES: CustomOrderStatus[] = [2, 3, 4, 5];

export function isPaidCustomOrderStatus(
  status: CustomOrderStatus | undefined | null
): boolean {
  return status != null && PAID_CUSTOM_ORDER_STATUSES.includes(status);
}

export interface CustomOrderCheckoutResponse {
  orderId: number;
  paymentRedirectUrl: string | null;
  paymentSuccess: boolean;
}

export interface CustomOrderDesignDto {
  id: number;
  designImageUrl: string;
  placement: string | null;
  size: string | null;
  threadColor: string | null;
  side: string | null;
  width: number | null;
  height: number | null;
  positionX: number | null;
  positionY: number | null;
  scaleX: number | null;
  scaleY: number | null;
  angle: number | null;
  sortOrder: number;
}

export interface CustomOrderSummaryDto {
  id: number;
  userId: string | null;
  baseProductId: number | null;
  baseProductName: string | null;
  // Garment type the customer configured (e.g. "hoodie"). Custom orders never
  // reference a catalog product, so baseProductName is always null - this is the
  // meaningful label to show. Optional: only present once the admin-list endpoint
  // includes it; the UI falls back gracefully when absent.
  productTypeId?: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: CustomOrderStatus;
  totalPrice: number;
  createdAt: string;
}

export interface CustomOrderDetailDto extends CustomOrderSummaryDto {
  customerNotes: string | null;
  adminNotes: string | null;
  productTypeId: string | null;
  colorHex: string | null;
  clothingSize: string | null;
  canvasWidth: number | null;
  canvasHeight: number | null;
  updatedAt: string;
  designs: CustomOrderDesignDto[];
}

export interface CreateCustomOrderDesignRequest {
  designImageUrl: string;
  placement: string | null;
  size: string | null;
  threadColor: string | null;
  side: string | null;
  width: number | null;
  height: number | null;
  positionX: number | null;
  positionY: number | null;
  scaleX: number | null;
  scaleY: number | null;
  angle: number | null;
  sortOrder: number;
}

export interface CreateCustomOrderRequest {
  baseProductId: number | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  totalPrice: number;
  customerNotes: string | null;
  productTypeId: string | null;
  colorHex: string | null;
  clothingSize: string | null;
  canvasWidth: number | null;
  canvasHeight: number | null;
  designs: CreateCustomOrderDesignRequest[];
}
