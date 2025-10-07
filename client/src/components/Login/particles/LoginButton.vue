<template>
  <button
    :class="`w-full py-2 rounded-lg hover:bg-green-700 hover:text-white transition mb-4 flex justify-center font-semibold gap-3 ${color}`"
  >
    <img :src="`/${icon}`" class="w-6 h-6" />
    {{ label }}
  </button>
</template>
<script setup lang="ts">
defineProps({
  icon: String,
  label: String,
  color: String,
});
</script>
