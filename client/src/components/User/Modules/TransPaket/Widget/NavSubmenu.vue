<!-- components/User/Modules/DaftarPaket/Widget/NavSubmenu.vue -->
<script lang="ts" setup>
import { defineEmits, ref, watch } from 'vue'
import SubmenuItem from '@/components/User/Modules/TransPaket/Particle/SubmenuItem.vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:current', value: string): void
}>()

const current = ref('daftar_paket')

const items = [
  { label: 'Daftar Paket', icon: 'box-open', value: 'daftar_paket' },
  { label: 'Daftar Jamaah', icon: 'users', value: 'daftar_jamaah' },
  // { label: 'Pembayaran Paket', icon: 'money-bill', value: 'pembayaran_paket' },
  { label: 'Pembayaran Paket Agen', icon: 'user-check', value: 'pembayaran_paket_agen' },
]

watch(current, (val) => {
  console.log('Current value changed:', val)
  emit('update:current', val)
})
</script>

<template>
  <div class="inline-flex rounded-md shadow-xs mb-5" role="group">
    <template v-for="item in items" :key="item.value">
      <button  @click="current = item.value" v-if="item.value == 'daftar_paket'"  type="button" :class="current === item.value ? 'shadow-md z-10 ring-2 text-blue-700 ring-blue-700 bg-gray-200 font-semibold' : 'text-gray-700 hover:bg-gray-100'"
      class="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
        <font-awesome-icon :icon="['fas', item.icon]" :class="current === item.value ? 'text-blue-700 ring-blue-700 font-normal' : ' text-gray-600  hover:bg-gray-100'"  class="w-4 h-4 me-1 hover:text-blue-700 focus:text-blue-700" />
        <span>{{ item.label }}</span>
      </button>
      <button  @click="current = item.value" v-else-if="item.value == 'pembayaran_paket_agen'" type="button"  :class="current === item.value ? 'z-10 ring-2 text-blue-700 ring-blue-700 bg-gray-200 shadow-md font-semibold' : 'text-gray-700 hover:bg-gray-100'" class="px-4 py-2 text-sm font-medium  bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
        <font-awesome-icon :icon="['fas', item.icon]" :class="current === item.value ? 'text-blue-700 ring-blue-700 font-normal' : ' text-gray-600  hover:bg-gray-100'"  class="w-4 h-4 me-1 hover:text-blue-700 focus:text-blue-700" />
        <span>{{ item.label }}</span>
      </button>
      <button  @click="current = item.value" v-else type="button" :class="current === item.value ? 'z-10 ring-2 text-blue-700 ring-blue-700 bg-gray-200 shadow-md  font-semibold' : 'text-gray-700 hover:bg-gray-100'" class="px-4 py-2 text-sm font-medium bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
        <font-awesome-icon :icon="['fas', item.icon]" :class="current === item.value ? 'text-blue-700 ring-blue-700 font-normal' : ' text-gray-600  hover:bg-gray-100'"  class="w-4 h-4 me-1 hover:text-blue-700 focus:text-blue-700" />
        <span>{{ item.label }}</span>
      </button>
    </template>
  </div>
</template>
