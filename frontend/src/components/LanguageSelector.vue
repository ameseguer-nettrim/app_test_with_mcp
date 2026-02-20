<template>
  <div class="relative">
    <button @click="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      :title="$t('common.changeLanguage')">
      <i class="fa-solid fa-language" />
      <span class="text-sm font-medium text-gray-700">{{ currentLanguageLabel }}</span>
      <i class="fa-solid fa-chevron-down"></i>
    </button>

    <div v-if="showDropdown"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <button v-for="lang in languages" :key="lang.code" @click="changeLanguage(lang.code)"
        class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between"
        :class="{ 'bg-primary-50': currentLocale === lang.code }">
        <span class="text-sm text-gray-700">{{ lang.name }}</span>
        <span v-if="currentLocale === lang.code" class="text-primary-600">
          <i class="fa-solid fa-circle-check text-green-500" />
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