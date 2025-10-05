<!-- components/User/Modules/DaftarPaket/Widget/NavSubmenu.vue -->
<script lang="ts" setup>
import { defineEmits, ref, watch, defineProps } from 'vue'
import BackButton from '@/components/User/Modules/DetailPaket/Particle/BackButton.vue'
import SubmenuItem from '@/components/User/Modules/DetailPaket/Particle/SubmenuItem.vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:current', value: string): void
}>()


const props = defineProps<{
  divisionName: string
  paketName:string
}>()


  console.log('Props:---------XXXXXXXXXXXXXXXXXXXXXXXXXXX');
  console.log('Props:', props);
  console.log('Props:---------XXXXXXXXXXXXXXXXXXXXXXXXXXX');

// :divisionName="divisionName", :paketName="paketName"

const current = ref('transaksi')


const icons: Record<string, string> = {
  transaksi: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <!-- Atas: panah kanan -->
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M6 7h12m0 0l-4-4m4 4l-4 4" />
      <!-- Bawah: panah kiri -->
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M18 17H6m0 0l4 4m-4-4l4-4" />
    </svg>
  `,
  jamaah: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8zm6 8v-1a2 2 0 00-2-2H8a2 2 0 00-2 2v1h12z" />
    </svg>
  `,
  manifes: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M9 17v-6h13M5 7h14M5 11h14M5 15h14" />
    </svg>
  `,
  syarat: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  `,
  kamar: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M3 12l9-9 9 9M4 10v10h5v-6h6v6h5V10" />
    </svg>
  `,
  bus: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M4 16V5a2 2 0 012-2h12a2 2 0 012 2v11M4 16h16M6 20h.01M18 20h.01" />
    </svg>
  `,
  agen: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  `,
  k_t: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
      viewBox="0 0 24 24" class="w-4 h-4" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M8 9h8M8 13h6M8 17h4" />
    </svg>
  `,
}

const items = [
  { label: 'Transaksi', icon: 'transaksi', value: 'transaksi' },
  { label: 'Jamaah', icon: 'jamaah', value: 'jamaah' },
  { label: 'Manifes', icon: 'manifes', value: 'manifes' },
  { label: 'Syarat', icon: 'syarat', value: 'syarat' },
  { label: 'Kamar', icon: 'kamar', value: 'kamar' },
  { label: 'Bus', icon: 'bus', value: 'bus' },
  { label: 'Agen', icon: 'agen', value: 'agen' },
  { label: 'K&T', icon: 'k_t', value: 'k_t' },
]

watch(current, (val) => {
  emit('update:current', val)
})
</script>
<template>
  <div class="flex justify-between items-center mb-5 px-0 w-full">
    <div class="inline-flex rounded-md shadow-xs mb-5 px-4">
      <button   @click="emit('close')"  type="button"
        class="px-4 py-2 text-sm font-medium bg-white border-t border-b border-s border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-0 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <template v-for="item in items" :key="item.value">
         <button  @click="current = item.value" v-if="item.value == 'k_t'" type="button"  :class="current === item.value ? 'z-10 ring-2 text-blue-700 ring-blue-700 bg-gray-200 shadow-md font-semibold' : 'text-gray-700 hover:bg-gray-100 border-e' " class="px-4 py-2 w-30 text-sm font-medium bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
           <span v-html="icons[item.icon]" class="w-4 h-4 pt-1 mr-1 inline-block" />
          <span>{{ item.label }}</span>
        </button>
        <button  @click="current = item.value" v-else type="button" :class="current === item.value ? 'z-10 ring-2 text-blue-700 ring-blue-700 bg-gray-200 shadow-md  font-semibold' : 'text-gray-700 hover:bg-gray-100' " class="px-4 py-2 w-30 text-sm font-medium bg-white border-t border-b border-s border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
           <span v-html="icons[item.icon]" class="w-4 h-4 pt-1 mr-1 inline-block" />
          <span>{{ item.label }}</span>
        </button>
      </template>
    </div>
    <div class="text-sm font-medium text-gray-800 px-4 h-10">
      {{ paketName }} : <b> {{ divisionName }}</b>
    </div>
  </div>
</template>

