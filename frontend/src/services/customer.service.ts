import api from './api';
import type { Customer, CustomerFilters, FollowUp, PaginatedResponse } from '../types/customer.types';

export const customerService = {
  async getAll(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customerType) params.append('customerType', filters.customerType);

    const response = await api.get(`/customers?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Customer> {
    const response = await api.get(`/customers/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Customer>): Promise<Customer> {
    const response = await api.post('/customers', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const response = await api.put(`/customers/${id}`, data);
    return response.data.data;
  },

  async addFollowUp(customerId: string, note: string, followUpDate: string): Promise<FollowUp> {
    const response = await api.post(`/customers/${customerId}/followups`, { note, followUpDate });
    return response.data.data;
  },

  async getFollowUps(customerId: string): Promise<FollowUp[]> {
    const response = await api.get(`/customers/${customerId}/followups`);
    return response.data.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },
};