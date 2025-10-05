<template>
  <button
  class="px-4 py-2 hover:bg-gray-100 flex items-center"
  :class="{'bg-gray-100': current !== 'transaksi'}"
  @click="current = 'transaksi'"
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
</button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const current = ref('transaksi')
</script>
