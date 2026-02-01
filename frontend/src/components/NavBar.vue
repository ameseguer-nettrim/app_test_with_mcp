<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <h1 class="text-lg font-bold text-primary-600 truncate max-w-[200px]">
            {{ $t('common.appName') }}
          </h1>
        </div>

        <div class="hidden md:flex items-center space-x-4">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="isActive(link.path) ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            {{ $t(link.label) }}
          </router-link>
          
          <div class="h-6 w-px bg-gray-200 mx-2"></div>
          
          <LanguageSelector />
          
          <button @click="handleLogout" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors">
            {{ $t('nav.logout') }}
          </button>
        </div>

        <div class="flex md:hidden">
          <button 
            @click="isMenuOpen = !isMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none transition-colors"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMenuOpen" class="md:hidden bg-white border-t border-gray-100 shadow-inner">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            @click="isMenuOpen = false"
            class="block px-3 py-4 rounded-md text-base font-medium transition-colors"
            :class="isActive(link.path) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
          >
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
            <button
              @click="handleLogout"
              class="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 shadow-sm"
            >
              {{ $t('nav.logout') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LanguageSelector from './LanguageSelector.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isMenuOpen = ref(false);

const navLinks = [
  { path: '/dashboard', label: 'nav.dashboard' },
  { path: '/history', label: 'nav.history' }
];

const isActive = (path: string) => route.path === path;

const handleLogout = () => {
  isMenuOpen.value = false;
  authStore.logout();
  router.push('/login');
};
</script>