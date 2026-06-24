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

export async function createOrder(
  req: CreateOrderRequest,
  idempotencyKey?: string,
): Promise<CheckoutResponse> {
  // The Idempotency-Key (a per-attempt UUID) lets the backend return the original order
  // instead of creating a duplicate if the same submit is retried after a timeout.
  const { data } = await api.post<CheckoutResponse>(
    '/api/orders',
    req,
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined,
  );
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

export async function deleteAdminOrder(id: number): Promise<void> {
  await api.delete(`/api/orders/admin/${id}`);
}

export async function deleteAllPendingOrders(): Promise<{ deleted: number }> {
  const { data } = await api.delete<{ deleted: number }>("/api/orders/admin/pending");
  return data;
}
