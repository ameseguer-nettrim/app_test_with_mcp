<template>
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800">Current Expenses</h2>
      <button
        v-if="expenses.length > 0"
        @click="handleComputeExpenses"
        :disabled="computing"
        class="btn btn-primary"
      >
        {{ computing ? 'Computing...' : 'Compute & Export to Excel' }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="text-gray-500">Loading expenses...</div>
    </div>

    <div v-else-if="expenses.length === 0" class="text-center py-8">
      <p class="text-gray-500">No expenses yet. Add your first expense above!</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="expense in expenses"
        :key="expense.id"
        class="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-1">
              <span class="text-lg font-semibold text-gray-800">€{{ parseFloat(expense.amount).toFixed(2) }}</span>
              <span class="text-sm text-gray-500">{{ formatDate(expense.expense_date) }}</span>
            </div>
            <p class="text-gray-700">{{ expense.description }}</p>
            <div class="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>Paid by: <span class="font-medium">{{ expense.payer_name }}</span></span>
              <span>•</span>
              <span>Registered by: <span class="font-medium">{{ expense.registered_by_name }}</span></span>
            </div>
          </div>
          <button
            @click="handleDeleteExpense(expense.id)"
            class="text-red-600 hover:text-red-700 ml-4"
            title="Delete expense"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div class="border-t-2 border-primary-500 pt-4 mt-4">
        <div class="flex justify-between items-center">
          <span class="text-lg font-bold text-gray-800">Total:</span>
          <span class="text-2xl font-bold text-primary-600">€{{ calculateTotal() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useExpenseStore } from '@/stores/expenseStore';
import { Expense } from '@/types';

const props = defineProps<{
  expenses: Expense[];
  loading: boolean;
  environmentId: number | null;
}>();

const expenseStore = useExpenseStore();
const computing = ref(false);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const calculateTotal = () => {
  const total = props.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);
  return total.toFixed(2);
};

const handleDeleteExpense = async (id: number) => {
  if (!confirm('Are you sure you want to delete this expense?')) return;

  try {
    await expenseStore.deleteExpense(id);
  } catch (error) {
    console.error('Failed to delete expense:', error);
    alert('Failed to delete expense. Please try again.');
  }
};

const handleComputeExpenses = async () => {
  if (!props.environmentId) return;

  if (!confirm('This will generate an Excel file and archive all current expenses. Continue?')) return;

  computing.value = true;
  try {
    await expenseStore.computeExpenses(props.environmentId);
    alert('Expenses computed successfully! Check your downloads folder.');
  } catch (error) {
    console.error('Failed to compute expenses:', error);
    alert('Failed to compute expenses. Please try again.');
  } finally {
    computing.value = false;
  }
};
</script>