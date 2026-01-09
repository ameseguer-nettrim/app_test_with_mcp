import { defineStore } from 'pinia';
import { ref } from 'vue';
import { environmentService } from '@/services/environmentService';
import { Environment, Person, CreateEnvironmentData } from '@/types';

export const useEnvironmentStore = defineStore('environment', () => {
  const environments = ref<Environment[]>([]);
  const currentEnvironment = ref<Environment | null>(null);
  const currentEnvironmentPeople = ref<Person[]>([]);
  const loading = ref(false);

  async function fetchEnvironments() {
    loading.value = true;
    try {
      const response = await environmentService.getEnvironments();
      environments.value = response.environments;
      
      // Set first environment as current if none selected
      if (!currentEnvironment.value && environments.value.length > 0) {
        await setCurrentEnvironment(environments.value[0].id);
      }
    } finally {
      loading.value = false;
    }
  }

  async function createEnvironment(data: CreateEnvironmentData) {
    const response = await environmentService.createEnvironment(data);
    await fetchEnvironments();
    return response;
  }

  async function setCurrentEnvironment(id: number) {
    loading.value = true;
    try {
      const response = await environmentService.getEnvironmentDetails(id);
      currentEnvironment.value = response.environment;
      currentEnvironmentPeople.value = response.people;
      
      // Store in localStorage for persistence
      localStorage.setItem('currentEnvironmentId', id.toString());
    } finally {
      loading.value = false;
    }
  }

  function restoreCurrentEnvironment() {
    const storedId = localStorage.getItem('currentEnvironmentId');
    if (storedId && environments.value.length > 0) {
      const env = environments.value.find(e => e.id === parseInt(storedId));
      if (env) {
        setCurrentEnvironment(env.id);
      }
    }
  }

  return {
    environments,
    currentEnvironment,
    currentEnvironmentPeople,
    loading,
    fetchEnvironments,
    createEnvironment,
    setCurrentEnvironment,
    restoreCurrentEnvironment,
  };
});