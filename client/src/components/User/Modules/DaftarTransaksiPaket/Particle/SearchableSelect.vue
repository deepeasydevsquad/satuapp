<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: any;
  options: any[];
  label: string;
  placeholder?: string;
  idField?: string;
  nameField?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

const searchQuery = ref('');
const showDropdown = ref(false);

// Default to 'id' and 'name' if not provided
const idField = props.idField || 'id';
const nameField = props.nameField || 'name';

const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options;
  }

  const query = searchQuery.value.toLowerCase();
  return props.options.filter(option =>
    option[nameField].toLowerCase().includes(query)
  );
});

const selectedOption = computed(() => {
  if (!props.modelValue) return null;
  return props.options.find(option => option[idField] == props.modelValue);
});

const toggleDropdown = () => {
  if (!props.disabled) {
    showDropdown.value = !showDropdown.value;
    if (showDropdown.value) {
      // Reset search when opening dropdown
      searchQuery.value = '';
    }
  }
};

const selectOption = (option: any) => {
  emit('update:modelValue', option[idField]);
  showDropdown.value = false;
};

// Close dropdown when clicking outside
const dropdownRef = ref<HTMLElement | null>(null);
const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as HTMLElement)) {
    showDropdown.value = false;
  }
};

// Add event listener when component is mounted
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// Remove event listener when component is unmounted
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <label class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Selected value display -->
    <div
      @click="toggleDropdown"
      :class="[
        'w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200',
        {'cursor-pointer': !props.disabled}, { 'cursor-default opacity-50': props.disabled }
      ]"
    >
      <span v-if="selectedOption" class="text-gray-700">
        {{ selectedOption[nameField] }}
      </span>
      <span v-else class="text-gray-600">
        {{ placeholder || `Pilih ${label}` }}
      </span>
      <svg
        class="w-5 h-5 text-gray-400 transition-transform duration-200 ease-in-out"
        :class="{ 'transform rotate-180': showDropdown }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>

    <!-- Dropdown -->
    <div
      v-if="showDropdown"
      class="absolute z-999 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
    >
      <!-- Search input -->
      <div class="p-2 border-b border-gray-200">
        <input
          v-model="searchQuery"
          type="text"
          :disabled="props.disabled"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          :placeholder="`Cari ${label}...`"
          @click.stop
        />
      </div>

      <!-- Options list -->
      <div v-if="filteredOptions.length > 0" class="py-1">
        <div
          v-for="option in filteredOptions"
          :key="option[idField]"
          @click="!props.disabled && selectOption(option)"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          :class="{ 'bg-blue-50': option[idField] === modelValue, 'pointer-events-none opacity-50': props.disabled }"
        >
          {{ option[nameField] }}
        </div>
      </div>

      <!-- No results message -->
      <div v-else class="px-4 py-2 text-gray-500 text-center">
        {{ label }} tidak ditemukan
      </div>
    </div>
  </div>
</template>

