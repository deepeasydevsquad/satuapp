<template>
    <div
      v-if="props.isModalConfirmOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white rounded-lg p-4 w-full max-w-xl shadow-lg">
        <h2 class="text-2xl font-semibold text-center text-gray-700 mb-2">
          Pilih Opsi Tambah Jamaah
        </h2>
        <p class="text-center text-md text-gray-600 mb-4">
          Silahkan pilih salah satu metode tambah jamaah
        </p>
        <div class="space-y-4 sm:space-x-4 sm:space-y-0 flex justify-center mb-6">
          <PrimaryButton
            @click="emit('pilih-member')"
          >
            TAMBAH DARI MEMBER
          </PrimaryButton>
          <PrimaryButton
            @click="emit('pilih-baru')"
          >
            TAMBAH JAMAAH BARU
          </PrimaryButton>
          <button
            @click="emit('close')"
            class="px-4 mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            BATAL
          </button>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
const props = defineProps<{
  isModalConfirmOpen: boolean
}>()

const emit = defineEmits(['pilih-member', 'pilih-baru', 'close'])
</script>

