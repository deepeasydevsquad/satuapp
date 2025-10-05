<template>
  <!-- Modal Konfirmasi -->
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white rounded-lg shadow-lg p-6 w-96">
      <h2 class="text-xl font-bold text-gray-700 mb-4">Konfirmasi Tambah Pengguna</h2>
      <div class="text-gray-700 mb-6 space-y-2">
        <p>
          Jika pengguna telah menjadi member, Anda akan memilih pengguna dari daftar member yang
          ada.
        </p>
        <p>Jika pengguna belum ada di member, Anda akan memasukkan data diri baru.</p>
      </div>
      <div class="flex justify-end gap-4">
        <button
          @click="handleConfirm(false)"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Belum Ada
        </button>
        <button
          @click="handleConfirm(true)"
          class="px-4 py-2 text-sm font-medium text-white bg-[#455494] rounded-lg hover:bg-[#3a477d] transition-colors"
        >
          Sudah Ada
        </button>
      </div>
    </div>
  </div>
</template>

<<script setup lang="ts">
const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  onConfirm: {
    type: Function as PropType<(isConfirmed: boolean) => void>,  // Tentukan tipe fungsi lebih jelas
    required: true,
  },
})

const emit = defineEmits<{
  (event: 'update:isVisible', value: boolean): void;
}>()

const handleConfirm = (isConfirmed: boolean) => {
  props.onConfirm(isConfirmed)
  emit('update:isVisible', false)
}
</script>

</script>
