<template>
  <div class="bg-primary-50 p-4 rounded-xl border border-primary-100 mb-6">
    <h3 class="text-sm font-bold text-primary-800 uppercase tracking-wider mb-2">
      {{ $t('invitation.inviteMembers') }}
    </h3>
    <p class="text-xs text-primary-600 mb-4">{{ $t('invitation.shareLink') }}</p>

    <div class="flex gap-2">
      <button
        @click="generateInviteLink"
        :disabled="generating"
        class="btn btn-primary flex-1 text-sm py-2">
        {{ generating ? $t('invitation.generating') : $t('invitation.copyInviteLink') }}
      </button>
    </div>

    <p v-if="copied" class="text-[10px] text-green-600 mt-2 font-medium">
      {{ $t('invitation.linkCopied') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '@/services/api';
import i18n from '@/i18n';

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
    alert(i18n.global.t('invitation.errorOccurred'));
  } finally {
    generating.value = false;
  }
};
</script>
