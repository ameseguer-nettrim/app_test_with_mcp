<template>
  <div class="card">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Add New Expense</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="amount" class="label">Amount (€)</label>
        <input
          id="amount"
          v-model="amount"
          type="number"
          step="1"
          min="0"
          required
          class="input"
          placeholder="0.00" />
      </div>

      <div>
        <label for="description" class="label">Description</label>
        <textarea
          id="description"
          v-model="description"
          required
          class="input"
          rows="2"
          placeholder="What was this expense for?" />
      </div>

      <div>
        <label for="payer" class="label">Paid By</label>
        <select id="payer" v-model="payerId" required class="input">
          <option value="" disabled>Select person</option>
          <option v-for="person in people" :key="person.id" :value="person.id">
            {{ person.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="expenseDate" class="label">Date</label>
        <input id="expenseDate" v-model="expenseDate" type="date" required class="input" />
      </div>

      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <button type="submit" :disabled="loading || !environmentId" class="btn btn-primary w-full">
        {{ loading ? 'Adding...' : 'Add Expense' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useExpenseStore } from '@/stores/expenseStore';
import { Person } from '@/types';

const props = defineProps<{
  environmentId: number | null;
  people: Person[];
}>();

const emit = defineEmits(['expense-added']);

const expenseStore = useExpenseStore();

const amount = ref('');
const payerId = ref<number | ''>('');
const description = ref('');
const expenseDate = ref('');
const loading = ref(false);
const error = ref('');

// Set today's date as default
onMounted(() => {
  const today = new Date().toISOString().split('T')[0];
  expenseDate.value = today;
});

// Reset payer when people change
watch(
  () => props.people,
  () => {
    if (props.people.length > 0 && !payerId.value) {
      payerId.value = props.people[0].id;
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  if (!props.environmentId) {
    error.value = 'Please select an environment first';
    return;
  }

  error.value = '';
  loading.value = true;

  try {
    await expenseStore.createExpense({
      amount: parseFloat(amount.value),
      description: description.value,
      expense_date: expenseDate.value,
      payer_id: payerId.value as number,
      environment_id: props.environmentId,
    });

    // Reset form
    amount.value = '';
    description.value = '';
    const today = new Date().toISOString().split('T')[0];
    expenseDate.value = today;

    emit('expense-added');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to add expense';
  } finally {
    loading.value = false;
  }
};
</script>
