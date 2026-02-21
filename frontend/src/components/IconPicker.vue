<template>
    <div>
        <!-- Trigger -->
        <button type="button" @click="open = true"
            class="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white w-full h-12 justify-between">
            <div class="flex items-center gap-2">
                <i :class="`fa-solid fa-${modelValue || 'tag'} text-lg`"></i>
                <span class="text-sm text-gray-600">
                    {{ modelValue || $t('icons.select') }}
                </span>
            </div>
            <i class="fa-solid fa-chevron-up text-xs opacity-60"></i>
        </button>

        <!-- Overlay -->
        <div v-if="open" class="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center sm:justify-center"
            @click.self="open = false">
            <!-- Modal -->
            <div class="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-4 max-h-[85vh] flex flex-col">
                <!-- Header -->
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-bold text-lg">{{ $t('icons.title') }}</h3>
                    <button @click="open = false" class="p-2">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>

                <!-- Search -->
                <input v-model="searchText" :placeholder="$t('icons.placeholder')"
                    class="w-full px-4 py-3 rounded-xl bg-gray-100 mb-3" />

                <!-- Grid -->
                <div class="overflow-auto">
                    <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        <button v-for="icon in filtered" :key="icon" @click="select(icon)"
                            class="flex flex-col items-center justify-center gap-1 p-3 rounded-xl border hover:bg-gray-50">
                            <i :class="`fa-solid fa-${icon} text-xl`"></i>
                            <span class="text-[10px] text-gray-500 truncate w-full text-center">
                                {{ icon }}
                            </span>
                        </button>
                    </div>

                    <div v-if="filtered.length === 0" class="text-center text-sm text-gray-500 py-6">
                        {{ $t('icons.noResults') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import icons from '../libs/fa-icons-sample';

const props = defineProps({
    modelValue: { type: String, required: false }
});

const emit = defineEmits(['update:modelValue']);

const open = ref(false);
const searchText = ref('');

const filtered = computed(() => {
    if (!searchText.value) return icons;
    return icons.filter(i =>
        i.toLowerCase().includes(searchText.value.toLowerCase())
    );
});

function select(icon: string) {
    emit('update:modelValue', icon);
    open.value = false;
}
</script>