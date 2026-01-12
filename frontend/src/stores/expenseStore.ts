import { defineStore } from 'pinia';
import { ref } from 'vue';
import { expenseService } from '@/services/expenseService';
import { Expense, ComputedExpense, CreateExpenseData } from '@/types';

export const useExpenseStore = defineStore('expense', () => {
  const expenses = ref<Expense[]>([]);
  const computedExpenses = ref<ComputedExpense[]>([]);
  const loading = ref(false);

  async function fetchExpenses(environmentId: number) {
    loading.value = true;
    try {
      const response = await expenseService.getExpenses(environmentId);
      expenses.value = response.expenses;
    } finally {
      loading.value = false;
    }
  }

  async function createExpense(data: CreateExpenseData) {
    const response = await expenseService.createExpense(data);
    await fetchExpenses(data.environment_id);
    return response;
  }

  async function updateExpense(id: number, data: Partial<CreateExpenseData>) {
    await expenseService.updateExpense(id, data);
    // Refresh expenses for the current environment
    if (expenses.value.length > 0) {
      await fetchExpenses(expenses.value[0].environment_id);
    }
  }

  async function deleteExpense(id: number) {
    const expense = expenses.value.find(e => e.id === id);
    await expenseService.deleteExpense(id);
    if (expense) {
      await fetchExpenses(expense.environment_id);
    }
  }

  async function computeExpenses(environmentId: number) {
    const blob = await expenseService.computeExpenses(environmentId);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `expenses_${environmentId}_${timestamp}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Refresh expenses list
    await fetchExpenses(environmentId);
  }

  async function fetchComputedExpenses(environmentId: number) {
    loading.value = true;
    try {
      const response = await expenseService.getComputedExpenses(environmentId);
      computedExpenses.value = response.computed_expenses;
    } finally {
      loading.value = false;
    }
  }

  return {
    expenses,
    computedExpenses,
    loading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    computeExpenses,
    fetchComputedExpenses,
  };
});