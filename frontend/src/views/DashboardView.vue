<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p class="text-gray-600 mt-1">Manage your family expenses</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Environment Selector -->
        <div class="lg:col-span-1">
          <EnvironmentSelector @environment-selected="handleEnvironmentSelected" />

          <div v-if="currentEnvironment" class="card mt-6">
            <EnvironmentInvitation :environment-id="currentEnvironment.id" />
            <h3 class="text-md font-semibold text-gray-800 mb-3">People in this environment</h3>
            <div class="space-y-2">
              <div
                v-for="person in currentEnvironmentPeople"
                :key="person.id"
                class="flex items-center space-x-2 text-gray-700">
                <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd" />
                </svg>
                <span>{{ person.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle Column: Add Expense Form -->
        <div class="lg:col-span-1">
          <AddExpenseForm
            :environment-id="currentEnvironment?.id || null"
            :people="currentEnvironmentPeople"
            @expense-added="loadExpenses" />
        </div>

        <!-- Right Column: Expense List -->
        <div class="lg:col-span-1">
          <ExpenseList
            :expenses="expenses"
            :loading="expenseStore.loading"
            :environment-id="currentEnvironment?.id || null" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import NavBar from '@/components/NavBar.vue';
import EnvironmentSelector from '@/components/EnvironmentSelector.vue';
import AddExpenseForm from '@/components/AddExpenseForm.vue';
import ExpenseList from '@/components/ExpenseList.vue';
import { useEnvironmentStore } from '@/stores/environmentStore';
import { useExpenseStore } from '@/stores/expenseStore';
import EnvironmentInvitation from '@/components/EnvironmentInvitation.vue';

const environmentStore = useEnvironmentStore();
const expenseStore = useExpenseStore();

const currentEnvironment = computed(() => environmentStore.currentEnvironment);
const currentEnvironmentPeople = computed(() => environmentStore.currentEnvironmentPeople);
const expenses = computed(() => expenseStore.expenses);

const loadExpenses = async () => {
  if (currentEnvironment.value) {
    await expenseStore.fetchExpenses(currentEnvironment.value.id);
  }
};

const handleEnvironmentSelected = () => {
  loadExpenses();
};

// Watch for current environment changes
watch(currentEnvironment, (newEnv) => {
  if (newEnv) {
    loadExpenses();
  }
});
</script>
