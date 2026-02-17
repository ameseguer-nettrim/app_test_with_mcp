import { AxiosResponse } from 'axios';
import api from './api';
import { Category } from '@/types';

export interface CreateCategoryPayload {
  name: string;
  color?: string | null;
}

export interface UpdateCategoryPayload {
  name: string;
  color?: string | null;
}

export const categoriesService = {
  list(environmentId: number): Promise<AxiosResponse<Category[]>> {
    return api.get(`/environments/${environmentId}/categories`);
  },

  create(environmentId: number, payload: CreateCategoryPayload): Promise<AxiosResponse<Category>> {
    return api.post(`/environments/${environmentId}/categories`, payload);
  },

  update(categoryId: number, payload: UpdateCategoryPayload): Promise<AxiosResponse<Category>> {
    return api.put(`/categories/${categoryId}`, payload);
  },

  remove(categoryId: number): Promise<AxiosResponse<void>> {
    return api.delete(`/categories/${categoryId}`);
  },
};
