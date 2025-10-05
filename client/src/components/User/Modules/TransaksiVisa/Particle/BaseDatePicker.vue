<template>
    <div class="mb-3">
      <label class="block mb-1 text-sm font-medium">{{ label }}</label>
      <input
        type="date"
        v-model="model"
        class="w-full p-2 border border-gray-300 rounded"
      />
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    modelValue: String,
    label: String
  });
  const emit = defineEmits(['update:modelValue']);
  const model = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  });
  </script>
  