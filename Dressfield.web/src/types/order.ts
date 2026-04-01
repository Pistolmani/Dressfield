export type OrderStatus =
  | 'Pending'
  | 'AwaitingPayment'
  | 'Paid'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export const OrderStatusLabels: Record<OrderStatus, string> = {
  Pending:         'მოლოდინში',
  AwaitingPayment: 'გადახდის მოლოდინში',
  Paid:            'გადახდილია',
  Processing:      'მუშავდება',
  Shipped:         'გაგზავნილია',
  Delivered:       'მიღებულია',
  Cancelled:       'გაუქმებულია',
  Refunded:        'დაბრუნებულია',
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  Pending:         'bg-yellow-100 text-yellow-800',
  AwaitingPayment: 'bg-orange-100 text-orange-800',
  Paid:            'bg-green-100 text-green-800',
  Processing:      'bg-blue-100 text-blue-800',
  Shipped:         'bg-indigo-100 text-indigo-800',
  Delivered:       'bg-emerald-100 text-emerald-800',
  Cancelled:       'bg-red-100 text-red-800',
  Refunded:        'bg-gray-100 text-gray-800',
};

export interface OrderItemDto {
  id: number;
  productId: number | null;
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderSummaryDto {
  id: number;
  userId: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  shippingCity: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetailDto {
  id: number;
  userId: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  shippingCity: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingPostalCode: string | null;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  customerNotes: string | null;
  adminNotes: string | null;
  bogOrderId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
}

export interface OrderStatusLookupDto {
  orderId: number;
  status: OrderStatus;
  updatedAt: string;
}

export interface CartItemRequest {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface CreateOrderRequest {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  shippingCity: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  customerNotes?: string;
  items: CartItemRequest[];
}

export interface CheckoutResponse {
  orderId: number;
  paymentRedirectUrl: string | null;
  paymentAvailable: boolean;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  adminNotes?: string;
}
