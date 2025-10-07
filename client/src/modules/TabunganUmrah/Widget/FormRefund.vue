<script setup lang="ts">
import Notification from '@/modules/TabunganUmrah/Particle/Notification.vue';
import Confirmation from '@/modules/TabunganUmrah/Particle/Confirmation.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';

import { onMounted, reactive, ref } from 'vue';
import { RefundTabunganUmrah, getInfoRefundTabunganUmrah } from '@/service/tabungan_umrah';

const props = defineProps<{
  isFormRefundOpen: boolean;
  tabunganId: number;
  cabangId: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
}>();

// Interfaces
interface ErrorFields {
  refund_nominal?: string;
}
interface dataTabungan {
  id: number;
  total_tabungan: number;
  batal_berangkat: boolean;
}

const isLoading = ref(false);
const showConfirmDialog = ref<boolean>(false);
const dataTabungan = ref<dataTabungan | null>(null);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('');
const confirmAction = ref<(() => void) | null>(null);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('');
const timeoutId = ref<number | null>(null);

const errors = ref<ErrorFields>({
  refund_nominal: '',
});

interface RefundForm {
  refund_nominal: number;
  batal_berangkat: boolean;
}

const form = reactive<RefundForm>({
  refund_nominal: 0,
  batal_berangkat: false,
});

// Function: Notification
const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const fetchData = async () => {
  if (!props.tabunganId) {
    displayNotification('ID tabungan tidak ditemukan, silakan keluar dan masuk kembali.', 'error');
    return;
  }

  try {
    isLoading.value = true;
    const response = await getInfoRefundTabunganUmrah(props.tabunganId);
    dataTabungan.value = response.data;
    form.batal_berangkat = dataTabungan.value?.batal_berangkat;
  } catch (error) {
    displayNotification(
      error?.response?.data?.error_msg || 'Terjadi kesalahan dalam mengambil data',
      'error',
    );
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Function: Confirmation
const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

// Function: Validasi form
const validateForm = (): boolean => {
  let isValid = true;
  errors.value = {
    refund_nominal: '',
  };

  if (!props.tabunganId) {
    displayNotification('ID tabungan tidak ditemukan, silakan keluar dan masuk kembali.', 'error');
    isValid = false;
  }

  if (!props.cabangId) {
    displayNotification('ID cabang tidak ditemukan, silakan keluar dan masuk kembali.', 'error');
    isValid = false;
  }

  if (!form.refund_nominal) {
    errors.value.refund_nominal = 'Nominal Refund wajib diisi';
    isValid = false;
  }

  if (form.refund_nominal > (dataTabungan.value?.total_tabungan || 0)) {
    displayNotification('Nominal Refund tidak boleh lebih besar dari total tabungan', 'error');
    isValid = false;
  }

  return isValid;
};

// Save Data (contoh)
const saveData = async () => {
  if (!validateForm()) return;
  showConfirmation(
    'Konfirmasi Refund',
    `Apakah Anda yakin ingin melakukan refund sebesar ${formatPrice(form.refund_nominal)}?`,
    async () => {
      try {
        isLoading.value = true;
        const payload: {
          id: number;
          division_id: number;
          refund_nominal: number;
          batal_berangkat: number;
        } = {
          id: props.tabunganId,
          division_id: props.cabangId,
          refund_nominal: form.refund_nominal,
          batal_berangkat: form.batal_berangkat ? 1 : 0,
        };

        const response = await RefundTabunganUmrah(payload);
        emit('close');
        emit('status', { error: false, err_msg: response.error_msg || 'Refund berhasil disimpan' });
      } catch (error) {
        displayNotification(
          error?.response?.data?.error_msg ||
            error?.response?.data?.message ||
            'Terjadi kesalahan dalam menyimpan data',
          'error',
        );
      } finally {
        isLoading.value = false;
      }
    },
  );
};

// Fungsi format harga (Rp, titik ribuan)
const formatPrice = (value: number | string): string => {
  const numericString = String(value).replace(/[^\d]/g, '');
  const numericValue = parseInt(numericString, 10) || 0;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};

// Fungsi untuk ambil angka asli (unformat Rp)
const unformatPrice = (formatted: string): number => {
  return parseInt(formatted.replace(/[^\d]/g, ''), 10) || 0;
};
</script>

<template>
  <div
    v-if="isLoading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
  </div>
  <div
    v-if="props.isFormRefundOpen && !isLoading"
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
        <div class="bg-white">
          <h3 class="text-2xl flex font-bold leading-6 text-gray-900 mb-4">
            Form Refund Tabungan Umrah
          </h3>
          <!-- Form Input -->
          <div class="space-y-4 text-gray-800">
            <!-- Data Member -->
            <div class="mb-6">
              <div
                class="mt-4 p-3 border border-yellow-200 bg-yellow-50 rounded-md text-sm text-yellow-800"
              >
                Total tabungan yang dapat direfund :
                <strong>{{ formatPrice(dataTabungan?.total_tabungan) }}</strong>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nominal Refund
                <span class="text-red-600">*</span>
              </label>
              <input
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Masukkan nominal refund"
                inputmode="numeric"
                pattern="\d*"
                :value="form.refund_nominal ? formatPrice(form.refund_nominal) : ''"
                @input="form.refund_nominal = unformatPrice($event.target.value)"
              />
              <p v-if="errors.refund_nominal" class="mt-1 text-sm text-red-600">
                {{ errors.refund_nominal }}
              </p>
            </div>
            <div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Batal Berangkat
                  <span class="text-red-600">*</span>
                </label>
                <div class="flex items-center space-x-2">
                  <input
                    id="batal_berangkat"
                    type="checkbox"
                    v-model="form.batal_berangkat"
                    class="w-4 h-4 rounded-sm border-2 border-gray-400 text-blue-500 focus:ring-blue-500"
                  />
                  <label for="batal_berangkat" class="text-sm font-medium text-gray-700"
                    >Batal Berangkat</label
                  >
                </div>
                <p v-if="errors.batal_berangkat" class="mt-1 text-sm text-red-600">
                  {{ errors.batal_berangkat }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
          <PrimaryButton @click="saveData()">REFUND TABUNGAN</PrimaryButton>
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
  <!-- Confirmation Dialog -->
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
