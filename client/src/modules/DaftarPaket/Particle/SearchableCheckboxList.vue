<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  modelValue: string[]; // sekarang modelValue array of ID (string)
  options: any[];
  label: string;
  idField?: string;
  nameField?: string;
  required?: boolean;
  error?: string;
  defaultValue?: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const searchQuery = ref('');

// Default idField dan nameField
const idField = props.idField || 'id';
const nameField = props.nameField || 'name';

// Filtering berdasarkan search query
const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options;
  }

  const query = searchQuery.value.toLowerCase();
  return props.options.filter(option =>
    option[nameField]?.toLowerCase().includes(query)
  );
});

// Cek apakah option sudah terpilih
const isChecked = (option: any) => {
  if (!props.modelValue || !Array.isArray(props.modelValue)) return false;
  return props.modelValue.includes(option[idField].toString());
};

// Menambah atau menghapus ID dari modelValue
const toggleOption = (option: any) => {
  const optionId = option[idField].toString();
  let newValue = [...(props.modelValue || [])];

  if (isChecked(option)) {
    newValue = newValue.filter(id => id !== optionId);
  } else {
    newValue.push(optionId);
  }

  emit('update:modelValue', newValue);
};

// Jika ada defaultValue, maka gunakan itu sebagai modelValue awal dan centang checkboxnya
watch(
  () => props.defaultValue,
  (newDefaultValue) => {
    if (newDefaultValue) {
      emit('update:modelValue', newDefaultValue);
      // centang checkboxnya
      props.options.forEach((option) => {
        if (newDefaultValue.includes(option[idField].toString())) {
          toggleOption(option);
        }
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Search input -->
    <div class="mb-2">
      <input
        v-model="searchQuery"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        :placeholder="`Cari ${label}...`"
      />
    </div>

    <!-- Checkbox list -->
    <div class="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
      <template v-if="filteredOptions.length > 0">
        <label
          v-for="option in filteredOptions"
          :key="option[idField]"
          class="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
        >
          <input
            type="checkbox"
            :id="`${label.toLowerCase().replace(/\s+/g, '-')}-${option[idField]}`"
            :checked="isChecked(option)"
            @change="toggleOption(option)"
            class="w-4 h-4 rounded-sm border-2 border-gray-400 text-blue-500 focus:ring-blue-500"
          >
          <span class="text-sm">{{ option[nameField] }}</span>
        </label>
      </template>
      <div v-else class="text-center text-gray-500 py-2">
        Data tidak ditemukan
      </div>
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

