<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-600 mb-2">{{ $t('auth.login.title') }}</h1>
        <p class="text-gray-600">{{ $t('auth.login.subtitle') }}</p>
      </div>

      <div
        v-if="infoMessage"
        class="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg">
        {{ infoMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
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
          {{ loading ? $t('auth.login.signingIn') : $t('auth.login.signIn') }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          {{ $t('auth.login.noAccount') }}
          <router-link to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
            {{ $t('auth.login.signUp') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const infoMessage = ref('');

onMounted(() => {
  if (route.query.message) {
    infoMessage.value = route.query.message as string;
  }
});

const handleLogin = async () => {
  error.value = '';
  loading.value = true;

  try {
    await authStore.login({ email: email.value, password: password.value });
    const pendingToken = sessionStorage.getItem('pendingInvitation');
    if (pendingToken) {
      router.push(`/invite/${pendingToken}`);
    } else {
      router.push('/dashboard');
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to login. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
