<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { APP_NAME } from '@/config/config';

useHead({
  title: APP_NAME + ' :: Aplikasi Manajemen Travel Haji dan Umrah',
  link: [{ rel: 'icon', type: 'image/png', href: 'public/favicon.png' }],
  meta: [{ name: APP_NAME, content: 'Aplikasi manajemen travel Haji dan Umrah' }],
});

import LoginCard from '@/modules/Login/widgets/LoginCard.vue';
</script>

<template>
  <div class="bg-gray-100 flex items-center justify-center h-screen">
    <LoginCard />
  </div>
</template>
