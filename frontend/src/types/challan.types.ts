export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  paymentStatus?: 'UNPAID' | 'PAID';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    customerName: string;
    businessName: string;
    mobile?: string;
    email?: string;
    address?: string;
  };
  items?: ChallanItem[];
  createdByUser?: {
    name: string;
  };
  _count?: {
    items: number;
  };
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface ChallanFilters {
  page?: number;
  limit?: number;
  status?: Challan['status'] | '';
  paymentStatus?: 'UNPAID' | 'PAID';
  search?: string;
  customerId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}