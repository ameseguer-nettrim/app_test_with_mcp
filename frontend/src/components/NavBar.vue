<template>
  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-8">
          <h1 class="text-xl font-bold text-primary-600">{{ $t('common.appName') }}</h1>
          
          <div class="hidden md:flex space-x-4">
            <router-link
              to="/dashboard"
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="isActive('/dashboard') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              {{ $t('nav.dashboard') }}
            </router-link>
            <router-link
              to="/history"
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="isActive('/history') ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              {{ $t('nav.history') }}
            </router-link>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <div v-if="authStore.person" class="hidden md:block text-sm text-gray-700">
            {{ $t('common.welcome') }}, <span class="font-medium">{{ authStore.person.name }}</span>
          </div>
          
          <LanguageSelector />
          
          <button
            @click="handleLogout"
            class="btn btn-secondary text-sm"
          >
            {{ $t('nav.logout') }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LanguageSelector from './LanguageSelector.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isActive = (path: string) => {
  return route.path === path;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>