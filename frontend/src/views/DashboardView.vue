<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8"> <NavBar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div class="mb-8 md:mb-10 text-center md:text-left">
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          {{ $t('dashboard.title') }}
        </h1>
        <p class="text-sm md:text-base text-gray-500 mt-2">
          {{ $t('dashboard.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-1 space-y-6">
          <section>
            <EnvironmentSelector @environment-selected="handleEnvironmentSelected" />
          </section>

          <div v-if="currentEnvironment" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <EnvironmentInvitation :environment-id="currentEnvironment.id" />
            
            <div class="mt-6">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {{ $t('dashboard.peopleInEnvironment') }}
              </h3>
              <div class="flex flex-wrap gap-2 md:flex-col md:space-y-2">
                <div
                  v-for="person in currentEnvironmentPeople"
                  :key="person.id"
                  class="flex items-center space-x-2 bg-gray-50 md:bg-transparent px-3 py-1.5 md:px-0 rounded-full text-sm text-gray-700 border border-gray-100 md:border-0"
                >
                  <div class="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <span class="font-medium">{{ person.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1 order-first lg:order-none">
          <div class="sticky top-20"> <AddExpenseForm
              :environment-id="currentEnvironment?.id || null"
              :people="currentEnvironmentPeople"
              @expense-added="loadExpenses" 
            />
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="flex items-center justify-between mb-4 lg:hidden">
             <h2 class="text-lg font-bold text-gray-800 italic">Últimos movimientos</h2>
          </div>
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
