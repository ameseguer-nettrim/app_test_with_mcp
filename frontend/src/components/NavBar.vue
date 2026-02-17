<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center min-w-0">
          <div class="flex-shrink-0 bg-primary-100 p-2 rounded-lg mr-3">
            <svg class="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <path
                d="M19 5c-1.5 0-2.8 1.4-3 3-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-2c2-1.5 2-2.7 2-4.5 0-3.4-1.2-4-1.2-4 .7-1.2.4-3-1-4.2l.2-.8z" />
            </svg>
          </div>

          <div class="flex flex-col min-w-0">
            <h1 class="text-base md:text-lg font-bold text-gray-900 leading-tight truncate">
              {{ $t('dashboard.title') }}
            </h1>
            <p class="text-[10px] md:text-xs text-gray-500 truncate leading-tight">
              {{ $t('dashboard.subtitle') }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <div class="hidden md:flex items-center space-x-4 mr-4">
            <router-link v-for="link in navLinks" :key="link.path" :to="link.path"
              class="text-sm font-medium text-gray-600 hover:text-primary-600"
              :class="{ 'text-primary-600': isActive(link.path) }">
              {{ $t(link.label) }}
            </router-link>
          </div>

          <button @click="isMenuOpen = !isMenuOpen" class="md:hidden p-2 rounded-md text-gray-400">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMenuOpen" d="M4 6h16M4 12h16m-7 6h7" stroke-width="2" stroke-linecap="round" />
              <path v-else d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="isMenuOpen" class="md:hidden bg-white border-t border-gray-100 shadow-inner">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <router-link v-for="link in navLinks" :key="link.path" :to="link.path" @click="isMenuOpen = false"
            class="block px-3 py-4 rounded-md text-base font-medium transition-colors"
            :class="isActive(link.path) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'">
            {{ $t(link.label) }}
          </router-link>
        </div>

        <div class="pt-4 pb-3 border-t border-gray-100 bg-gray-50/50 px-5">
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span v-if="authStore.person" class="text-sm font-medium text-gray-800">{{ authStore.person.name }}</span>
              <span class="text-xs text-gray-500">{{ $t('common.welcome') }}</span>
            </div>
            <LanguageSelector />
          </div>
          <div class="mt-4">
            <button @click="handleLogout"
              class="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 shadow-sm">
              {{ $t('nav.logout') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LanguageSelector from './LanguageSelector.vue';
import { useEnvironmentStore } from '@/stores/environmentStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isMenuOpen = ref(false);

const currentEnvironmentId = computed(() => useEnvironmentStore().currentEnvironment?.id || null);


const navLinks = [
  { path: '/dashboard', label: 'nav.dashboard' },
  { path: `/environments/${currentEnvironmentId.value}/categories`, label: 'categories.nav' },
  { path: '/history', label: 'nav.history' }
];

const isActive = (path: string) => route.path === path;

const handleLogout = () => {
  isMenuOpen.value = false;
  authStore.logout();
  router.push('/login');
};
</script>