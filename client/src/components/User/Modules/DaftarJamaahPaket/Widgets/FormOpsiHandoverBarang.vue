<script setup  lang="ts">
import PrimaryButton from "@/components/Button/PrimaryButton.vue"

import { ref } from 'vue'

const isLoading = ref(false)

const props = defineProps<{
  isFormOpsiHandoverBarangOpen: boolean,
  transpaketId: number,
}>()

console.log(props)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'terima-barang', transpaketId: number): void
  (e: 'pengembalian-barang', transpaketId: number): void
}>()

</script>

<template>
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
  </div>
  <div v-if="props.isFormOpsiHandoverBarangOpen && !isLoading" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex min-h-screen items-end justify-center px-6 pt-6 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
      <div class="relative p-6 inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
        <div class="mb-4">
          <h3 class="text-2xl flex font-bold leading-6 text-gray-900 mb-4">
            Form Handover dan Pengembalian Barang Jamaah
          </h3>
          <h4 class="text-md flex medium leading-6 text-gray-600">Silahkan pilih jenis handover atau pengembalian barang jamaah</h4>
        </div>
        <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2 text-sm">
          <PrimaryButton @click="$emit('pengembalian-barang', props.transpaketId)">PENGEMBALIAN BARANG JAMAAH</PrimaryButton>
          <PrimaryButton @click="$emit('terima-barang', props.transpaketId)">HANDOVER BARANG JAMAAH</PrimaryButton>
          <button
            @click="$emit('close')"
            class=" mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            BATAL
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
