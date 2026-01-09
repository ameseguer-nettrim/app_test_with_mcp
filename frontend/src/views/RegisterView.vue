<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-600 mb-2">Create Account</h1>
        <p class="text-gray-600">Start tracking your family expenses</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="name" class="label">Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="input"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label for="email" class="label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="password" class="label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="6"
            class="input"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label for="confirmPassword" class="label">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            class="input"
            placeholder="••••••••"
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
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Already have an account?
          <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
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

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  error.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters';
    return;
  }

  loading.value = true;

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    router.push('/dashboard');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to register. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>