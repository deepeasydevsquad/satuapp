<template>
    <button
      :type="type"
      :class="['px-4 py-2 rounded text-white', colorClass]"
    >
      <slot />
    </button>
  </template>
  
  <script setup>
  const props = defineProps({
    type: {
      type: String,
      default: 'button'
    },
    color: {
      type: String,
      default: 'primary'
    }
  });
  
  const colorClass = computed(() => {
    switch (props.color) {
      case 'primary': return 'bg-blue-600 hover:bg-blue-700';
      case 'danger': return 'bg-red-600 hover:bg-red-700';
      case 'success': return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  });
  </script>
  