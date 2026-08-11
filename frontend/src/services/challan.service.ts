import api from './api';
import type { Challan, ChallanFilters, PaginatedResponse } from '../types/challan.types';

export const challanService = {
  async getAll(filters?: ChallanFilters): Promise<PaginatedResponse<Challan>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/challans?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Challan> {
    const response = await api.get(`/challans/${id}`);
    return response.data.data;
  },

  async create(data: { customerId: string; items: { productId: string; quantity: number }[] }): Promise<Challan> {
    const response = await api.post('/challans', data);
    return response.data.data;
  },

  async update(id: string, data: { customerId: string; items: { productId: string; quantity: number }[] }): Promise<Challan> {
    const response = await api.put(`/challans/${id}`, data);
    return response.data.data;
  },

  async confirm(id: string): Promise<Challan> {
    const response = await api.patch(`/challans/${id}/confirm`);
    return response.data.data;
  },

  async cancel(id: string): Promise<Challan> {
    const response = await api.patch(`/challans/${id}/cancel`);
    return response.data.data;
  },

  async markAsPaid(id: string): Promise<Challan> {
    const response = await api.patch(`/challans/${id}/paid`);
    return response.data.data;
  },

  async downloadChallanPDF(id: string): Promise<void> {
    const response = await api.get(`/challans/${id}/pdf`, {
      responseType: 'blob',
    });
    
    // Create blob and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `challan-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async downloadInvoicePDF(id: string): Promise<void> {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    
    // Create blob and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};