<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { APP_NAME } from '@/config/config';

import { useHead } from '@vueuse/head';

useHead({
  title: APP_NAME + ' :: Aplikasi Manajemen Travel Haji dan Umrah',
  link: [{ rel: 'icon', type: 'image/png', href: 'public/favicon.png' }],
  meta: [{ name: APP_NAME, content: 'Aplikasi manajemen travel Haji dan Umrah' }],
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
