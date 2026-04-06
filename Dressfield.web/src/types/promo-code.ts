export interface PromoCodeDto {
  id: number;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  expiresAtUtc: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoCodeRequest {
  code: string;
  discountPercentage: number;
  isActive: boolean;
  expiresAtUtc: string | null;
}

export interface UpdatePromoCodeRequest {
  code: string;
  discountPercentage: number;
  isActive: boolean;
  expiresAtUtc: string | null;
}

export interface ValidatePromoCodeRequest {
  code: string;
  subtotal: number;
}

export interface PromoCodeValidationResultDto {
  isValid: boolean;
  message: string | null;
  code: string | null;
  discountPercentage: number;
  discountAmount: number;
}
