<template>
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800">Current Expenses</h2>
      <button
        v-if="expenses.length > 0"
        @click="handleComputeExpenses"
        :disabled="computing"
        class="btn btn-primary">
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
        class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div class="p-4 flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-baseline justify-between mb-1">
              <span class="text-xl font-bold text-gray-900">€{{ expense.amount }}</span>
              <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">{{
                formatDate(expense.expense_date)
              }}</span>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">{{ expense.description }}</p>
          </div>

          <div class="relative ml-4">
            <button
              @click="handleDeleteExpense(expense.id)"
              class="text-red-600 hover:text-red-700 ml-4"
              title="Delete expense">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div
          class="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between text-[10px] sm:text-xs text-gray-500 tracking-tight">
          <span>
            Paid by: <b class="text-gray-700">{{ expense.payer_name }}</b>
          </span>
          <span>
            Registered by: <b class="text-gray-700">{{ expense.registered_by_name }}</b>
          </span>
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
import { ref } from 'vue';
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
  const total = props.expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount.toString()),
    0,
  );
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

  if (!confirm('This will generate an Excel file and archive all current expenses. Continue?'))
    return;

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
