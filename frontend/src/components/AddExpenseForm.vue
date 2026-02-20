<template>
  <div class="card">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('expense.addNew') }}</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="amount" class="label">{{ $t('common.amount') }} (€)</label>
        <input id="amount" v-model="amount" type="number" step="0.01" required class="input"
          :placeholder="$t('expense.amountPlaceholder')" />
      </div>

      <div>
        <label for="payer" class="label">{{ $t('expense.paidBy') }}</label>
        <select id="payer" v-model="payerId" required class="input">
          <option value="" disabled>{{ $t('expense.selectPerson') }}</option>
          <option v-for="person in people" :key="person.id" :value="person.id">
            {{ person.name }}
          </option>
        </select>
      </div>

      <!-- CATEGORY SELECT (custom styled) -->
      <div>
        <label class="label">{{ $t('expense.category') }}</label>

        <!-- selected button -->
        <div class="relative">
          <button type="button" class="input w-full flex items-center justify-between" @click="toggleOpen"
            :aria-expanded="open" aria-haspopup="listbox">
            <div class="flex items-center gap-3">
              <template v-if="selectedCategory">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs"
                  :style="{ backgroundColor: selectedCategory.color || '#9CA3AF' }">
                  <i v-if="selectedCategory.icon" :class="`fa-solid fa-${selectedCategory.icon}`"
                    class="text-white text-xs" />
                  <span v-else class="text-xs">{{ selectedCategory.name?.[0] }}</span>
                </span>
                <span>{{ selectedCategory.name }}</span>
              </template>
              <template v-else>
                <span class="text-gray-500">{{ $t('expense.selectCategory') }}</span>
              </template>
            </div>

            <i class="fa-solid fa-chevron-down" />
          </button>

          <!-- dropdown list -->
          <ul v-if="open" class="absolute z-40 mt-1 w-full bg-white border rounded shadow max-h-56 overflow-auto"
            role="listbox" @keydown.escape="close">
            <li v-for="cat in categoriesWithOthers" :key="cat._optionKey"
              class="cursor-pointer px-3 py-2 hover:bg-gray-50 flex items-center gap-3"
              :aria-selected="cat._optionKey === selectedCategoryKey" @click="selectCategory(cat)">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs shrink-0"
                :style="{ backgroundColor: cat.color || '#9CA3AF' }">
                <i v-if="cat.icon" :class="`fa-solid fa-${cat.icon}`" class="text-white text-xs" />
                <span v-else class="text-xs">{{ cat.name?.[0] }}</span>
              </span>

              <div class="flex-1">
                <div class="text-sm">{{ cat.name }}</div>
              </div>

              <template v-if="cat._optionKey === selectedCategoryKey">
                <i class="fa-solid fa-circle-check text-green-500" />
              </template>
            </li>
          </ul>
        </div>
      </div>

      <!-- description: only required when "Others" is selected -->
      <div>
        <label for="description" class="label">{{ $t('common.description') }}</label>
        <textarea id="description" v-model="description" :required="isOthersSelected" class="input" rows="2"
          :placeholder="$t('expense.descriptionPlaceholder')" />
      </div>

      <div>
        <label for="expenseDate" class="label">{{ $t('common.date') }}</label>
        <input id="expenseDate" v-model="expenseDate" type="date" required class="input" />
      </div>

      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <button type="submit" :disabled="loading || !environmentId" class="btn btn-primary w-full">
        {{ loading ? $t('expense.adding') : $t('expense.add') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useExpenseStore } from '@/stores/expenseStore';
import i18n from '@/i18n';
import { useCategoryStore } from '@/stores/categoriesStore';
import { Person } from '@/types';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps<{
  environmentId: number | null;
  people: Person[];
}>();

const categoryStore = useCategoryStore();

const emit = defineEmits(['expense-added']);

const expenseStore = useExpenseStore();

const amount = ref('');
const payerId = ref<number | ''>('');
const description = ref('');
const expenseDate = ref('');
const loading = ref(false);
const error = ref('');

// category related
const categories = computed(() => categoryStore.categories);
const open = ref(false);
const selectedCategoryKey = ref<number | string | null>(null); // number for category id, 'others' for others
const OTHER_KEY = 'others';


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

watch(
  () => props.environmentId,
  async (envId) => {
    selectedCategoryKey.value = null;

    if (!envId) return;

    await categoryStore.fetchByEnvironment(envId);
  },
  { immediate: true },
);

const categoriesWithOthers = computed(() => {
  // map to include an internal option key for the template
  const mapped = categories.value.map(c => ({ ...c, _optionKey: c.id as number | string }));
  mapped.push({
    _optionKey: OTHER_KEY,
    id: null,
    name: i18n.global.t('expense.others'),
    icon: null,
    color: '#6B7280',
  } as any);
  return mapped;
});

const selectedCategory = computed(() => {
  if (selectedCategoryKey.value === OTHER_KEY) {
    return categoriesWithOthers.value.find(c => c._optionKey === OTHER_KEY);
  }
  return categories.value.find(c => c.id === selectedCategoryKey.value) || null;
});

const isOthersSelected = computed(() => selectedCategoryKey.value === OTHER_KEY);

// dropdown helpers
function toggleOpen() { open.value = !open.value; }
function close() { open.value = false; }

function selectCategory(cat: any) {
  selectedCategoryKey.value = cat._optionKey;
  open.value = false;
}

const handleSubmit = async () => {
  if (!props.environmentId) {
    error.value = 'Please select an environment first';
    return;
  }

  // If Others selected, description is required
  if (isOthersSelected.value && !description.value.trim()) {
    error.value = 'Please enter a description for "Otros"';
    return;
  }

  if (!selectedCategoryKey.value) {
    error.value = 'Please select a category';
    return;
  }

  error.value = '';
  loading.value = true;

  try {
    // build payload
    const payload: any = {
      amount: parseFloat(amount.value),
      description: description.value ?? '',
      expense_date: expenseDate.value,
      payer_id: payerId.value as number,
      environment_id: props.environmentId,
      category_id: selectedCategoryKey.value === OTHER_KEY ? null : (selectedCategoryKey.value as number),
      registered_by_id: useAuthStore().person!.id,
    };

    await expenseStore.createExpense(payload);

    // Reset form
    amount.value = '';
    description.value = '';
    selectedCategoryKey.value = null;
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
