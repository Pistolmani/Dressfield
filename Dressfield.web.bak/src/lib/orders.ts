import api from '@/lib/api';
import type {
  CheckoutResponse,
  CreateOrderRequest,
  OrderDetailDto,
  OrderStatusLookupDto,
  OrderStatus,
  OrderSummaryDto,
  UpdateOrderStatusRequest,
} from '@/types/order';

export async function createOrder(req: CreateOrderRequest): Promise<CheckoutResponse> {
  const { data } = await api.post<CheckoutResponse>('/api/orders', req);
  return data;
}

export async function getMyOrders(): Promise<OrderSummaryDto[]> {
  const { data } = await api.get<OrderSummaryDto[]>('/api/orders/my');
  return data;
}

export async function getMyOrderById(id: number): Promise<OrderDetailDto> {
  const { data } = await api.get<OrderDetailDto>(`/api/orders/my/${id}`);
  return data;
}

export async function getPublicOrderStatus(
  orderId: number,
  orderKey: string
): Promise<OrderStatusLookupDto> {
  const { data } = await api.get<OrderStatusLookupDto>('/api/orders/status', {
    params: { orderId, key: orderKey },
  });
  return data;
}

export async function getAdminOrders(status?: OrderStatus): Promise<OrderSummaryDto[]> {
  const params = status ? { status } : {};
  const { data } = await api.get<OrderSummaryDto[]>('/api/orders/admin', { params });
  return data;
}

export async function getAdminOrderById(id: number): Promise<OrderDetailDto> {
  const { data } = await api.get<OrderDetailDto>(`/api/orders/admin/${id}`);
  return data;
}

export async function updateOrderStatus(
  id: number,
  req: UpdateOrderStatusRequest
): Promise<void> {
  await api.put(`/api/orders/admin/${id}/status`, req);
}
