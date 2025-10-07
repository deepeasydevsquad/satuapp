<script setup lang="ts">
import Notification from '@/modules/TabunganUmrah/Particle/Notification.vue';
import Confirmation from '@/modules/TabunganUmrah/Particle/Confirmation.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';

import { onMounted, reactive, ref } from 'vue';
import { MenabungTabunganUmrah, getInfoMenabungTabunganUmrah } from '@/service/tabungan_umrah';

const props = defineProps<{
  isFormMenabungOpen: boolean;
  tabunganId: number;
  cabangId: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; err_msg?: string }): void;
}>();

// Interfaces
interface ErrorFields {
  sumber_dana: string;
  biaya_deposit: string;
  info_deposit: string;
}
interface dataTabungan {
  id: number;
  member: {
    fullname: string;
    identity_number: string;
    birth_place: string;
    birth_date: string;
  };
}

const dataTabungan = ref<dataTabungan>();
const isLoading = ref(false);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('');
const timeoutId = ref<number | null>(null);

const showConfirmDialog = ref<boolean>(false);
const confirmMessage = ref<string>('');
const confirmTitle = ref<string>('Konfirmasi');
const confirmAction = ref<(() => void) | null>(null);

const errors = ref<ErrorFields>({
  sumber_dana: '',
  biaya_deposit: '',
  info_deposit: '',
});

const form = reactive({
  sumber_dana: 'cash',
  biaya_deposit: 0,
  info_deposit: '',
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

// Function: Confirmation
const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

// Function: Fetch Data
const fetchData = async () => {
  if (!props.tabunganId) {
    displayNotification('ID tabungan tidak ditemukan, silakan keluar dan masuk kembali.', 'error');
    return;
  }

  try {
    isLoading.value = true;
    const response = await getInfoMenabungTabunganUmrah(props.tabunganId);
    dataTabungan.value = response.data;
  } catch (error) {
    displayNotification(
      error?.response?.data?.error_msg || 'Terjadi kesalahan dalam mengambil data tabungan',
      'error',
    );
  } finally {
    isLoading.value = false;
  }
};

// Function: Validasi form
const validateForm = (): boolean => {
  let isValid = true;
  errors.value = {
    sumber_dana: '',
    biaya_deposit: '',
    info_deposit: '',
  };

  if (!props.tabunganId || !props.cabangId) {
    displayNotification(
      'ID tabungan atau cabang tidak ditemukan, silakan keluar dan masuk kembali.',
      'error',
    );
    isValid = false;
  }

  if (!form.sumber_dana) {
    errors.value.sumber_dana = 'Sumber Dana wajib dipilih';
    isValid = false;
  }

  if (!form.biaya_deposit) {
    errors.value.biaya_deposit = 'Nominal Deposit wajib diisi';
    isValid = false;
  }

  if (!form.info_deposit) {
    errors.value.info_deposit = 'Informasi Deposit wajib diisi';
    isValid = false;
  }

  return isValid;
};

// Save Data
const saveData = async () => {
  if (!validateForm()) return;
  showConfirmation(
    'Konfirmasi Menabung Tabungan Umrah',
    `Apakah Anda yakin ingin menabung sebesar ${formatPrice(form.biaya_deposit)}?`,
    async () => {
      try {
        isLoading.value = true;
        const payload: {
          id: number;
          division_id: number;
          sumber_dana: string;
          biaya_deposit: number;
          info_deposit: string;
        } = {
          id: props.tabunganId,
          division_id: props.cabangId,
          sumber_dana: form.sumber_dana,
          biaya_deposit: form.biaya_deposit,
          info_deposit: form.info_deposit,
        };

        const response = await MenabungTabunganUmrah(payload);
        emit('close');
        emit('status', {
          error: false,
          err_msg: response.error_msg || 'Menabung berhasil disimpan',
        });
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

onMounted(() => {
  fetchData();
});

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
    v-if="props.isFormMenabungOpen && !isLoading"
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
            Form Menabung Tabungan Umrah
          </h3>
          <!-- Form Input -->
          <div class="space-y-4 text-gray-800">
            <!-- Data Member -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Data Member</label>
              <div class="p-3 border border-gray-200 rounded-md bg-gray-50">
                <p class="text-sm font-semibold text-gray-800">
                  {{ dataTabungan?.member.fullname || '-' }}
                </p>
                <p class="text-sm text-gray-600">
                  Nomor Identitas: {{ dataTabungan?.member.identity_number || '-' }}
                </p>
                <p class="text-sm text-gray-600">
                  Tempat / Tgl Lahir:
                  {{
                    `${dataTabungan?.member.birth_place || '-'} / ${dataTabungan?.member.birth_date || '-'}`
                  }}
                </p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Sumber Dana
                <span class="text-red-600">*</span>
              </label>
              <select
                v-model="form.sumber_dana"
                class="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                :error="errors.sumber_dana"
              >
                <option value="" disabled>Pilih Sumber Dana</option>
                <option value="cash" selected>Cash</option>
                <option value="deposit">Deposit</option>
              </select>
              <p v-if="errors.sumber_dana" class="mt-1 text-sm text-red-600">
                {{ errors.sumber_dana }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Biaya Deposit
                <span class="text-red-600">*</span>
              </label>
              <input
                type="text"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Biaya Deposit"
                :value="form.biaya_deposit ? formatPrice(form.biaya_deposit) : ''"
                @input="form.biaya_deposit = unformatPrice($event.target.value)"
              />
              <p v-if="errors.biaya_deposit" class="mt-1 text-sm text-red-600">
                {{ errors.biaya_deposit }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700"> Informasi Deposit </label>
              <textarea
                v-model="form.info_deposit"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-600 font-normal"
                placeholder="Informasi Deposit"
              ></textarea>
              <p v-if="errors.info_deposit" class="mt-1 text-sm text-red-600">
                {{ errors.info_deposit }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 pb-3 pt-6 sm:flex sm:flex-row-reverse sm:px-0 gap-2">
          <PrimaryButton @click="saveData()">TAMBAH DEPOSIT</PrimaryButton>
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
  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
