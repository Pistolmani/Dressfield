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
  width: number | null;
  height: number | null;
  positionX: number | null;
  positionY: number | null;
  sortOrder: number;
}

export interface CustomOrderSummaryDto {
  id: number;
  userId: string | null;
  baseProductId: number | null;
  baseProductName: string | null;
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
  updatedAt: string;
  designs: CustomOrderDesignDto[];
}

export interface CreateCustomOrderDesignRequest {
  designImageUrl: string;
  placement: string | null;
  size: string | null;
  threadColor: string | null;
  width: number | null;
  height: number | null;
  positionX: number | null;
  positionY: number | null;
  sortOrder: number;
}

export interface CreateCustomOrderRequest {
  baseProductId: number | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  totalPrice: number;
  customerNotes: string | null;
  designs: CreateCustomOrderDesignRequest[];
}
