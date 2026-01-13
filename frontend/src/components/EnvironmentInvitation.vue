<template>
  <div class="bg-primary-50 p-4 rounded-xl border border-primary-100 mb-6">
    <h3 class="text-sm font-bold text-primary-800 uppercase tracking-wider mb-2">
      Invite your family and friends
    </h3>
    <p class="text-xs text-primary-600 mb-4">Share this link to add members to this environment.</p>

    <div class="flex gap-2">
      <button
        @click="generateInviteLink"
        :disabled="generating"
        class="btn btn-primary flex-1 text-sm py-2">
        {{ generating ? 'Generating...' : 'Copy Invite Link' }}
      </button>
    </div>

    <p v-if="copied" class="text-[10px] text-green-600 mt-2 font-medium">
      ✓ Link copied to clipboard! Valid for 48h.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '@/services/api';

const props = defineProps<{ environmentId: number }>();
const generating = ref(false);
const copied = ref(false);

const generateInviteLink = async () => {
  generating.value = true;
  try {
    const { data } = await api.post(`/environments/${props.environmentId}/invite`);

    const inviteUrl = `${window.location.origin}/invite/${data.token}`;

    await navigator.clipboard.writeText(inviteUrl);

    copied.value = true;
    setTimeout(() => (copied.value = false), 3000);
  } catch (error) {
    alert('Error generating link');
  } finally {
    generating.value = false;
  }
};
</script>
