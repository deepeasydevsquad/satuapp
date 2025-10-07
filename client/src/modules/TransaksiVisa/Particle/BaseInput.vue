<script setup lang="ts">
defineProps<{
  modelValue: string | number;
  label: string;
  type?: string;
  placeholder?: string;
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
    <input
      :type="type || 'text'"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder || ''"
      class="w-full mt-1 px-3 py-2 border rounded-md focus:ring-1 transition-colors duration-200 bg-gray-50 hover:bg-white focus:bg-white text-black placeholder:text-xs placeholder:text-gray-400 text-sm"
      :class="[
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-500',
        (type === 'date' || type === 'datetime-local' || type === 'time') ? 'text-xs' : 'text-sm'
      ]"
    />
    <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
  </div>
</template>