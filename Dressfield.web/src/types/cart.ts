export interface ServerCartItemDto {
  productId: number;
  variantId: number | null;
  productName: string;
  variantLabel: string | null;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export interface ServerCartDto {
  items: ServerCartItemDto[];
}

export interface SyncCartItemRequest {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface SyncCartRequest {
  items: SyncCartItemRequest[];
}
