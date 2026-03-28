import api from "@/lib/api";
import type {
  CreateCustomOrderRequest,
  CustomOrderDetailDto,
  CustomOrderStatus,
  CustomOrderSummaryDto,
} from "@/types/custom-order";

export const PLACEMENT_OPTIONS = [
  { value: "chest", label: "გულმკერდი" },
  { value: "back", label: "ზურგი" },
  { value: "sleeve", label: "სახელო" },
  { value: "full-front", label: "სრული წინა" },
] as const;

export const SIZE_OPTIONS = [
  { value: "S", label: "S", priceAdj: 0 },
  { value: "M", label: "M", priceAdj: 0 },
  { value: "L", label: "L", priceAdj: 5 },
  { value: "XL", label: "XL", priceAdj: 10 },
] as const;

export const THREAD_COLOR_OPTIONS = [
  { value: "#7C3AED", label: "იისფერი" },
  { value: "#DC2626", label: "წითელი" },
  { value: "#16A34A", label: "მწვანე" },
  { value: "#2563EB", label: "ლურჯი" },
  { value: "#F59E0B", label: "ოქროსფერი" },
  { value: "#000000", label: "შავი" },
  { value: "#FFFFFF", label: "თეთრი" },
] as const;

export const BASE_CUSTOM_PRICE = 45;

export function getPlacementLabel(value: string | null | undefined) {
  return PLACEMENT_OPTIONS.find((option) => option.value === value)?.label || "არ არის არჩეული";
}

export function getSizeLabel(value: string | null | undefined) {
  return SIZE_OPTIONS.find((option) => option.value === value)?.label || "არ არის არჩეული";
}

export function getThreadColorLabel(value: string | null | undefined) {
  return THREAD_COLOR_OPTIONS.find((option) => option.value === value)?.label || "არ არის არჩეული";
}

export function getSizePriceAdjustment(size: string | null | undefined) {
  return SIZE_OPTIONS.find((option) => option.value === size)?.priceAdj ?? 0;
}

export async function submitCustomOrder(
  payload: CreateCustomOrderRequest
): Promise<CustomOrderDetailDto> {
  const { data } = await api.post<CustomOrderDetailDto>("/api/custom-orders", payload);
  return data;
}

export async function getAdminCustomOrders(
  status?: CustomOrderStatus
): Promise<CustomOrderSummaryDto[]> {
  const { data } = await api.get<CustomOrderSummaryDto[]>("/api/custom-orders/admin", {
    params: status !== undefined ? { status } : {},
  });
  return data;
}

export async function getAdminCustomOrderById(
  id: number
): Promise<CustomOrderDetailDto> {
  const { data } = await api.get<CustomOrderDetailDto>(`/api/custom-orders/admin/${id}`);
  return data;
}

export async function updateCustomOrderStatus(
  id: number,
  status: CustomOrderStatus,
  adminNotes: string | null
): Promise<void> {
  await api.put(`/api/custom-orders/admin/${id}/status`, { status, adminNotes });
}
