<script setup lang="ts">
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import Notification from '@/modules/TabunganUmrah/Particle/Notification.vue';
import Confirmation from '@/modules/TabunganUmrah/Particle/Confirmation.vue';
import {
  updateVisaTransaksiPaket,
  infoupdateVisaTransaksiPaket,
} from '@/service/daftar_transaksi_paket';

import { ref, reactive, onMounted } from 'vue';

const isLoading = ref(false);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');
const timeoutId = ref<number | null>(null);

const showConfirmDialog = ref(false);
const confirmMessage = ref('');
const confirmTitle = ref('');
const confirmAction = ref<(() => void) | null>(null);

const props = defineProps<{
  isFormEditVisaOpen: boolean;
  paketId: number;
  transpaketId: number;
  cabangId: number;
}>();

console.log(props);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
}>();

const errors = ref({
  nomor_visa: '',
  tanggal_berlaku_visa: '',
  tanggal_berakhir_visa: '',
});

const form = reactive({
  nomor_visa: '',
  tanggal_berlaku_visa: '',
  tanggal_berakhir_visa: '',
});

// Function: Notification
function displayNotification(message: string, type: 'success' | 'error' = 'success') {
  showConfirmDialog.value = false;
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
}

// Function: Confirmation
function showConfirmation(title: string, message: string, action: () => void) {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
}

async function fetchData() {
  try {
    isLoading.value = true;
    const response = await infoupdateVisaTransaksiPaket({
      id: props.paketId,
      transpaketId: props.transpaketId,
      division_id: props.cabangId,
    });
    form.nomor_visa = response.data.nomor_visa;
    form.tanggal_berlaku_visa = response.data.tanggal_berlaku_visa;
    form.tanggal_berakhir_visa = response.data.tanggal_berakhir_visa;
  } catch (error: any) {
    console.error('Error fetching data:', error);
    emit('status', {
      error: true,
      err_msg:
        error?.response?.data?.error_msg ||
        error?.response?.data?.message ||
        'Terjadi kesalahan saat mengambil data.',
    });
  } finally {
    isLoading.value = false;
  }
}

// Function: Validasi form
const validateForm = (): boolean => {
  let isValid = true;
  errors.value = {
    nomor_visa: '',
    tanggal_berlaku_visa: '',
    tanggal_berakhir_visa: '',
  };

  if (!form.nomor_visa) {
    errors.value.nomor_visa = 'Nomor Visa wajib diisi';
    isValid = false;
  }
  if (!form.tanggal_berlaku_visa) {
    errors.value.tanggal_berlaku_visa = 'Tanggal Berlaku Visa wajib diisi';
    isValid = false;
  }
  if (!form.tanggal_berakhir_visa) {
    errors.value.tanggal_berakhir_visa = 'Tanggal Berakhir Visa wajib diisi';
    isValid = false;
  }
  if (form.tanggal_berlaku_visa && form.tanggal_berakhir_visa) {
    const tanggalBerlaku = new Date(form.tanggal_berlaku_visa);
    const tanggalBerakhir = new Date(form.tanggal_berakhir_visa);
    if (tanggalBerlaku.getTime() >= tanggalBerakhir.getTime()) {
      errors.value.tanggal_berlaku_visa =
        'Tanggal Berlaku Visa tidak boleh dibawah Tanggal Berakhir Visa';
      isValid = false;
    }
  }
  return isValid;
};

// Placeholder submit function
async function saveData() {
  if (!validateForm()) return;

  showConfirmation(
    'Konfirmasi Update Visa',
    'Apakah Anda yakin ingin menyimpan perubahan ini?',
    async () => {
      isLoading.value = true;

      try {
        const payload = {
          id: props.paketId,
          transpaketId: props.transpaketId,
          division_id: props.cabangId,
          nomor_visa: form.nomor_visa,
          tanggal_berlaku_visa: form.tanggal_berlaku_visa,
          tanggal_berakhir_visa: form.tanggal_berakhir_visa,
        };

        console.log(payload);
        const response = await updateVisaTransaksiPaket(payload);
        emit('status', { error: false, err_msg: response.message || 'Visa berhasil diupdate' });
        emit('close');
      } catch (error: any) {
        emit('status', {
          error: true,
          err_msg:
            error.response.data.error_msg ||
            error.response.data.message ||
            'Terjadi kesalahan saat menyimpan data.',
        });
      } finally {
        isLoading.value = false;
      }
    },
  );
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <!-- Loading Spinner -->
  <div
    v-if="isLoading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
  </div>

  <!-- Modal -->
  <div
    v-if="props.isFormEditVisaOpen && !isLoading"
    class="fixed inset-0 z-50 overflow-y-auto"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex min-h-screen items-end justify-center px-6 pt-6 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="$emit('close')"
      ></div>
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true"
        >&#8203;</span
      >
      <div
        class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle p-6"
      >
        <!-- Title -->
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Form Update Informasi Visa</h3>
        <div class="overflow-y-auto no-scrollbar px-1">
          <div class="space-y-4 text-gray-800 sm:min-h-[320px]">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nomor Visa
                <span class="text-red-600">*</span>
              </label>
              <input
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Masukkan nomor visa"
                v-model="form.nomor_visa"
              />
              <p v-if="errors.nomor_visa" class="mt-1 text-sm text-red-600">
                {{ errors.nomor_visa }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Berlaku Visa
                <span class="text-red-600">*</span>
              </label>
              <input
                type="date"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Masukkan tanggal berlaku visa"
                v-model="form.tanggal_berlaku_visa"
              />
              <p v-if="errors.tanggal_berlaku_visa" class="mt-1 text-sm text-red-600">
                {{ errors.tanggal_berlaku_visa }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Berakhir Visa
                <span class="text-red-600">*</span>
              </label>
              <input
                type="date"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Masukkan tanggal berakhir visa"
                v-model="form.tanggal_berakhir_visa"
              />
              <p v-if="errors.tanggal_berakhir_visa" class="mt-1 text-sm text-red-600">
                {{ errors.tanggal_berakhir_visa }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
          <PrimaryButton @click="saveData()">UPDATE VISA</PrimaryButton>
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

  <!-- Notifikasi -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />

  <!-- Konfirmasi -->
  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <button
      @click="confirmAction && confirmAction()"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Ya
    </button>
    <button
      @click="showConfirmDialog = false"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
    >
      Tidak
    </button>
  </Confirmation>
</template>
