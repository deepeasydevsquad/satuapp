<script setup>
  const emit = defineEmits(["click"]);
</script>

<template>
  <button
    @click="emit('click')"
    class="w-[45px] h-[45px] mx-[0.1rem] my-[0.15rem] flex justify-center items-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    <slot></slot>
  </button>
</template>

