<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      :title="$t('common.changeLanguage')"
    >
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span class="text-sm font-medium text-gray-700">{{ currentLanguageLabel }}</span>
      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between"
        :class="{ 'bg-primary-50': currentLocale === lang.code }"
      >
        <span class="text-sm text-gray-700">{{ lang.name }}</span>
        <span v-if="currentLocale === lang.code" class="text-primary-600">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const showDropdown = ref(false);

const languages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
];

const currentLocale = computed(() => locale.value);

const currentLanguageLabel = computed(() => {
  const lang = languages.find(l => l.code === currentLocale.value);
  return lang?.name || 'Español';
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const changeLanguage = (code: string) => {
  locale.value = code;
  localStorage.setItem('locale', code);
  showDropdown.value = false;
};

// Close dropdown when clicking outside
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.relative')) {
      showDropdown.value = false;
    }
  });
}
</script>