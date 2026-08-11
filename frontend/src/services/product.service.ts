import api from './api';
import type { Product, ProductFilters, PaginatedResponse } from '../types/product.types';

export const productService = {
  async getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.lowStock) params.append('lowStock', 'true');

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    const resData = response.data;
    return resData?.data || resData;
  },

  async create(data: Partial<Product> & { imageFile?: File | null }): Promise<Product> {
    let response;
    if (data.imageFile) {
      const formData = new FormData();
      formData.append('productName', data.productName || '');
      formData.append('sku', data.sku || '');
      formData.append('category', data.category || 'General');
      formData.append('unitPrice', String(data.unitPrice ?? 0));
      formData.append('currentStock', String(data.currentStock ?? 0));
      formData.append('minimumStock', String(data.minimumStock ?? 0));
      formData.append('warehouseLocation', data.warehouseLocation || '');
      formData.append('image', data.imageFile);

      response = await api.post('/products', formData);
    } else {
      const { imageFile, ...jsonData } = data;
      response = await api.post('/products', jsonData);
    }

    const resData = response.data;
    const result = resData?.data || resData;
    return result?.data || result;
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    const resData = response.data;
    return resData?.data || resData;
  },

  async uploadImage(id: string, file: File): Promise<{ imageUrl: string; product: Product } & { presignedUrl?: string }> {
    const cleanId = (typeof id === 'string' && id !== 'undefined' && id !== 'null') ? id.trim() : '';
    if (!cleanId) {
      console.warn('uploadImage: skipped upload due to invalid/missing Product ID');
      return { imageUrl: '', product: {} as Product };
    }
    console.log('Uploading product image', { productId: cleanId, fileName: file?.name, fileType: file?.type, fileSize: file?.size });

    if (!file) {
      throw new Error('No file provided to uploadImage');
    }

    if (!(file instanceof File)) {
      console.warn('uploadImage: provided value is not an instance of File', file);
    }

    const formData = new FormData();
    // Important: append the actual File object, not file.name or a string
    formData.append('image', file as unknown as Blob);

    // Verify FormData entries for debugging
    for (const [key, value] of formData.entries()) {
      console.log('FormData entry:', key, value);
    }

    const response = await api.post(`/products/${id}/image`, formData);
    console.log('UPLOAD IMAGE RESPONSE:', response);

    // attempt to extract returned key and presigned URL from multiple possible shapes
    const data = response?.data;
    let key: string | undefined;
    let presignedUrl: string | undefined;

    if (data) {
      if (typeof data === 'string') {
        presignedUrl = data;
      } else {
        key = data.imageUrl || data.key || data.filename || data.fileName || data.data?.imageUrl || data.data?.key;
        presignedUrl = data.presignedUrl || data.url || data.data?.presignedUrl || data.data?.url;
      }
    }

    return { imageUrl: key ?? '', product: data?.product, ...(presignedUrl ? { presignedUrl } : {}) } as any;
  },

  async getImageUrl(filename: string): Promise<string> {
    const response = await api.get(`/products/images`, { params: { filename } });
    console.log('GET IMAGE RESPONSE:', response);

    const data = response?.data;
    let presignedUrl: string | undefined;

    if (data) {
      if (typeof data === 'string') presignedUrl = data;
      else presignedUrl = data.presignedUrl || data.url || data.data?.presignedUrl || data.data?.url || data.data;
    }

    console.log('PRESIGNED URL:', presignedUrl);

    if (!presignedUrl) throw new Error('Presigned URL not found in getImageUrl response');
    return presignedUrl;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};