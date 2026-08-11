import api from './api';
import type { StockMovement, StockMovementFilters, PaginatedResponse } from '../types/stock.types';

export const stockService = {
  async getMovements(filters?: StockMovementFilters): Promise<PaginatedResponse<StockMovement>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.type) params.append('type', filters.type);

    const response = await api.get(`/stock/movements?${params.toString()}`);
    return response.data;
  },

  async stockIn(productId: string, quantity: number, reason: string): Promise<any> {
    const response = await api.post('/stock/in', { productId, quantity, reason, type: 'IN' });
    return response.data;
  },

  async stockOut(productId: string, quantity: number, reason: string): Promise<any> {
    const response = await api.post('/stock/out', { productId, quantity, reason, type: 'OUT' });
    return response.data;
  },
};