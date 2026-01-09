import api from './api';
import { Expense, ComputedExpense, CreateExpenseData } from '@/types';

export const expenseService = {
  async getExpenses(environmentId: number): Promise<{ expenses: Expense[] }> {
    const response = await api.get<{ expenses: Expense[] }>(`/expenses?environment_id=${environmentId}`);
    return response.data;
  },

  async createExpense(data: CreateExpenseData): Promise<{ expense: { id: number } }> {
    const response = await api.post<{ expense: { id: number } }>('/expenses', data);
    return response.data;
  },

  async updateExpense(id: number, data: Partial<CreateExpenseData>): Promise<void> {
    await api.put(`/expenses/${id}`, data);
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },

  async computeExpenses(environmentId: number): Promise<Blob> {
    const response = await api.post(
      '/expenses/compute',
      { environment_id: environmentId },
      { responseType: 'blob' }
    );
    return response.data;
  },

  async getComputedExpenses(environmentId: number): Promise<{ computed_expenses: ComputedExpense[] }> {
    const response = await api.get<{ computed_expenses: ComputedExpense[] }>(
      `/expenses/computed?environment_id=${environmentId}`
    );
    return response.data;
  },
};