<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-600 mb-2">{{ $t('auth.register.title') }}</h1>
        <p class="text-gray-600">{{ $t('auth.register.subtitle') }}</p>
      </div>

      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-600 mb-2">Create Account</h1>
        <p class="text-gray-600">Start tracking your family expenses</p>

        <div
          v-if="infoMessage"
          class="mt-4 p-3 bg-primary-50 border border-primary-200 text-primary-700 text-sm rounded-lg">
          {{ infoMessage }}
        </div>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="name" class="label">{{ $t('common.name') }}</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="input"
            :placeholder="$t('auth.register.namePlaceholder')"
          />
        </div>

        <div>
          <label for="email" class="label">{{ $t('common.email') }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="input"
            :placeholder="$t('auth.login.emailPlaceholder')"
          />
        </div>

        <div>
          <label for="password" class="label">{{ $t('common.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="6"
            class="input"
            :placeholder="$t('auth.login.passwordPlaceholder')"
          />
        </div>

        <div>
          <label for="confirmPassword" class="label">{{ $t('auth.register.confirmPassword') }}</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            class="input"
            :placeholder="$t('auth.login.passwordPlaceholder')"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary w-full"
        >
          {{ loading ? $t('auth.register.creatingAccount') : $t('auth.register.createAccount') }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          {{ $t('auth.register.haveAccount') }}
          <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
            {{ $t('auth.register.signIn') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const infoMessage = ref('');

const handleRegister = async () => {
  error.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = t('auth.register.passwordsNotMatch');
    return;
  }

  if (password.value.length < 6) {
    error.value = t('auth.register.passwordTooShort');
    return;
  }

  loading.value = true;

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    const pendingToken = sessionStorage.getItem('pendingInvitation');
    if (pendingToken) {
      router.push(`/invite/${pendingToken}`);
    } else {
      router.push('/dashboard');
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to register. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
