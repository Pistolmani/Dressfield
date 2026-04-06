import api from '@/lib/api';
import type {
  CreatePromoCodeRequest,
  PromoCodeDto,
  PromoCodeValidationResultDto,
  UpdatePromoCodeRequest,
  ValidatePromoCodeRequest,
} from '@/types/promo-code';

export async function validatePromoCode(
  payload: ValidatePromoCodeRequest
): Promise<PromoCodeValidationResultDto> {
  const { data } = await api.post<PromoCodeValidationResultDto>('/api/promo-codes/validate', payload);
  return data;
}

export async function getAdminPromoCodes(): Promise<PromoCodeDto[]> {
  const { data } = await api.get<PromoCodeDto[]>('/api/promo-codes/admin');
  return data;
}

export async function createPromoCode(payload: CreatePromoCodeRequest): Promise<PromoCodeDto> {
  const { data } = await api.post<PromoCodeDto>('/api/promo-codes/admin', payload);
  return data;
}

export async function updatePromoCode(
  id: number,
  payload: UpdatePromoCodeRequest
): Promise<PromoCodeDto> {
  const { data } = await api.put<PromoCodeDto>(`/api/promo-codes/admin/${id}`, payload);
  return data;
}

export async function deletePromoCode(id: number): Promise<void> {
  await api.delete(`/api/promo-codes/admin/${id}`);
}
