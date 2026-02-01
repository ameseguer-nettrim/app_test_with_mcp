<template>
  <div class="min-h-screen bg-gray-50 pb-10">
    <NavBar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-1 order-first lg:order-2">
          <AddExpenseForm
            :environment-id="currentEnvironment?.id || null"
            :people="currentEnvironmentPeople"
            @expense-added="loadExpenses" 
          />
        </div>

        <div class="lg:col-span-1 order-2 lg:order-1 space-y-6">
          <EnvironmentSelector @environment-selected="handleEnvironmentSelected" />

          <div v-if="currentEnvironment" class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <EnvironmentInvitation :environment-id="currentEnvironment.id" />
            <div class="mt-4 pt-4 border-t border-gray-50">
              <h3 class="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">En este grupo</h3>
              <div class="flex flex-wrap gap-2">
                <span v-for="p in currentEnvironmentPeople" :key="p.id" 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {{ p.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1 order-3">
          <ExpenseList
            :expenses="expenses"
            :loading="expenseStore.loading"
            :environment-id="currentEnvironment?.id || null" 
          />
        </div>
      </div>
    </main>
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
