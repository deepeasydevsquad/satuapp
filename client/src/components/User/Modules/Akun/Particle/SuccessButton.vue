<script setup>
  const emit = defineEmits(["click"]);
</script>

<template>
  <button
    @click="emit('click')" class="w-[40px] h-[40px] mx-[0.1rem] my-[0.15rem] flex justify-center items-center rounded-lg bg-green-700 text-white hover:bg-green-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
  <slot></slot>
  </button>
</template>
