<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800">{{ $t('environment.select') }}</h2>
      <button
        @click="showCreateModal = true"
        class="btn btn-primary text-sm"
      >
        {{ $t('environment.newEnvironment') }}
      </button>
    </div>

    <div v-if="environmentStore.loading" class="text-center py-4">
      <div class="text-gray-500">{{ $t('environment.loadingEnvironments') }}</div>
    </div>

    <div v-else-if="environmentStore.environments.length === 0" class="text-center py-8">
      <p class="text-gray-500 mb-4">{{ $t('environment.noEnvironments') }}</p>
    </div>

    <div v-else class="space-y-2">
      <button
        v-for="env in environmentStore.environments"
        :key="env.id"
        @click="selectEnvironment(env.id)"
        class="w-full text-left px-4 py-3 rounded-lg border-2 transition-all"
        :class="isSelected(env.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'"
      >
        <div class="font-medium text-gray-800">{{ env.name }}</div>
        <div v-if="env.description" class="text-sm text-gray-600 mt-1">{{ env.description }}</div>
      </button>
    </div>

    <!-- Create Environment Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-bold text-gray-800 mb-4">{{ $t('environment.createNew') }}</h3>
        
        <form @submit.prevent="handleCreateEnvironment" class="space-y-4">
          <div>
            <label for="envName" class="label">{{ $t('common.name') }}</label>
            <input
              id="envName"
              v-model="newEnvName"
              type="text"
              required
              class="input"
              :placeholder="$t('environment.namePlaceholder')"
            />
          </div>

          <div>
            <label for="envDescription" class="label">{{ $t('environment.descriptionLabel') }}</label>
            <textarea
              id="envDescription"
              v-model="newEnvDescription"
              class="input"
              rows="3"
              :placeholder="$t('environment.descriptionPlaceholder')"
            />
          </div>

          <div v-if="createError" class="text-red-600 text-sm">
            {{ createError }}
          </div>

          <div class="flex space-x-3">
            <button
              type="button"
              @click="closeCreateModal"
              class="btn btn-secondary flex-1"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="btn btn-primary flex-1"
            >
              {{ creating ? $t('environment.creating') : $t('common.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEnvironmentStore } from '@/stores/environmentStore';

const emit = defineEmits(['environment-selected']);

const environmentStore = useEnvironmentStore();
const showCreateModal = ref(false);
const newEnvName = ref('');
const newEnvDescription = ref('');
const creating = ref(false);
const createError = ref('');

const isSelected = (id: number) => {
  return environmentStore.currentEnvironment?.id === id;
};

const selectEnvironment = async (id: number) => {
  await environmentStore.setCurrentEnvironment(id);
  emit('environment-selected');
};

const handleCreateEnvironment = async () => {
  createError.value = '';
  creating.value = true;

  try {
    await environmentStore.createEnvironment({
      name: newEnvName.value,
      description: newEnvDescription.value || undefined,
    });
    closeCreateModal();
  } catch (err: any) {
    createError.value = err.response?.data?.error || 'Failed to create environment';
  } finally {
    creating.value = false;
  }
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  newEnvName.value = '';
  newEnvDescription.value = '';
  createError.value = '';
};

onMounted(async () => {
  await environmentStore.fetchEnvironments();
  environmentStore.restoreCurrentEnvironment();
});
</script>