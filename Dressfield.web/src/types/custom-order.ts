export type CustomOrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const CustomOrderStatusLabels: Record<CustomOrderStatus, string> = {
  0: "მოლოდინში",
  1: "განხილვაში",
  2: "დამტკიცებულია",
  3: "წარმოებაში",
  4: "დასრულებულია",
  5: "უარყოფილია",
  6: "გაუქმებულია",
};

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
