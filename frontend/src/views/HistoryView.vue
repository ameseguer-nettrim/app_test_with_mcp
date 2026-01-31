<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">{{ $t('history.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('history.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Environment Selector -->
        <div class="lg:col-span-1">
          <EnvironmentSelector @environment-selected="handleEnvironmentSelected" />
        </div>

        <!-- Computed Expenses List -->
        <div class="lg:col-span-3">
          <div class="card">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('history.computedExpenses') }}</h2>

            <div v-if="loading" class="text-center py-8">
              <div class="text-gray-500">{{ $t('history.loadingHistory') }}</div>
            </div>

            <div v-else-if="computedExpenses.length === 0" class="text-center py-8">
              <p class="text-gray-500">{{ $t('history.noComputedExpenses') }}</p>
            </div>

            <div v-else class="space-y-4">
              <!-- Group by computed date -->
              <div
                v-for="(group, date) in groupedExpenses"
                :key="date"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                  <h3 class="text-md font-semibold text-gray-700">{{ $t('history.computedOn') }} {{ formatComputedDate(date) }}</h3>
                  <span class="text-sm text-gray-600">{{ $t('history.expensesCount', { count: group.length }) }}</span>
                </div>

                <div class="space-y-3">
                  <div
                    v-for="expense in group"
                    :key="expense.id"
                    class="bg-gray-50 rounded-lg p-3"
                  >
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-1">
                          <span class="text-lg font-semibold text-gray-800">{{`€${expense.amount.toFixed(2)}`}}</span>
                          <span class="text-sm text-gray-500">{{ formatDate(expense.expense_date) }}</span>
                        </div>
                        <p class="text-gray-700">{{ expense.description }}</p>
                        <div class="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>{{ $t('expense.paidBy') }}: <span class="font-medium">{{ expense.payer_name }}</span></span>
                          <span>•</span>
                          <span>{{ $t('expense.registeredBy') }}: <span class="font-medium">{{ expense.registered_by_name }}</span></span>
                          <span>•</span>
                          <span>{{ $t('expense.computedBy') }}: <span class="font-medium">{{ expense.computed_by_name }}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-3 pt-3 border-t border-gray-200">
                  <div class="flex justify-between items-center">
                    <span class="text-md font-semibold text-gray-700">{{ $t('common.subtotal') }}:</span>
                    <span class="text-xl font-bold text-primary-600">€{{ calculateGroupTotal(group) }}</span>
                  </div>
                </div>
              </div>

              <!-- Grand Total -->
              <div class="border-t-2 border-primary-500 pt-4">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-bold text-gray-800">{{ $t('common.grandTotal') }}:</span>
                  <span class="text-2xl font-bold text-primary-600">€{{ calculateGrandTotal() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import NavBar from '@/components/NavBar.vue';
import EnvironmentSelector from '@/components/EnvironmentSelector.vue';
import { useEnvironmentStore } from '@/stores/environmentStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { ComputedExpense } from '@/types';

const environmentStore = useEnvironmentStore();
const expenseStore = useExpenseStore();

const currentEnvironment = computed(() => environmentStore.currentEnvironment);
const computedExpenses = computed(() => expenseStore.computedExpenses);
const loading = computed(() => expenseStore.loading);

// Group expenses by computed date
const groupedExpenses = computed(() => {
  const groups: Record<string, ComputedExpense[]> = {};
  
  computedExpenses.value.forEach(expense => {
    const date = expense.computed_at.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
  });
  
  return groups;
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatComputedDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const calculateGroupTotal = (group: ComputedExpense[]) => {
  const total = group.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);
  return total.toFixed(2);
};

const calculateGrandTotal = () => {
  const total = computedExpenses.value.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);
  return total.toFixed(2);
};

const loadComputedExpenses = async () => {
  if (currentEnvironment.value) {
    await expenseStore.fetchComputedExpenses(currentEnvironment.value.id);
  }
};

const handleEnvironmentSelected = () => {
  loadComputedExpenses();
};

// Watch for current environment changes
watch(currentEnvironment, (newEnv) => {
  if (newEnv) {
    loadComputedExpenses();
  }
});
</script>