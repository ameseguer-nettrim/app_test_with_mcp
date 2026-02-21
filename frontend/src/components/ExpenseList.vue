<template>
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800">{{ $t('expense.currentExpenses') }}</h2>
      <button v-if="expenses.length > 0" @click="handleComputeExpenses" :disabled="computing" class="btn btn-primary">
        {{ computing ? $t('expense.computing') : $t('expense.compute') }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="text-gray-500">{{ $t('expense.loadingExpenses') }}</div>
    </div>

    <div v-else-if="expenses.length === 0" class="text-center py-8">
      <p class="text-gray-500">{{ $t('expense.noExpenses') }}</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="expense in expenses" :key="expense.id"
        class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div class="p-4 flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-baseline justify-between mb-1">
              <span class="text-xl font-bold text-gray-900">€{{ expense.amount }}</span>
              <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {{ formatDate(expense.expense_date) }}
              </span>
            </div>

            <div class="flex justify-between items-center mt-4">
              <div v-if="expense.category" class="flex items-center">
                <div class="flex gap-3" :class="expense.description ? 'items-start' : 'items-center'">
                  <div v-if="expense.category"
                    class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" :style="{
                      backgroundColor: expense.category.color + '15',
                      color: expense.category.color
                    }">
                    <i :class="`fa-solid fa-${expense.category.icon || 'tag'}`" />
                  </div>

                  <div class="flex-1 min-w-0">
                    <div v-if="expense.category" class="text-sm font-medium text-gray-800">
                      {{ expense.category.name }}
                    </div>

                    <p v-if="expense.description" class="text-sm text-gray-500 leading-snug">
                      {{ expense.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="relative ml-4">
            <button @click="handleDeleteExpense(expense.id)" class="text-red-600 hover:text-red-700 ml-4"
              title="Delete expense">
              <i class="fa-regular fa-trash-can" />
            </button>
          </div>
        </div>

        <div
          class="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between text-[10px] sm:text-xs text-gray-500 tracking-tight">
          <span>
            {{ $t('expense.paidBy') }} <b class="text-gray-700">{{ expense.payer_name }}</b>
          </span>
          <span>
            {{ $t('expense.registeredBy') }}: <b class="text-gray-700">{{ expense.registered_by_name }}</b>
          </span>
        </div>
      </div>

      <div class="border-t-2 border-primary-500 pt-4 mt-4">
        <div class="flex justify-between items-center">
          <span class="text-lg font-bold text-gray-800">{{ $t('common.total') }}:</span>
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
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  expenses: Expense[];
  loading: boolean;
  environmentId: number | null;
}>();

const expenseStore = useExpenseStore();
const computing = ref(false);
const { t } = useI18n();

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
  if (!confirm(t('expense.deleteConfirm'))) return;

  try {
    await expenseStore.deleteExpense(id);
  } catch (error) {
    console.error('Failed to delete expense:', error);
    alert(t('expense.deleteFailed'));
  }
};

const handleComputeExpenses = async () => {
  if (!props.environmentId) return;

  if (!confirm(t('expense.computeConfirm'))) return;

  computing.value = true;
  try {
    await expenseStore.computeExpenses(props.environmentId);
    alert(t('expense.computeSuccess'));
  } catch (error) {
    console.error('Failed to compute expenses:', error);
    alert(t('expense.computeFailed'));
  } finally {
    computing.value = false;
  }
};
</script>
