<script setup lang="ts">
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Notification from '@/modules/DaftarJamaahPaket/Particle/Notification.vue';
import Confirmation from '@/modules/DaftarJamaahPaket/Particle/Confirmation.vue';
import { onMounted, reactive, ref } from 'vue';
import { getPetugasJamaahPaket } from '@/service/daftar_jamaah_paket';

const props = defineProps<{
  isFormDownloadAbsensiOpen: boolean;
  paketId: number | null;
  cabangId: number;
}>();

console.log(props);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
}>();

// Interfaces
interface Petugas {
  id: string; // contoh: "admin-1", "agen-4", "user-5"
  label: string; // contoh: "Muhammad Iqbal (Agen)"
  type: 'admin' | 'agent' | 'petugas';
}

// State
const PetugasOption = ref<Petugas[]>([]);

const isLoading = ref(false);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('');
const timeoutId = ref<number | null>(null);
const showConfirmDialog = ref<boolean>(false);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);

const errors = ref({
  id: '',
  petugas_id: '',
});

const form = reactive({
  id: props.paketId ?? null,
  petugas_id: '', // <- ini akan menyimpan "admin-1", "agen-4", dll
});

// Function: Notification
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  showConfirmDialog.value = false;
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// Function: Confirmation
const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

// Function: Ambil data awal
const fetchData = async () => {
  try {
    isLoading.value = true;
    const petugas = await getPetugasJamaahPaket({
      division_id: props.cabangId,
    });
    PetugasOption.value = petugas.data;
  } catch (error) {
    displayNotification('Failed to fetch data', 'error');
  } finally {
    isLoading.value = false;
  }
};

// Function: Validasi form
const validateForm = (): boolean => {
  let isValid = true;
  errors.value = {
    id: '',
    petugas_id: '',
  };

  if (!form.id) {
    showConfirmation('Konfirmasi', 'ID paket tidak ditemukan. Silakan coba lagi.', () => {
      emit('close');
    });
    isValid = false;
  }

  if (!form.petugas_id) {
    errors.value.petugas_id = 'Petugas wajib dipilih';
    isValid = false;
  }

  return isValid;
};

// Cetak Data Jamaah
const cetakDataJamaah = async () => {
  if (!validateForm()) return;
  showConfirmation('Konfirmasi Cetak', 'Anda yakin ingin mencetak absensi jamaah?', async () => {
    try {
      isLoading.value = true;
      const url = `/daftar-jamaah-paket/absensi-jamaah-paket/${props.paketId}/cetak?petugasId=${form.petugas_id}`;
      window.open(url, '_blank');
      showConfirmDialog.value = false;
    } catch (error) {
      console.error(error);
      displayNotification(error?.response?.data?.error_msg, 'error');
    } finally {
      isLoading.value = false;
    }
  });
};

onMounted(() => {
  fetchData();
  window.addEventListener('message', (event) => {
    console.log('Pesan dari child:', event.data); // debug
    if (event.data?.event === 'sukses') {
      displayNotification(event.data.message, 'success');
    } else if (event.data?.event === 'gagal') {
      displayNotification(event.data.message, 'error');
    }
  });
});
</script>

<template>
  <div
    v-if="isLoading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
  </div>
  <div
    v-if="props.isFormDownloadAbsensiOpen && !isLoading"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex min-h-screen items-end justify-center px-6 pt-6 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="$emit('close')"
      ></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true"
        >&#8203;</span
      >
      <div
        class="relative p-6 inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
      >
        <div class="mb-4">
          <h3 class="text-2xl flex font-bold leading-6 text-gray-900 mb-4">
            Form Tanda Tangan Petugas
          </h3>
          <label for="Petugas" class="block text-sm font-medium text-gray-700"
            >Tanda tangan petugas</label
          >
          <select
            id="Petugas_id"
            v-model="form.petugas_id"
            class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          >
            <option value="" disabled selected>Pilih petugas yang tanda tangan</option>
            <option v-for="item in PetugasOption" :key="item.id" :value="item.id">
              {{ item.label }}
            </option>
          </select>
          <p v-if="errors.petugas_id" class="text-red-500 text-sm mt-1">{{ errors.petugas_id }}</p>
        </div>
        <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
          <PrimaryButton @click="cetakDataJamaah()">CETAK</PrimaryButton>
          <button
            @click="$emit('close')"
            class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-400 bg-gray-200 px-4 py-2 text-base font-medium text-gray-800 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            BATAL
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />

  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <button
      @click="confirmAction && confirmAction()"
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
