<template>
    <label class="flex items-center space-x-2">
      <input type="checkbox" v-model="model" />
      <span>{{ label }}</span>
    </label>
  </template>
  
  <script setup>
  const props = defineProps({
    modelValue: Boolean,
    label: String
  });
  const emit = defineEmits(['update:modelValue']);
  const model = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  });
  </script>
  