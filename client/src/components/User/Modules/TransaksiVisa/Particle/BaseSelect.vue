<script setup lang="ts">
interface Option {
  value: string | number;
  label: string;
}

defineProps<{
  modelValue: string | number;
  label: string;
  options: Option[];
  error?: string;
  required?: boolean;
}>();

defineEmits(['update:modelValue']);
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-800">
      {{ label }}
      <span v-if="required" class="text-red-500"> *</span>
    </label>
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="w-full mt-1 px-3 py-2 border rounded-md focus:ring-1 transition-colors duration-200 bg-gray-50 hover:bg-white focus:bg-white text-black text-sm"
      :class="[
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-500',
        !modelValue || modelValue === '' ? 'text-xs text-gray-400' : 'text-sm text-black'
      ]"
    >
      <option disabled value="" class="text-xs text-gray-400">Pilih...</option>
      <option v-for="option in options" :key="option.value" :value="option.value" class="text-sm text-black">
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
  </div>
</template>