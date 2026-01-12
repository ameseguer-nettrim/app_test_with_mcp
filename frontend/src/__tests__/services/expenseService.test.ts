import { describe, it, expect, vi } from 'vitest';
import { expenseService } from '../../services/expenseService';
import api from '../../services/api';

vi.mock('../../services/api');

describe('ExpenseService', () => {
  describe('getExpenses', () => {
    it('should fetch expenses for an environment', async () => {
      const mockExpenses = [
        { id: 1, amount: 50.0, description: 'Groceries' },
        { id: 2, amount: 75.5, description: 'Utilities' },
      ];

      (api.get as any).mockResolvedValue({ data: { expenses: mockExpenses } });

      const result = await expenseService.getExpenses(1);

      expect(api.get).toHaveBeenCalledWith('/expenses?environment_id=1');
      expect(result.expenses).toEqual(mockExpenses);
    });
  });

  describe('createExpense', () => {
    it('should create a new expense', async () => {
      const newExpense = {
        amount: 50.0,
        description: 'Groceries',
        expense_date: '2024-01-10',
        payer_id: 1,
        environment_id: 1,
      };

      (api.post as any).mockResolvedValue({ data: { expense: { id: 1 } } });

      const result = await expenseService.createExpense(newExpense);

      expect(api.post).toHaveBeenCalledWith('/expenses', newExpense);
      expect(result.expense.id).toBe(1);
    });
  });

  describe('updateExpense', () => {
    it('should update an existing expense', async () => {
      const updates = {
        amount: 60.0,
        description: 'Updated groceries',
      };

      (api.put as any).mockResolvedValue({ data: {} });

      await expenseService.updateExpense(1, updates);

      expect(api.put).toHaveBeenCalledWith('/expenses/1', updates);
    });
  });

  describe('deleteExpense', () => {
    it('should delete an expense', async () => {
      (api.delete as any).mockResolvedValue({ data: {} });

      await expenseService.deleteExpense(1);

      expect(api.delete).toHaveBeenCalledWith('/expenses/1');
    });
  });

  describe('computeExpenses', () => {
    it('should compute expenses and return blob', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      (api.post as any).mockResolvedValue({ data: mockBlob });

      const result = await expenseService.computeExpenses(1);

      expect(api.post).toHaveBeenCalledWith(
        '/expenses/compute',
        { environment_id: 1 },
        { responseType: 'blob' }
      );
      expect(result).toEqual(mockBlob);
    });
  });

  describe('getComputedExpenses', () => {
    it('should fetch computed expenses for an environment', async () => {
      const mockComputedExpenses = [
        { id: 1, amount: 50.0, description: 'Groceries', computed_at: '2024-01-15' },
      ];

      (api.get as any).mockResolvedValue({ data: { computed_expenses: mockComputedExpenses } });

      const result = await expenseService.getComputedExpenses(1);

      expect(api.get).toHaveBeenCalledWith('/expenses/computed?environment_id=1');
      expect(result.computed_expenses).toEqual(mockComputedExpenses);
    });
  });
});