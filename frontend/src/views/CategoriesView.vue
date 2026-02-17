<template>
  <NavBar />
  <div class="max-w-md mx-auto p-4 sm:max-w-2xl lg:max-w-4xl">
    <header class="mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ t('categories.title') }}</h1>
      <p class="text-gray-500 text-sm mt-1">Gestiona las etiquetas de tus gastos</p>
    </header>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div class="flex-1">
          <label class="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">{{ t('categories.name') }}</label>
          <input v-model="newName" :placeholder="t('categories.namePlaceholder')"
            class="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 transition-all" />
        </div>

        <div class="flex items-center gap-3">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">{{ t('categories.color') }}</label>
            <div class="relative flex items-center">
              <input v-model="newColor" type="color" class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
              <div :style="{ backgroundColor: newColor }"
                class="w-12 h-12 rounded-xl border-2 border-white shadow-sm ring-1 ring-gray-200"></div>
            </div>
          </div>

          <button @click="createCategory"
            class="flex-1 sm:flex-none h-12 px-6 mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-transform active:scale-95 shadow-lg shadow-blue-200">
            {{ t('categories.add') }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="cat in categories" :key="cat.id"
        class="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
        <template v-if="editingId !== cat.id">
          <div class="flex items-center gap-3">
            <div :style="{ backgroundColor: cat.color || '#cbd5e1' }"
              class="w-4 h-4 rounded-full ring-4 ring-opacity-20 shadow-inner" :class="`ring-[${cat.color}]`"></div>
            <span class="font-semibold text-gray-700">{{ cat.name }}</span>
          </div>

          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="startEdit(cat)" class="p-2 hover:bg-blue-50 text-blue-600 rounded-lg">
              <span class="text-xs font-bold">Edit</span>
            </button>
            <button @click="deleteCategory(cat.id)" class="p-2 hover:bg-red-50 text-red-600 rounded-lg">
              <span class="text-xs font-bold">Del</span>
            </button>
          </div>
        </template>

        <template v-else>
          <div class="flex flex-col w-full gap-2">
            <div class="flex gap-2">
              <input v-model="editColor" type="color" class="w-10 h-10 p-0 border-none bg-transparent" />
              <input v-model="editName" class="flex-1 border-b-2 border-blue-500 focus:outline-none p-1" />
            </div>
            <div class="flex justify-end gap-2">
              <button @click="editingId = null" class="text-xs text-gray-400 font-bold uppercase">Cancelar</button>
              <button @click="saveEdit(cat.id)" class="text-xs text-blue-600 font-bold uppercase">Guardar</button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { categoriesService } from '../services/categoryService';
import NavBar from '../components/NavBar.vue';

const { t } = useI18n();
const route = useRoute();
const environmentId = Number(route.params.id);

const categories = ref([] as any[]);
const newName = ref('');

// --- Lógica de Colores Automáticos ---
const defaultColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

const getNextRandomColor = () => {
  return defaultColors[Math.floor(Math.random() * defaultColors.length)];
};

const newColor = ref(getNextRandomColor());
// -------------------------------------

const editingId = ref<number | null>(null);
const editName = ref('');
const editColor = ref('#ffffff');

async function load() {
  if (!environmentId) return;
  try {
    const res = await categoriesService.list(environmentId);
    categories.value = res.data;
  } catch (err) {
    console.error('Error loading categories', err);
  }
}

onMounted(load);

async function createCategory() {
  if (!newName.value.trim()) return;
  try {
    const res = await categoriesService.create(environmentId, {
      name: newName.value.trim(),
      color: newColor.value
    });
    categories.value.push(res.data);

    // Resetear campos y asignar un nuevo color aleatorio para la siguiente
    newName.value = '';
    newColor.value = getNextRandomColor();
  } catch (err: any) {
    console.error('Error creating category', err);
    alert(t('categories.createError'));
  }
}

function startEdit(cat: any) {
  editingId.value = cat.id;
  editName.value = cat.name;
  editColor.value = cat.color || '#ffffff';
}

async function saveEdit(id: number) {
  try {
    await categoriesService.update(id, { name: editName.value.trim(), color: editColor.value });
    await load();
    editingId.value = null;
  } catch (err: any) {
    console.error('Error updating category', err);
    alert(t('categories.updateError'));
  }
}

async function deleteCategory(id: number) {
  if (!confirm(t('categories.deleteConfirm'))) return;
  try {
    await categoriesService.remove(id);
    categories.value = categories.value.filter(c => c.id !== id);
  } catch (err: any) {
    console.error('Error deleting category', err);
  }
}
</script>