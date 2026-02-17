import { categoriesService } from '@/services/categoryService';
import { Category } from '@/types';
import { defineStore } from 'pinia';

interface State {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export const useCategoryStore = defineStore('category', {
  state: (): State => ({
    categories: [],
    loading: false,
    error: null,
  }),

  getters: {
    byEnvironment: (state) => (environmentId: number) =>
      state.categories.filter((c) => c.environment_id === environmentId),
  },

  actions: {
    async fetchByEnvironment(environmentId: number) {
      this.loading = true;
      this.error = null;

      try {
        const res = await categoriesService.list(environmentId);
        console.log('Fetched categories:', res.data);
        this.categories = res.data;
      } catch (err: any) {
        this.error = err.message || 'Error loading categories';
        this.categories = [];
      } finally {
        this.loading = false;
      }
    },

    clear() {
      this.categories = [];
    },
  },
});
