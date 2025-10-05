<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Confirmation from '@/components/User/Modules/DaftarFasilitas/Particle/Confirmation.vue';
import { addFasilitas, editFasilitas } from '@/service/daftar_fasilitas';

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status', payload: { error: boolean, err_msg?: string }): void
}>()

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    required: true
  },
  selectedFasilitas: {
    type: Object,
  }
})

interface Fasilitas {
  id: number;
  name: string;
}

interface Errors {
  name: string;
}

const errors = ref<Errors>({
  name: '',
});

const Fasilitas = ref<Partial<Fasilitas>>({
  name: '',
});

const showConfirmDialog = ref<boolean>(false);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const validateForm = (): boolean => {
  errors.value = { name: '' };
  let isValid = true;

  if (!Fasilitas.value.name?.trim()) {
    errors.value.name = 'Nama tidak boleh kosong';
    isValid = false;
  }
  return isValid;
};

const saveData = async () => {
  if (!validateForm()) return;

  const isEdit = !!Fasilitas.value.id;
  const action = async () => {
    try {
      if (isEdit) {
        const response = await editFasilitas(Fasilitas.value.id, Fasilitas.value );
        showConfirmDialog.value = false;
        emit('status', { error: false, err_msg: (response?.error_msg || response?.message) || 'Fasilitas berhasil di update' });
      } else {
        const response = await addFasilitas(Fasilitas.value);
        showConfirmDialog.value = false;
        emit('status', { error: false, err_msg: (response?.error_msg || response?.message) || 'Fasilitas berhasil di tambahkan' });
      }
      emit('close')
    } catch (error) {
      showConfirmDialog.value = false;
      emit('status', { error: true, err_msg: (error?.response?.data?.error_msg || error.response?.data?.message) || 'Terjadi kesalahan saat menyimpan data.' });
    }
  };

  isEdit ? showConfirmation('Konfirmasi Perubahan', 'Apakah Anda yakin ingin mengubah data ini?', action) : action();
};

onMounted(() => {
  Fasilitas.value = { ...Fasilitas.value, ...(props.selectedFasilitas ?? {} ) };
})
</script>

<template>
  <div v-if="props.isModalOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="emit('close')"></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
      <div class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 class="text-2xl flex justify-center font-bold leading-6 text-gray-900 mb-4">
            {{ Fasilitas.id ? "Edit Data Fasilitas" : "Tambah Fasilitas Baru" }}
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input
                v-model="Fasilitas.name"
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal" placeholder="Nama Fasilitas"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
          <PrimaryButton
            @click="saveData"
          >
            {{ Fasilitas.id ? "Simpan Perubahan" : "Tambah" }}
          </PrimaryButton>
          <button
            @click="emit('close')"
            class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Confirmation Dialog -->
  <Confirmation :showConfirmDialog="showConfirmDialog"  :confirmTitle="confirmTitle" :confirmMessage="confirmMessage" >
    <button @click="confirmAction && confirmAction()"
      class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Ya
    </button>
    <button
      @click="showConfirmDialog = false"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Tidak
    </button>
  </Confirmation>
</template>

