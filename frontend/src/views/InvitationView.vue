<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div v-if="loading" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Validating invitation...</p>
    </div>

    <div v-else-if="error" class="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
      <div class="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Invalid Invitation</h2>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <router-link to="/" class="btn btn-primary w-full">Go to Home</router-link>
    </div>

    <div
      v-else-if="invitation"
      class="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
      <div class="text-primary-500 text-5xl mb-4">📩</div>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">You've been invited!</h2>
      <p class="text-gray-600 mb-6">
        You are invited to join the environment: <br />
        <span class="font-bold text-gray-900 text-lg">{{ invitation.environment_name }}</span>
      </p>

      <button
        @click="handleAccept"
        :disabled="processing"
        class="btn btn-primary w-full py-3 text-lg">
        {{ processing ? 'Joining...' : 'Accept & Join' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const router = useRouter();
const token = route.params.token as string;

const invitation = ref<any>(null);
const loading = ref(true);
const error = ref('');
const processing = ref(false);

onMounted(async () => {
  const isLoggedIn = !!localStorage.getItem('token');

  if (!isLoggedIn) {
    sessionStorage.setItem('pendingInvitation', token);
    router.push({ name: 'login', query: { message: 'Please login to accept the invitation' } });
    return;
  }

  try {
    const response = await api.get(`/invitations/${token}`);
    invitation.value = response.data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'This invitation link is no longer valid.';
  } finally {
    loading.value = false;
  }
});

const handleAccept = async () => {
  processing.value = true;
  try {
    await api.post(`/invitations/${token}/accept`);
    sessionStorage.removeItem('pendingInvitation');
    router.push('/dashboard');
  } catch (err: any) {
    alert(err.response?.data?.error || 'Failed to join');
  } finally {
    processing.value = false;
  }
};
</script>
