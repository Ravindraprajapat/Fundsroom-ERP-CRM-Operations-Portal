export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
  createdAt: string;
  product?: {
    productName: string;
    sku: string;
  };
  createdByUser?: {
    name: string;
  };
}

export interface StockMovementFilters {
  page?: number;
  limit?: number;
  productId?: string;
  type?: 'IN' | 'OUT';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}